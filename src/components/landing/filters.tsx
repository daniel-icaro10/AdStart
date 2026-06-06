"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIA_META,
  CATEGORIA_ORDER,
  FAIXA_GASTO_OPTIONS,
  MOEDA_OPTIONS,
  STATUS_VENDA_META,
  type Categoria,
  type FaixaGasto,
  type Moeda,
  type StatusVenda,
} from "@/lib/constants";

export interface FilterState {
  busca: string;
  categoria: Categoria | "ALL";
  moeda: Moeda | "ALL";
  faixa: FaixaGasto;
  status: StatusVenda | "ALL";
}

export const DEFAULT_FILTERS: FilterState = {
  busca: "",
  categoria: "ALL",
  moeda: "ALL",
  faixa: "ALL",
  status: "ALL",
};

interface FiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

/** Barra de filtros + busca da landing (componente controlado). */
export function Filters({ value, onChange }: FiltersProps) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  const isDirty =
    value.categoria !== "ALL" ||
    value.moeda !== "ALL" ||
    value.faixa !== "ALL" ||
    value.status !== "ALL";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {/* categoria */}
          <Select
            value={value.categoria}
            onValueChange={(v) => set("categoria", v as FilterState["categoria"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas categorias</SelectItem>
              {CATEGORIA_ORDER.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_META[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* moeda */}
          <Select
            value={value.moeda}
            onValueChange={(v) => set("moeda", v as FilterState["moeda"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas moedas</SelectItem>
              {MOEDA_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* faixa de gasto */}
          <Select
            value={value.faixa}
            onValueChange={(v) => set("faixa", v as FaixaGasto)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Gasto" />
            </SelectTrigger>
            <SelectContent>
              {FAIXA_GASTO_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* status */}
          <Select
            value={value.status}
            onValueChange={(v) => set("status", v as FilterState["status"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos status</SelectItem>
              {(Object.keys(STATUS_VENDA_META) as StatusVenda[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_VENDA_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
