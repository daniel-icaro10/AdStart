"use client";

import * as React from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import {
  addClientEntry,
  updateClientEntry,
  deleteClientEntry,
} from "@/app/admin/actions";
import type { ClientEntry } from "@prisma/client";

interface Row {
  id: string;
  data: string;
  descricao: string;
  valor: string;
  status: string;
}

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
 * Planilha editável de um cliente (pagamentos/histórico). Cada linha auto-salva
 * ao sair do campo; estado local para não depender de refresh do modal.
 */
export function ClientLedger({
  clientId,
  initialEntries,
}: {
  clientId: string;
  initialEntries: ClientEntry[];
}) {
  const [rows, setRows] = React.useState<Row[]>(() =>
    initialEntries.map(toRow),
  );
  const [busy, setBusy] = React.useState(false);
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;

  const patchLocal = (id: string, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const saveById = async (id: string) => {
    const row = rowsRef.current.find((r) => r.id === id);
    if (!row) return;
    await updateClientEntry({
      id: row.id,
      data: row.data,
      descricao: row.descricao,
      valor: row.valor,
      status: row.status,
    });
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

  const total = rows.reduce((s, r) => s + (parseFloat(r.valor) || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Planilha do cliente</h4>
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
        <p className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
          Sem lançamentos. Use “Nova linha” para registrar pagamentos/histórico.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-accent/50 text-left text-xs text-muted-foreground">
                <th className="px-2 py-1.5 font-medium">Data</th>
                <th className="px-2 py-1.5 font-medium">Descrição</th>
                <th className="px-2 py-1.5 text-right font-medium">Valor (R$)</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
                <th className="w-8 px-1 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-1 py-1">
                    <Input
                      type="date"
                      value={row.data}
                      className="h-8 w-[140px]"
                      onChange={(e) => patchLocal(row.id, { data: e.target.value })}
                      onBlur={() => saveById(row.id)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <Input
                      value={row.descricao}
                      placeholder="Ex: mensalidade"
                      className="h-8 min-w-[140px]"
                      onChange={(e) =>
                        patchLocal(row.id, { descricao: e.target.value })
                      }
                      onBlur={() => saveById(row.id)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.valor}
                      className="h-8 w-[110px] text-right"
                      onChange={(e) =>
                        patchLocal(row.id, { valor: e.target.value })
                      }
                      onBlur={() => saveById(row.id)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <Input
                      value={row.status}
                      placeholder="pago / pendente"
                      className="h-8 w-[120px]"
                      onChange={(e) =>
                        patchLocal(row.id, { status: e.target.value })
                      }
                      onBlur={() => saveById(row.id)}
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
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
              <tr className="border-t border-border bg-card/40">
                <td className="px-2 py-1.5 text-xs text-muted-foreground" colSpan={2}>
                  {rows.length} lançamento(s)
                </td>
                <td className="px-2 py-1.5 text-right text-sm font-semibold tabular-nums">
                  {formatCurrency(total, "BRL")}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
