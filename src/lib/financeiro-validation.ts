import { z } from "zod";

/** Schemas Zod do módulo financeiro — usados nas Server Actions (validação backend). */
/** Tudo é registrado em R$ (BRL) — o sistema não usa mais USD no financeiro. */

export const tipoAtivoEnum = z.enum([
  "BM",
  "CONTA_ANUNCIO",
  "KIT",
  "PERFIL",
  "PAGINA",
]);

export const categoriaCustoEnum = z.enum([
  "INFRAESTRUTURA",
  "TRAFEGO",
  "FERRAMENTAS",
  "OUTROS",
]);

/** number opcional a partir de input string: "" → null, número >= 0. */
const dinheiroOpcional = z
  .union([z.coerce.number().min(0), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? null : v))
  .nullable();

/** Data opcional (string YYYY-MM-DD ou ISO) → Date | null. */
const dataOpcional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v.length === 10 ? `${v}T12:00:00.000Z` : v);
    return isNaN(d.getTime()) ? null : d;
  })
  .nullable();

/** Identifica o ativo de forma unificada (Asset ou Page). */
export const ativoRefSchema = z.object({
  origem: z.enum(["asset", "page"]),
  id: z.string().min(1),
});

/** Edição dos campos financeiros de um ativo (entrada rápida no estoque). Tudo em R$. */
export const ativoFinanceiroSchema = ativoRefSchema.extend({
  tipo: tipoAtivoEnum.nullable().optional(),
  fornecedor: z.string().trim().max(120).optional().default(""),
  custoAquisicao: dinheiroOpcional,
  dataEntrada: dataOpcional,
  precoPrevisto: dinheiroOpcional,
  observacoes: z.string().trim().max(2000).optional().default(""),
});

/** Marcar como vendido: precoVenda OBRIGATÓRIO (em R$). unidades só p/ páginas/perfis. */
export const venderSchema = ativoRefSchema.extend({
  precoVenda: z.coerce.number().min(0, "Informe o preço de venda"),
  unidades: z.coerce.number().int().min(1).catch(1).default(1),
  comprador: z.string().trim().max(160).optional().default(""),
  dataSaida: dataOpcional,
  observacoes: z.string().trim().max(2000).optional().default(""),
});

/** Marcar como perdido: motivo OBRIGATÓRIO. */
export const perderSchema = ativoRefSchema.extend({
  motivoPerda: z.string().trim().min(1, "Informe o motivo da perda").max(500),
  dataSaida: dataOpcional,
});

/** Reverter status (ex.: voltar de VENDIDO/PERDIDO para estoque). */
export const reverterStatusSchema = ativoRefSchema.extend({
  novoStatus: z.enum(["DISPONIVEL", "RESERVADO"]),
  confirmar: z.literal(true),
});

/** Custo operacional (em R$). */
export const custoOperacionalSchema = z.object({
  descricao: z.string().trim().min(1, "Informe a descrição").max(200),
  categoria: categoriaCustoEnum,
  valor: z.coerce.number().min(0, "Valor inválido"),
  data: z
    .string()
    .min(1, "Informe a data")
    .transform((v) => new Date(v.length === 10 ? `${v}T12:00:00.000Z` : v))
    .refine((d) => !isNaN(d.getTime()), "Data inválida"),
  recorrente: z.boolean().default(false),
});

export type AtivoFinanceiroInput = z.infer<typeof ativoFinanceiroSchema>;
export type VenderInput = z.infer<typeof venderSchema>;
export type PerderInput = z.infer<typeof perderSchema>;
export type CustoOperacionalInput = z.infer<typeof custoOperacionalSchema>;
