import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
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
        <Trophy className="h-4 w-4 text-amber-400" />
        Fornecedores — lucro × perdas
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Ainda sem vendas/perdas com fornecedor registrado.
        </p>
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
                    r.lucro >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {brl(r.lucro)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.perdidos > 0 ? (
                    <span className="text-rose-400">{r.perdidos}</span>
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
