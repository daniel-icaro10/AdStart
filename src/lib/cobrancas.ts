/**
 * Avisos de cobrança por WhatsApp: encontra clientes ATIVOS perto do vencimento
 * e dispara mensagem para o cliente e para a agência (nosso número).
 *
 * Dois lembretes por ciclo: "3 dias antes" (avisoPreEm) e "no dia/vencido"
 * (avisoDiaEm) — idempotentes por data de vencimento. Clientes com o vencimento
 * marcado como PAGO (pagoVencimentoEm) não recebem aviso automático.
 */
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { sendWhatsapp, normalizePhone } from "@/lib/whatsapp-send";

/** Antecedência do aviso "antecipado" (configurável por env; default 3 dias). */
export const AVISO_DIAS = Number(process.env.AVISO_DIAS_ANTES ?? "3") || 3;

const DIA_MS = 86_400_000;

export interface CobrancaParaAvisar {
  id: string;
  nome: string;
  contato: string | null;
  valorMensal: number | null;
  dataVencimento: Date;
  planoNome: string | null;
  diasAteVencimento: number;
}

type TipoAviso = "pre" | "dia";
interface AvisoPendente {
  cob: CobrancaParaAvisar;
  tipo: TipoAviso;
}

function diasAte(d: Date): number {
  const alvo = new Date(d);
  alvo.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / DIA_MS);
}

const fmtData = (d: Date) =>
  d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function quando(dias: number): string {
  if (dias > 1) return `em ${dias} dias`;
  if (dias === 1) return "amanhã";
  if (dias === 0) return "hoje";
  return `há ${-dias} dia(s) (vencida)`;
}

function mesmaData(a: Date | null, b: Date): boolean {
  return a != null && a.getTime() === b.getTime();
}

export function mensagemCliente(c: CobrancaParaAvisar): string {
  const plano = c.planoNome ? ` do ${c.planoNome}` : "";
  const valor =
    c.valorMensal != null ? ` de ${formatCurrency(c.valorMensal, "BRL")}` : "";
  return [
    `Olá, ${c.nome}! 👋`,
    "",
    `Passando pra lembrar que sua mensalidade${plano}${valor} vence ${quando(
      c.diasAteVencimento,
    )} (${fmtData(c.dataVencimento)}).`,
    "",
    "Obrigado por continuar com a gente! Estou por aqui para o que precisar.",
    "Caso já tenha pago, pode desconsiderar este aviso. 😉",
  ].join("\n");
}

export function mensagemAgencia(c: CobrancaParaAvisar): string {
  const plano = c.planoNome ? ` · ${c.planoNome}` : "";
  const valor =
    c.valorMensal != null ? ` · ${formatCurrency(c.valorMensal, "BRL")}` : "";
  return `🔔 Cobrança a vencer: *${c.nome}*${plano}${valor} — vence ${quando(
    c.diasAteVencimento,
  )} (${fmtData(c.dataVencimento)}). Contato: ${c.contato ?? "—"}`;
}

/**
 * Lembretes a enviar agora: clientes ATIVO, não pagos, no ponto "3 dias antes"
 * (1..AVISO_DIAS) ou "no dia/vencido" (≤ 0), cada etapa só uma vez por ciclo.
 */
export async function getAvisosPendentes(): Promise<AvisoPendente[]> {
  const clientes = await prisma.client.findMany({
    where: { status: "ATIVO", dataVencimento: { not: null } },
    include: { plan: { select: { nome: true } } },
  });

  const pendentes: AvisoPendente[] = [];
  for (const c of clientes) {
    const venc = c.dataVencimento;
    if (!venc) continue;
    // pago para este vencimento → não avisa
    if (mesmaData(c.pagoVencimentoEm, venc)) continue;

    const dias = diasAte(venc);
    const cob: CobrancaParaAvisar = {
      id: c.id,
      nome: c.nome,
      contato: c.contato,
      valorMensal: c.valorMensal,
      dataVencimento: venc,
      planoNome: c.plan?.nome ?? null,
      diasAteVencimento: dias,
    };

    if (dias >= 1 && dias <= AVISO_DIAS && !mesmaData(c.avisoPreEm, venc)) {
      pendentes.push({ cob, tipo: "pre" });
    } else if (dias <= 0 && !mesmaData(c.avisoDiaEm, venc)) {
      pendentes.push({ cob, tipo: "dia" });
    }
  }
  return pendentes;
}

export interface ResultadoAvisos {
  clientes: number;
  enviados: number;
  erros: string[];
}

/** Dispara os lembretes pendentes (cliente + agência) e marca a etapa enviada. */
export async function enviarAvisosCobranca(): Promise<ResultadoAvisos> {
  const pendentes = await getAvisosPendentes();
  const agencia = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const erros: string[] = [];
  let enviados = 0;

  for (const { cob, tipo } of pendentes) {
    let algumOk = false;

    const fone = normalizePhone(cob.contato);
    if (fone) {
      const r = await sendWhatsapp(fone, mensagemCliente(cob));
      if (r.ok) {
        enviados++;
        algumOk = true;
      } else {
        erros.push(`cliente ${cob.nome}: ${r.error}`);
      }
    }

    if (agencia) {
      const r = await sendWhatsapp(agencia, mensagemAgencia(cob));
      if (r.ok) {
        enviados++;
        algumOk = true;
      } else {
        erros.push(`agência (${cob.nome}): ${r.error}`);
      }
    }

    if (algumOk) {
      await prisma.client.update({
        where: { id: cob.id },
        data:
          tipo === "pre"
            ? { avisoPreEm: cob.dataVencimento }
            : { avisoDiaEm: cob.dataVencimento },
      });
    }
  }

  return { clientes: pendentes.length, enviados, erros };
}

/** Envia o aviso para UM cliente específico (manual, só o cliente — ignora "pago"). */
export async function enviarAvisoParaCliente(
  clientId: string,
): Promise<{ ok: boolean; error?: string }> {
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    include: { plan: { select: { nome: true } } },
  });
  if (!c) return { ok: false, error: "Cliente não encontrado." };
  if (!c.dataVencimento) {
    return { ok: false, error: "Cliente sem data de vencimento." };
  }
  const fone = normalizePhone(c.contato);
  if (!fone) {
    return { ok: false, error: "Sem WhatsApp válido no contato do cliente." };
  }
  const cob: CobrancaParaAvisar = {
    id: c.id,
    nome: c.nome,
    contato: c.contato,
    valorMensal: c.valorMensal,
    dataVencimento: c.dataVencimento,
    planoNome: c.plan?.nome ?? null,
    diasAteVencimento: diasAte(c.dataVencimento),
  };
  return sendWhatsapp(fone, mensagemCliente(cob));
}
