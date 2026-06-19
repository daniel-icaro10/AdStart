/**
 * Avisos de cobrança por WhatsApp: encontra clientes ATIVOS perto do vencimento
 * e dispara mensagem para o cliente e para a agência (nosso número).
 * Idempotente via Client.avisoVencimentoEm (não reenvia o mesmo aviso).
 */
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { sendWhatsapp, normalizePhone } from "@/lib/whatsapp-send";

/** Dias de antecedência do aviso (configurável por env; default 3). */
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

/**
 * Clientes ATIVO cujo vencimento está a ≤ `dias` dias e que ainda não receberam
 * aviso para essa data de vencimento.
 */
export async function getCobrancasParaAvisar(
  dias = AVISO_DIAS,
): Promise<CobrancaParaAvisar[]> {
  const cutoff = new Date(Date.now() + dias * DIA_MS);
  const clientes = await prisma.client.findMany({
    where: { status: "ATIVO", dataVencimento: { not: null, lte: cutoff } },
    include: { plan: { select: { nome: true } } },
  });
  return clientes
    .filter((c) => c.dataVencimento != null)
    .filter(
      (c) =>
        c.avisoVencimentoEm == null ||
        c.avisoVencimentoEm.getTime() !== c.dataVencimento!.getTime(),
    )
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      contato: c.contato,
      valorMensal: c.valorMensal,
      dataVencimento: c.dataVencimento!,
      planoNome: c.plan?.nome ?? null,
      diasAteVencimento: diasAte(c.dataVencimento!),
    }));
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
    "Qualquer dúvida é só chamar por aqui. 🙌",
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

export interface ResultadoAvisos {
  clientes: number;
  enviados: number;
  erros: string[];
}

/**
 * Dispara os avisos: para cada cobrança, manda ao cliente e à agência, e marca
 * a data de vencimento como avisada (só se algo foi enviado — falha tenta de novo).
 */
export async function enviarAvisosCobranca(): Promise<ResultadoAvisos> {
  const cobrancas = await getCobrancasParaAvisar();
  const agencia = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const erros: string[] = [];
  let enviados = 0;

  for (const c of cobrancas) {
    let algumOk = false;

    const fone = normalizePhone(c.contato);
    if (fone) {
      const r = await sendWhatsapp(fone, mensagemCliente(c));
      if (r.ok) {
        enviados++;
        algumOk = true;
      } else {
        erros.push(`cliente ${c.nome}: ${r.error}`);
      }
    }

    if (agencia) {
      const r = await sendWhatsapp(agencia, mensagemAgencia(c));
      if (r.ok) {
        enviados++;
        algumOk = true;
      } else {
        erros.push(`agência (${c.nome}): ${r.error}`);
      }
    }

    if (algumOk) {
      await prisma.client.update({
        where: { id: c.id },
        data: { avisoVencimentoEm: c.dataVencimento },
      });
    }
  }

  return { clientes: cobrancas.length, enviados, erros };
}
