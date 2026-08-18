import { z } from "zod";

/** Validação do formulário/credenciais de login. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o email")
    .email("Email inválido")
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Informe a senha")
    .max(200, "Senha muito longa"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Schemas do admin (Ativos/BMs e Páginas)
// ---------------------------------------------------------------------------

const categoriaEnum = z.enum([
  "DISPONIVEL",
  "DOLAR",
  "EURO",
  "10K_50K",
  "MAIS_50K",
  "MAIS_100K",
  "SEM_CATEGORIA",
]);
const statusVendaEnum = z.enum(["DISPONIVEL", "RESERVADO", "VENDIDO"]);

// Custo opcional em R$: "" / null → null, número >= 0.
const custoOpcional = z
  .union([z.coerce.number().min(0), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v === "" || v == null ? null : v))
  .nullable();

// Editor de BM em texto livre + ícone (estilo Notion).
export const assetSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título").max(120),
  icone: z.string().trim().max(16).optional().default(""),
  categoria: categoriaEnum,
  statusVenda: statusVendaEnum,
  destaque: z.boolean().default(false),
  conteudo: z.string().max(8000).optional().default(""),
  // custo de aquisição (R$) — quanto você pagou; alimenta o financeiro.
  custoAquisicao: custoOpcional,
  // preço de venda (R$) — obrigatório (sem isso o card fica sem preço na vitrine).
  valor: z.coerce.number().positive("Informe o preço de venda"),
  // preço antigo "de" (R$) — riscado no card com % de desconto. Vazio → null.
  precoAntigo: custoOpcional,
  // imagens: data URLs (base64), no máximo 3.
  imagens: z.array(z.string()).max(3).optional().default([]),
  // tier: "NONE"/"" → null; "1".."3" → número.
  tier: z
    .union([
      z.literal(""),
      z.literal("NONE"),
      z.coerce.number().int().min(1).max(3),
    ])
    .transform((v) => (v === "" || v === "NONE" ? null : Number(v)))
    .nullable()
    .optional(),
});

export type AssetInput = z.infer<typeof assetSchema>;

// Editor de Página/Perfil em texto livre + imagens (igual à BM).
export const pageSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(120),
  categoria: z.enum(["PAGINA", "PERFIL"]).default("PAGINA"),
  kind: z.enum(["COM", "SEM"]),
  status: statusVendaEnum,
  valor: z.coerce.number().min(0, "Valor inválido"),
  // preço antigo "de" (R$) — riscado no card com % de desconto. Vazio → null.
  precoAntigo: custoOpcional,
  destaque: z.boolean().default(false),
  conteudo: z.string().max(8000).optional().default(""),
  // custo de aquisição (R$) — alimenta o financeiro.
  custoAquisicao: custoOpcional,
  // unidades em estoque (combos de página/perfil). Vazio/ inválido → 1.
  quantidade: z.coerce.number().int().min(0).catch(1).default(1),
  // imagens: data URLs (base64), no máximo 3.
  imagens: z.array(z.string()).max(3).optional().default([]),
});

export type PageInput = z.infer<typeof pageSchema>;

// ---------------------------------------------------------------------------
// Plano de aluguel (contas de agência)
// ---------------------------------------------------------------------------

export const rentalPlanSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(120),
  // slug opcional: vazio → derivado do nome na server action.
  slug: z.string().trim().max(140).optional().default(""),
  precoMensal: z.coerce.number().min(0, "Preço inválido"),
  contasAtivas: z.coerce.number().int().min(0).default(0),
  reposicoesIlimitadas: z.boolean().default(false),
  paginasAntigas2021: z.boolean().default(false),
  paginasAntigas2021Ilimitadas: z.boolean().default(false),
  perfisVerificados: z.coerce.number().int().min(0).default(0),
  beneficios: z.string().max(2000).optional().default(""),
  destaque: z.boolean().default(false),
  ordem: z.coerce.number().int().default(0),
  ativo: z.boolean().default(true),
});

export type RentalPlanInput = z.infer<typeof rentalPlanSchema>;

// ---------------------------------------------------------------------------
// Clientes (CRM de aluguéis)
// ---------------------------------------------------------------------------

// Valor opcional em R$: "" → null, número >= 0.
const valorOpcional = z
  .union([z.coerce.number().min(0), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v === "" || v == null ? null : v))
  .nullable();

// Data opcional (YYYY-MM-DD ou ISO) → Date | null.
const dataVencimentoOpcional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v.length === 10 ? `${v}T12:00:00.000Z` : v);
    return isNaN(d.getTime()) ? null : d;
  })
  .nullable();

export const clientSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(120),
  contato: z.string().trim().max(160).optional().default(""),
  // planId vazio → sem vínculo (tratado como null na action).
  planId: z.string().trim().optional().default(""),
  valorMensal: valorOpcional,
  dataVencimento: dataVencimentoOpcional,
  status: z.enum(["ATIVO", "PAUSADO", "CANCELADO"]).default("ATIVO"),
  // `observacoes` (anotações) é gerenciado à parte, na planilha/bloco do cliente.
});

export type ClientInput = z.infer<typeof clientSchema>;

/** Linha da planilha do cliente (edição). */
export const clientEntrySchema = z.object({
  id: z.string().min(1),
  data: dataVencimentoOpcional,
  descricao: z.string().trim().max(300).optional().default(""),
  valor: valorOpcional,
  status: z.string().trim().max(40).optional().default(""),
});

export type ClientEntryInput = z.infer<typeof clientEntrySchema>;
