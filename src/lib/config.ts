/**
 * Configuração de links/identidade exibidos publicamente.
 * Todos vêm de variáveis NEXT_PUBLIC_* — nada hardcoded.
 */
export const siteConfig = {
  agencyName: process.env.NEXT_PUBLIC_AGENCY_NAME ?? "Agência de Contingência",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  communityUrl: process.env.NEXT_PUBLIC_COMMUNITY_URL ?? "",
} as const;

/**
 * Monta um link de WhatsApp (wa.me) com mensagem pré-preenchida e codificada.
 * Se não houver número configurado, devolve "#".
 */
export function buildWhatsappLink(message: string): string {
  if (!siteConfig.whatsappNumber) return "#";
  const text = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
