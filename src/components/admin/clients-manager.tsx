"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  CalendarClock,
  KeyRound,
  Phone,
  BellRing,
  CircleDollarSign,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientForm } from "@/components/admin/client-form";
import { ClientLedger } from "@/components/admin/client-ledger";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  deleteClient,
  dispararAvisosCobranca,
  enviarAvisoCliente,
  registrarPagamento,
} from "@/app/admin/actions";
import { formatCurrency } from "@/lib/format";
import type { ClientWithPlan } from "@/types";
import type { RentalPlan } from "@prisma/client";

const STATUS_META: Record<string, { label: string; className: string }> = {
  ATIVO: {
    label: "Ativo",
    className: "border-positive/30 bg-positive/15 text-positive",
  },
  PAUSADO: {
    label: "Pausado",
    className: "border-warning/30 bg-warning/15 text-warning",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "border-border bg-muted text-muted-foreground",
  },
};

type Tone = "negative" | "warning" | "muted";

const DIA_MS = 86_400_000;

function vencimentoInfo(d: Date | string | null): { label: string; tone: Tone } {
  if (!d) return { label: "Sem vencimento", tone: "muted" };
  const alvo = new Date(d);
  alvo.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / DIA_MS);
  const data = new Date(d).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  if (dias < 0) return { label: `Vencido há ${-dias}d · ${data}`, tone: "negative" };
  if (dias === 0) return { label: `Vence hoje · ${data}`, tone: "warning" };
  if (dias <= 7) return { label: `Vence em ${dias}d · ${data}`, tone: "warning" };
  return { label: `Vence ${data}`, tone: "muted" };
}

const TONE_CLASS: Record<Tone, string> = {
  negative: "text-negative",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

/** Avança uma data em 1 mês (UTC), mantendo o dia (clamp no fim do mês). */
function avancarUmMes(d: Date): Date {
  const dia = d.getUTCDate();
  const r = new Date(d);
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + 1);
  const ultimoDia = new Date(
    Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0),
  ).getUTCDate();
  r.setUTCDate(Math.min(dia, ultimoDia));
  return r;
}

/**
 * CRM simples de aluguéis: board de clientes com vencimento, plano e status.
 * Cada card abre um painel de edição (modal); "Novo cliente" abre em branco.
 */
export function ClientsManager({
  clients,
  plans,
}: {
  clients: ClientWithPlan[];
  plans: RentalPlan[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<ClientWithPlan | undefined>(
    undefined,
  );

  const registrarPago = async (e: React.MouseEvent, c: ClientWithPlan) => {
    e.stopPropagation();
    if (!c.dataVencimento) {
      window.alert("Defina uma data de vencimento antes de registrar o pagamento.");
      return;
    }
    const prox = avancarUmMes(new Date(c.dataVencimento));
    const proxStr = prox.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    if (
      !window.confirm(
        `Registrar pagamento de ${c.nome}?\nO vencimento avança para ${proxStr} e lança "pago" na planilha.`,
      )
    )
      return;
    const r = await registrarPagamento(c.id);
    if (r.ok) router.refresh();
    else window.alert("Erro: " + r.error);
  };

  const [avisandoId, setAvisandoId] = React.useState<string | null>(null);
  const avisarUm = async (
    e: React.MouseEvent,
    id: string,
    nome: string,
  ) => {
    e.stopPropagation();
    if (!window.confirm(`Enviar aviso de cobrança no WhatsApp para ${nome}?`))
      return;
    setAvisandoId(id);
    const r = await enviarAvisoCliente(id);
    setAvisandoId(null);
    window.alert(
      r.ok ? `Aviso enviado para ${nome}. ✅` : `Não enviou: ${r.error}`,
    );
  };

  const [avisando, setAvisando] = React.useState(false);
  const enviarAvisos = async () => {
    setAvisando(true);
    const r = await dispararAvisosCobranca();
    setAvisando(false);
    if (!r.ok) {
      window.alert("Erro ao enviar avisos: " + r.error);
      return;
    }
    const base = `${r.enviados} mensagem(ns) enviada(s) para ${r.clientes} cobrança(s) a vencer.`;
    window.alert(
      r.erros.length ? `${base}\n\nFalhas:\n- ${r.erros.join("\n- ")}` : base,
    );
    router.refresh();
  };

  const openNew = () => {
    setCurrent(undefined);
    setOpen(true);
  };
  const openEdit = (client: ClientWithPlan) => {
    setCurrent(client);
    setOpen(true);
  };
  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const renderCard = (c: ClientWithPlan) => {
    const status = STATUS_META[c.status] ?? STATUS_META.ATIVO;
    const venc = vencimentoInfo(c.dataVencimento);
    return (
      <div
        key={c.id}
        role="button"
        tabIndex={0}
        onClick={() => openEdit(c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEdit(c);
          }
        }}
        className="group relative cursor-pointer rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Registrar pagamento"
            title="Registrar pagamento (avança o vencimento +1 mês)"
            onClick={(e) => registrarPago(e, c)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-positive"
          >
            <CircleDollarSign className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Enviar aviso"
            title="Enviar aviso de cobrança (WhatsApp) para este cliente"
            disabled={avisandoId === c.id}
            onClick={(e) => avisarUm(e, c.id, c.nome)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {avisandoId === c.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4" />
            )}
          </button>
          <DeleteButton id={c.id} label={c.nome} action={deleteClient} />
        </span>

        <div className="flex flex-wrap items-center gap-1.5 pr-8">
          <Badge className={cn("border", status.className)}>{status.label}</Badge>
          <Badge variant="secondary" className="gap-1">
            <KeyRound className="h-3 w-3" />
            {c.plan?.nome ?? "Sem plano"}
          </Badge>
        </div>

        <h3 className="mt-3 font-semibold leading-snug">{c.nome}</h3>

        {c.contato && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {c.contato}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Mensalidade
            </div>
            <div className="text-lg font-bold tabular-nums">
              {c.valorMensal != null ? formatCurrency(c.valorMensal, "BRL") : "—"}
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              TONE_CLASS[venc.tone],
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {venc.label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} cliente(s). Clique em um card para editar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={enviarAvisos}
            disabled={avisando}
            title="Envia agora os avisos de cobrança a vencer (WhatsApp)"
          >
            {avisando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4" />
            )}
            Enviar avisos
          </Button>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40">
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado ainda."
            className="py-16"
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" />
                Novo cliente
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map(renderCard)}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {current ? `Editar · ${current.nome}` : "Novo cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            key={current?.id ?? "new"}
            client={current}
            plans={plans}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
          {current && (
            <div className="mt-2 border-t border-border pt-4">
              <ClientLedger
                key={`ledger-${current.id}`}
                clientId={current.id}
                initialEntries={current.entries}
                initialNotes={current.observacoes ?? ""}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
