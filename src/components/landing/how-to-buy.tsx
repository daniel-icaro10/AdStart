import { SectionTitle } from "@/components/ui/ds/section-title";

/**
 * Seção "Como comprar" (DESIGN.md §5.5): sequência real de 4 passos, por isso
 * numeração horizontal com conectores em vez de cards soltos com ícone.
 */
export function HowToBuy() {
  const steps = [
    {
      title: "Escolha o ativo",
      desc: "Navegue pelo catálogo e abra os detalhes da BM que combina com sua operação.",
    },
    {
      title: "Fale conosco",
      desc: "Clique em “Tenho interesse” e fale no WhatsApp já com o código do ativo.",
    },
    {
      title: "Pagamento seguro",
      desc: "Combinamos a forma de pagamento e confirmamos a reserva do ativo.",
    },
    {
      title: "Entrega rápida",
      desc: "Você recebe os acessos e o passo a passo de uso com suporte da equipe.",
    },
  ];

  return (
    <section className="container py-16 sm:py-20">
      <SectionTitle
        as="h2"
        size="l"
        className="mx-auto max-w-2xl justify-center text-center"
        description="Processo direto, transparente e com atendimento humano em cada etapa."
      >
        Como comprar
      </SectionTitle>

      <div className="mt-12 grid gap-8 sm:grid-cols-4 sm:gap-4">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className="absolute right-1/2 top-5 hidden h-px w-full -translate-y-1/2 bg-ds-border sm:block"
              />
            )}
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ds-border bg-ds-surface font-ds-mono text-ds-data tabular-nums text-ds-text">
              {i + 1}
            </span>
            <h3 className="mt-4 font-ds-sans text-ds-body font-semibold text-ds-text">
              {step.title}
            </h3>
            <p className="mt-1.5 font-ds-sans text-ds-body text-ds-text-muted">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
