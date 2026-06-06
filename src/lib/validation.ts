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

// Campo inteiro opcional: aceita "" (vazio) → null, ou inteiro >= 0.
const optionalInt = z
  .union([z.coerce.number().int().min(0), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? null : v))
  .nullable();

// Editor de BM em texto livre + ícone (estilo Notion).
export const assetSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título").max(120),
  icone: z.string().trim().max(16).optional().default(""),
  categoria: categoriaEnum,
  statusVenda: statusVendaEnum,
  destaque: z.boolean().default(false),
  conteudo: z.string().max(8000).optional().default(""),
  // preço de venda (R$). Vazio/ inválido → 0.
  valor: z.coerce.number().min(0).catch(0).default(0),
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

export const pageSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(120),
  nicho: z.string().trim().min(1, "Informe o nicho").max(80),
  kind: z.enum(["COM", "SEM"]),
  seguidores: z.coerce.number().int().min(0).default(0),
  anoCriacao: optionalInt,
  status: statusVendaEnum,
  valor: z.coerce.number().min(0, "Valor inválido"),
  destaque: z.boolean().default(false),
});

export type PageInput = z.infer<typeof pageSchema>;
