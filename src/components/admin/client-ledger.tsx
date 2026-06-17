"use client";

import * as React from "react";
import { Plus, Trash2, Loader2, Check, NotebookPen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import {
  addClientEntry,
  updateClientEntry,
  deleteClientEntry,
  updateClientNotes,
} from "@/app/admin/actions";
import type { ClientEntry } from "@prisma/client";

interface Row {
  id: string;
  data: string;
  descricao: string;
  valor: string;
  status: string;
}

const STATUS: Record<string, { label: string; dot: string; text: string }> = {
  none: { label: "—", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  pago: { label: "Pago", dot: "bg-positive", text: "text-positive" },
  pendente: { label: "Pendente", dot: "bg-warning", text: "text-warning" },
  atrasado: { label: "Atrasado", dot: "bg-negative", text: "text-negative" },
};
const statusKey = (s: string) => (STATUS[s] ? s : "none");

function toRow(e: ClientEntry): Row {
  return {
    id: e.id,
    data: e.data ? new Date(e.data).toISOString().slice(0, 10) : "",
    descricao: e.descricao ?? "",
    valor: e.valor != null ? String(e.valor) : "",
    status: e.status ?? "",
  };
}

/**
 * Espaço de trabalho do cliente: uma planilha profissional (linhas com data,
 * descrição, valor e status colorido + total) e um bloco de anotações livres.
 * Tudo auto-salva.
 */
export function ClientLedger({
  clientId,
  initialEntries,
  initialNotes,
}: {
  clientId: string;
  initialEntries: ClientEntry[];
  initialNotes: string;
}) {
  const [rows, setRows] = React.useState<Row[]>(() =>
    initialEntries.map(toRow),
  );
  const [busy, setBusy] = React.useState(false);
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;

  const [notes, setNotes] = React.useState(initialNotes ?? "");
  const [notesState, setNotesState] = React.useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const patchLocal = (id: string, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const persist = async (row: Row) => {
    await updateClientEntry({
      id: row.id,
      data: row.data,
      descricao: row.descricao,
      valor: row.valor,
      status: row.status,
    });
  };
  const persistById = (id: string) => {
    const row = rowsRef.current.find((r) => r.id === id);
    if (row) void persist(row);
  };

  const add = async () => {
    setBusy(true);
    const res = await addClientEntry(clientId);
    setBusy(false);
    if (res.ok && res.id) {
      setRows((r) => [
        ...r,
        { id: res.id as string, data: "", descricao: "", valor: "", status: "" },
      ]);
    }
  };

  const remove = async (id: string) => {
    setRows((r) => r.filter((x) => x.id !== id));
    await deleteClientEntry(id);
  };

  const onStatus = (row: Row, v: string) => {
    const stored = v === "none" ? "" : v;
    patchLocal(row.id, { status: stored });
    void persist({ ...row, status: stored });
  };

  const saveNotes = async () => {
    setNotesState("saving");
    await updateClientNotes(clientId, notes);
    setNotesState("saved");
    setTimeout(() => setNotesState("idle"), 1500);
  };

  const total = rows.reduce((s, r) => s + (parseFloat(r.valor) || 0), 0);

  return (
    <div className="space-y-5">
      {/* ── Planilha ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Planilha</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Nova linha
          </Button>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/40 p-5 text-center text-xs text-muted-foreground">
            Sem lançamentos. Use “Nova linha” para registrar pagamentos e
            histórico do cliente.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-accent/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Descrição</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="w-9 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-t border-border transition-colors hover:bg-accent/30",
                        i % 2 === 1 && "bg-card/40",
                      )}
                    >
                      <td className="px-2 py-1.5">
                        <Input
                          type="date"
                          value={row.data}
                          className="h-8 w-[140px] border-transparent bg-transparent hover:border-border focus:border-border"
                          onChange={(e) =>
                            patchLocal(row.id, { data: e.target.value })
                          }
                          onBlur={() => persistById(row.id)}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          value={row.descricao}
                          placeholder="Ex: mensalidade junho"
                          className="h-8 min-w-[160px] border-transparent bg-transparent hover:border-border focus:border-border"
                          onChange={(e) =>
                            patchLocal(row.id, { descricao: e.target.value })
                          }
                          onBlur={() => persistById(row.id)}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.valor}
                            placeholder="0,00"
                            className="h-8 w-[100px] border-transparent bg-transparent text-right hover:border-border focus:border-border"
                            onChange={(e) =>
                              patchLocal(row.id, { valor: e.target.value })
                            }
                            onBlur={() => persistById(row.id)}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <Select
                          value={statusKey(row.status)}
                          onValueChange={(v) => onStatus(row, v)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  STATUS[statusKey(row.status)].dot,
                                )}
                              />
                              <span className={STATUS[statusKey(row.status)].text}>
                                {STATUS[statusKey(row.status)].label}
                              </span>
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS).map(([v, meta]) => (
                              <SelectItem key={v} value={v}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "h-2 w-2 rounded-full",
                                      meta.dot,
                                    )}
                                  />
                                  {meta.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          aria-label="Remover linha"
                          onClick={() => remove(row.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-accent/40">
                    <td
                      className="px-3 py-2 text-xs text-muted-foreground"
                      colSpan={2}
                    >
                      {rows.length} lançamento(s)
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold tabular-nums">
                      {formatCurrency(total, "BRL")}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Anotações ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <NotebookPen className="h-4 w-4 text-muted-foreground" />
            Anotações
          </h4>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {notesState === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> salvando…
              </>
            )}
            {notesState === "saved" && (
              <>
                <Check className="h-3 w-3 text-positive" /> salvo
              </>
            )}
          </span>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={6}
          placeholder={
            "Anotações livres sobre o cliente — combinados, histórico, preferências de pagamento, etc.\nSalva automaticamente ao sair do campo."
          }
          className="min-h-[140px] text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
