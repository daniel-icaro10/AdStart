"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, RefreshCcw, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteButton } from "@/components/admin/delete-button";
import { criarCusto, deletarCusto } from "@/app/admin/financeiro/custos/actions";
import type { SerializedCusto } from "@/lib/financeiro";

export const CATEGORIA_CUSTO_LABELS: Record<string, string> = {
  INFRAESTRUTURA: "Infraestrutura",
  TRAFEGO: "Tráfego",
  FERRAMENTAS: "Ferramentas",
  OUTROS: "Outros",
};

const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export function CustosTableClient({ custos }: { custos: SerializedCusto[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo custo
        </Button>
      </div>

      <div className="overflow-x-auto rounded-ds-lg border border-ds-border bg-ds-surface">
        <Table>
          <TableHeader>
            <TableRow className="bg-ds-surface-2/50 hover:bg-ds-surface-2/50">
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {custos.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Receipt}
                    title="Nenhum custo lançado. Registre proxies, ferramentas, tráfego…"
                    className="py-10"
                  />
                </TableCell>
              </TableRow>
            ) : (
              custos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.descricao}
                    {c.recorrente && (
                      <Badge variant="secondary" className="ml-2 gap-1">
                        <RefreshCcw className="h-3 w-3" /> recorrente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {CATEGORIA_CUSTO_LABELS[c.categoria] ?? c.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmtData(c.data)}</TableCell>
                  <TableCell className="text-right font-ds-mono tabular-nums">
                    {formatCurrency(c.valor, c.moeda)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DeleteButton id={c.id} label={c.descricao} action={deletarCusto} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme max-w-md">
          <NovoCustoForm
            onDone={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NovoCustoForm({ onDone }: { onDone: () => void }) {
  const [descricao, setDescricao] = React.useState("");
  const [categoria, setCategoria] = React.useState("INFRAESTRUTURA");
  const [valor, setValor] = React.useState("");
  const [data, setData] = React.useState(hoje());
  const [recorrente, setRecorrente] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await criarCusto({ descricao, categoria, valor, data, recorrente });
    setPending(false);
    if (res.ok) onDone();
    else setError(res.error);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Novo custo operacional</DialogTitle>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label>Descrição *</Label>
        <Input
          required
          autoFocus
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Proxies, AdsPower, chips, anúncios de captação…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIA_CUSTO_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Data</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Valor (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={recorrente} onCheckedChange={setRecorrente} />
        Despesa recorrente (mensalidade)
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className={cn("flex justify-end gap-2 pt-1")}>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Lançar custo
        </Button>
      </div>
    </form>
  );
}
