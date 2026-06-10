"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TIPO_LABELS: Record<string, string> = {
  BM: "BM",
  CONTA_ANUNCIO: "Conta de anúncio",
  KIT: "Kit",
  PERFIL: "Perfil",
  PAGINA: "Página",
};

export function AssetsFilters({ fornecedores }: { fornecedores: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busca, setBusca] = React.useState(params.get("q") ?? "");

  const push = (next: URLSearchParams) => {
    next.delete("page"); // volta pra página 1 ao filtrar
    router.push(`/admin/financeiro/ativos?${next.toString()}`);
  };

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "todos") next.delete(key);
    else next.set(key, value);
    push(next);
  };

  const aplicarBusca = () => {
    const next = new URLSearchParams(params.toString());
    if (busca.trim()) next.set("q", busca.trim());
    else next.delete("q");
    push(next);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && aplicarBusca()}
          onBlur={aplicarBusca}
          placeholder="Buscar por título ou fornecedor"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select
          value={params.get("status") ?? "todos"}
          onValueChange={(v) => setParam("status", v)}
        >
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo status</SelectItem>
            <SelectItem value="DISPONIVEL">Disponível</SelectItem>
            <SelectItem value="RESERVADO">Reservado</SelectItem>
            <SelectItem value="VENDIDO">Vendido</SelectItem>
            <SelectItem value="PERDIDO">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.get("tipo") ?? "todos"}
          onValueChange={(v) => setParam("tipo", v)}
        >
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo tipo</SelectItem>
            {Object.entries(TIPO_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("origem") ?? "todos"}
          onValueChange={(v) => setParam("origem", v)}
        >
          <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Toda origem</SelectItem>
            <SelectItem value="asset">BMs</SelectItem>
            <SelectItem value="page">Páginas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.get("fornecedor") ?? "todos"}
          onValueChange={(v) => setParam("fornecedor", v)}
        >
          <SelectTrigger><SelectValue placeholder="Fornecedor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo fornecedor</SelectItem>
            {fornecedores.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
