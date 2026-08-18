"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Save, Check, ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CATEGORIA_META, type Categoria } from "@/lib/constants";
import { saveCategoryOrder } from "@/app/admin/actions";

/**
 * Editor de ordem das categorias por arrastar-e-soltar (HTML5 nativo).
 * A ordem definida aqui é a sequência das colunas na landing.
 */
export function CategoryOrderEditor({ initial }: { initial: Categoria[] }) {
  const router = useRouter();
  const [order, setOrder] = React.useState<Categoria[]>(initial);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = order.join("|") !== initial.join("|");

  const move = (from: number, to: number) => {
    if (from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onDrop = (to: number) => {
    if (dragIndex !== null) move(dragIndex, to);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await saveCategoryOrder(order);
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <ul className="space-y-2">
        {order.map((cat, i) => (
          <li
            key={cat}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDrop={() => onDrop(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              "flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors active:cursor-grabbing",
              overIndex === i && dragIndex !== null && "border-primary/60 bg-accent",
              dragIndex === i && "opacity-50",
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-faint" />
            <span className="w-5 text-center text-xs tabular-nums text-faint">
              {i + 1}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                CATEGORIA_META[cat].badgeClass,
              )}
            >
              {CATEGORIA_META[cat].label}
            </span>

            {/* alternativa ao drag-and-drop (mouse-only) — funciona por teclado */}
            <span className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Mover ${CATEGORIA_META[cat].label} para cima`}
                className="rounded p-1 text-faint transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === order.length - 1}
                aria-label={`Mover ${CATEGORIA_META[cat].label} para baixo`}
                className="rounded p-1 text-faint transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Salvo!" : "Salvar ordem"}
        </Button>
        {dirty && !saving && (
          <button
            type="button"
            onClick={() => setOrder(initial)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Desfazer
          </button>
        )}
      </div>
    </div>
  );
}
