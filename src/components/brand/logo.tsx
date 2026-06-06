import { cn } from "@/lib/utils";

/**
 * Logomarca "adStart" como wordmark vetorial (nítida em qualquer tamanho).
 * O "S" central recebe o degradê rosa→azul da identidade da marca.
 *
 * Para usar a logo em imagem no lugar: troque este componente por
 * <Image src="/logo.png" ... /> salvando o arquivo em public/logo.png.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none text-2xl font-extrabold tracking-tight",
        className,
      )}
      aria-label="adStart"
    >
      <span className="text-foreground">ad</span>
      <span className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-sky-500 bg-clip-text text-transparent">
        S
      </span>
      <span className="text-foreground">tart</span>
    </span>
  );
}
