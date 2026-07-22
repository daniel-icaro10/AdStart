import type { Config } from "tailwindcss";

// Helper: cor a partir de var RGB com suporte a opacidade do Tailwind.
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Fonte do tema do admin (TailAdmin usa Outfit). Aplicada via classe
        // font-admin no AdminShell/login — a landing pública continua em Inter.
        admin: ["var(--font-outfit)", "system-ui", "sans-serif"],
        // Design system v2 (DESIGN.md §3) — papéis Display/UI/Dados.
        // Prefixo "ds-" para não colidir com font-sans/font-mono já em uso;
        // ainda não aplicadas a nenhum componente.
        "ds-display": ["var(--font-archivo)", "system-ui", "sans-serif"],
        "ds-sans": ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        "ds-mono": ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      // Escala tipográfica do design system v2 (DESIGN.md §3 "Escala").
      // Cada chave: [tamanho, { lineHeight, letterSpacing?, fontWeight }].
      // text-transform (uppercase do Rótulo) e cor ficam a cargo do componente.
      fontSize: {
        "ds-display-xl": [
          "40px",
          { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "800" },
        ],
        "ds-display-l": [
          "28px",
          { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "ds-title-card": [
          "17px",
          { lineHeight: "24px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "ds-body": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "ds-label": [
          "11px",
          { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "500" },
        ],
        "ds-data": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "ds-data-lg": ["22px", { lineHeight: "28px", fontWeight: "500" }],
      },
      colors: {
        border: rgb("--border"),
        input: rgb("--input"),
        ring: rgb("--ring"),
        background: rgb("--background"),
        foreground: {
          DEFAULT: rgb("--foreground"),
          strong: rgb("--foreground-strong"),
        },
        primary: {
          DEFAULT: rgb("--primary"),
          foreground: rgb("--primary-foreground"),
        },
        secondary: {
          DEFAULT: rgb("--secondary"),
          foreground: rgb("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: rgb("--destructive"),
          foreground: rgb("--destructive-foreground"),
        },
        muted: {
          DEFAULT: rgb("--muted"),
          foreground: rgb("--muted-foreground"),
        },
        accent: {
          DEFAULT: rgb("--accent"),
          foreground: rgb("--accent-foreground"),
        },
        popover: {
          DEFAULT: rgb("--popover"),
          foreground: rgb("--popover-foreground"),
        },
        card: {
          DEFAULT: rgb("--card"),
          foreground: rgb("--card-foreground"),
        },
        // Fundo próprio da sidebar do admin — independente do --card (cards de dados).
        sidebar: rgb("--sidebar-bg"),
        // Accent azul cirúrgico (preços, glows, badges especiais).
        brand: {
          DEFAULT: rgb("--brand"),
          hover: rgb("--brand-hover"),
        },
        // Texto mais apagado (labels, eixos de gráfico).
        faint: rgb("--text-muted"),
        // Cores semânticas — usar SÓ quando o valor carrega significado.
        positive: rgb("--positive"),
        negative: rgb("--negative"),
        warning: rgb("--warning"),
        // Design system v2 (DESIGN.md §2) — paleta única landing+admin sob o
        // namespace "ds" (ex.: bg-ds-surface, text-ds-money, border-ds-border).
        // Ainda não aplicada a nenhum componente.
        ds: {
          bg: rgb("--ds-bg"),
          surface: rgb("--ds-surface"),
          "surface-2": rgb("--ds-surface-2"),
          border: rgb("--ds-border"),
          "border-soft": rgb("--ds-border-soft"),
          text: rgb("--ds-text"),
          "text-muted": rgb("--ds-text-muted"),
          "text-faint": rgb("--ds-text-faint"),
          accent: rgb("--ds-accent"),
          "accent-soft": "var(--ds-accent-soft)",
          money: rgb("--ds-money"),
          success: rgb("--ds-success"),
          "success-bg": "var(--ds-success-bg)",
          danger: rgb("--ds-danger"),
          "danger-bg": "var(--ds-danger-bg)",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "ds-lg": "var(--ds-radius)",
        "ds-sm": "var(--ds-radius-sm)",
      },
      boxShadow: {
        "ds-card": "var(--ds-shadow-card)",
        // Sombras do TailAdmin (theme-xs/sm), usadas no header/dropdowns do admin.
        "theme-xs": "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        "theme-sm":
          "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
      },
      transitionTimingFunction: {
        // Curva "snap" assinatura.
        DEFAULT: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        DEFAULT: "240ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
