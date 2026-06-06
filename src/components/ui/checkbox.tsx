"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Checkbox simples (sem dependência extra) controlado por estado.
 * Usa um input nativo invisível para acessibilidade + um quadro estilizado.
 */
export function Checkbox({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border border-border bg-background transition-colors",
          "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
    </span>
  );
}
