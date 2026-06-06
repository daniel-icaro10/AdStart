import { prisma } from "@/lib/prisma";
import { CATEGORIA_ORDER, type Categoria } from "@/lib/constants";

export const CATEGORY_ORDER_KEY = "categoryOrder";

/**
 * Ordem das categorias na landing, definida pelo admin (drag-and-drop).
 * Lê do Setting; valida contra as categorias conhecidas e acrescenta no fim
 * qualquer categoria nova que ainda não esteja salva. Fallback: ordem padrão.
 */
export async function getCategoryOrder(): Promise<Categoria[]> {
  const row = await prisma.setting.findUnique({
    where: { key: CATEGORY_ORDER_KEY },
  });

  let saved: string[] = [];
  if (row) {
    try {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed)) saved = parsed;
    } catch {
      // valor inválido — ignora e usa padrão
    }
  }

  const known = CATEGORIA_ORDER as string[];
  const ordered = saved.filter((c) => known.includes(c)) as Categoria[];
  for (const c of CATEGORIA_ORDER) {
    if (!ordered.includes(c)) ordered.push(c);
  }
  return ordered;
}
