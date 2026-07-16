import { MessageSquare, ListChecks, CreditCard, Rocket } from "lucide-react";

/** Seção "Como comprar" — passo a passo simples. */
export function HowToBuy() {
  const steps = [
    {
      icon: ListChecks,
      title: "1. Escolha o ativo",
      desc: "Navegue pelo catálogo e abra os detalhes da BM que combina com sua operação.",
    },
    {
      icon: MessageSquare,
      title: "2. Fale conosco",
      desc: "Clique em “Tenho interesse” e fale no WhatsApp já com o código do ativo.",
    },
    {
      icon: CreditCard,
      title: "3. Pagamento seguro",
      desc: "Combinamos a forma de pagamento e confirmamos a reserva do ativo.",
    },
    {
      icon: Rocket,
      title: "4. Entrega rápida",
      desc: "Você recebe os acessos e o passo a passo de uso com suporte da equipe.",
    },
  ];

  return (
    <section className="container py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="ad-text-gradient mx-auto w-fit text-3xl font-bold tracking-tight">
          Como comprar
        </h2>
        <p className="mt-3 text-muted-foreground">
          Processo direto, transparente e com atendimento humano em cada etapa.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
