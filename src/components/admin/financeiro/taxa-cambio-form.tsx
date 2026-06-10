"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { salvarTaxaCambio } from "@/app/admin/financeiro/actions";

/** Editor da taxa USD→BRL usada para consolidar os relatórios. */
export function TaxaCambioForm({ taxaAtual }: { taxaAtual: number }) {
  const router = useRouter();
  const [taxa, setTaxa] = React.useState(String(taxaAtual));
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const res = await salvarTaxaCambio({ taxa });
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Coins className="h-4 w-4 text-brand" />
        Câmbio USD → BRL
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Usado para consolidar valores em dólar nos relatórios. A taxa do dia de
        cada transação é congelada para histórico fiel.
      </p>
      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">1 USD =</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
            className="w-[120px]"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "Salvo!" : "Salvar"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
