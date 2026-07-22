"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "90_dias", label: "Últimos 90 dias" },
  { value: "total", label: "Total" },
  { value: "custom", label: "Personalizado" },
];

interface PeriodSelectorProps {
  preset: string;
  inicio?: string;
  fim?: string;
}

/**
 * Seletor de período que escreve o intervalo na query string da URL.
 * Usa a rota atual (funciona no Dashboard e no Financeiro).
 */
export function PeriodSelector({ preset, inicio, fim }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [di, setDi] = React.useState(inicio ?? "");
  const [df, setDf] = React.useState(fim ?? "");

  const setPreset = (value: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("periodo", value);
    if (value !== "custom") {
      sp.delete("inicio");
      sp.delete("fim");
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  const aplicarCustom = () => {
    const sp = new URLSearchParams(params.toString());
    sp.set("periodo", "custom");
    if (di) sp.set("inicio", di);
    if (df) sp.set("fim", df);
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/80 p-1 shadow-sm backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPreset(p.value)}
            aria-pressed={preset === p.value}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              preset === p.value
                ? "bg-primary text-primary-foreground shadow-[0_6px_24px_-6px_rgb(var(--brand)/0.8)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={di}
              onChange={(e) => setDi(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <Input
              type="date"
              value={df}
              onChange={(e) => setDf(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <Button type="button" size="sm" onClick={aplicarCustom}>
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
