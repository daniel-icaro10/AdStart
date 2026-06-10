import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FornecedorRank } from "@/lib/dashboard";

const brl = (v: number) => formatCurrency(v, "BRL");

/** Ranking de fornecedores por lucro gerado × perdas. */
export function DashboardFornecedores({ rows }: { rows: FornecedorRank[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border p-4 text-sm font-semibold">
        <Trophy className="h-4 w-4 text-warning" />
        Fornecedores — lucro × perdas
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sem vendas/perdas com fornecedor ainda. Registre uma venda para começar o ranking."
          className="py-10"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Vendidos</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
              <TableHead className="text-right">Perdidos</TableHead>
              <TableHead className="text-right">Custo perdas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.fornecedor}>
                <TableCell className="font-medium">{r.fornecedor}</TableCell>
                <TableCell className="text-right tabular-nums">{r.vendidos}</TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    r.lucro >= 0 ? "text-positive" : "text-negative",
                  )}
                >
                  {brl(r.lucro)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.perdidos > 0 ? (
                    <span className="text-negative">{r.perdidos}</span>
                  ) : (
                    r.perdidos
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.custoPerdas > 0 ? brl(r.custoPerdas) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
