import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — DESIGN.md §5.6.
 * 40px de altura, --ds-radius-sm, fonte Geist Sans (papel UI/corpo).
 * Foco: outline 2px --ds-accent, offset 2px (regra fixa do §5.6/§8).
 *
 * - primary: fundo --ds-accent, texto --ds-bg (testado: contraste 6.04:1,
 *   passa AA; texto claro (--ds-text) sobre --ds-accent dá só 2.7:1, falha).
 * - whatsapp: fundo --ds-success-bg, borda --ds-success, texto --ds-success
 *   — verde só aqui, é a identidade do canal.
 * - ghost (secundário/ghost do doc): borda --ds-border, texto --ds-text,
 *   hover --ds-surface-2.
 *
 * Só tokens de globals.css (--ds-*). Ainda não usado em nenhuma página.
 */
const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-ds-sm px-4 font-ds-sans text-sm font-medium outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ds-accent text-ds-bg hover:bg-ds-accent/90",
        whatsapp:
          "border border-ds-success bg-ds-success-bg text-ds-success hover:bg-ds-success/15",
        ghost:
          "border border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-2",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const DsButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
DsButton.displayName = "DsButton";

export { DsButton as Button, buttonVariants };
