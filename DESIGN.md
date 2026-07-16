# adStart — Design System & Direção Visual

> Documento de referência para refatoração visual da landing page (catálogo de BMs) e do painel admin.
> Uso: manter este arquivo na raiz do repo e referenciá-lo nos prompts do Claude Code.

---

## 1. Contexto e conceito

**Produto:** marketplace de ativos de Meta Ads (Business Managers, contas de anúncio, páginas e perfis) para gestores de tráfego brasileiros. Venda consultiva via WhatsApp.

**Público:** media buyers que passam o dia dentro do Gerenciador de Anúncios lendo números — gastos, limites, ciclos, thresholds. Eles avaliam um ativo pela ficha técnica, não por promessa de marketing. Nesse mercado, **confiança é a moeda principal**: o design precisa transmitir precisão, transparência e seriedade financeira.

**Conceito visual:** *ficha técnica financeira*. O site se comporta como um terminal de ativos — escuro, denso de dados, números em fonte mono tabular, status explícitos. Nada de visual "dropshipping". Referências de sensação: extrato bancário premium + dashboard fintech.

**Elemento assinatura:** o **card de BM em formato spec-sheet** — pares chave-valor com linha pontilhada ligando rótulo ao valor (estilo extrato/recibo), números monoespaçados alinhados à direita, badge de dívida em destaque. É o que diferencia o adStart de qualquer catálogo genérico.

---

## 2. Tokens

Definir como CSS variables em `globals.css` e espelhar no `tailwind.config`. **Nenhuma cor hardcoded fora dos tokens** — landing e admin usam exatamente a mesma paleta.

```css
:root {
  /* Superfícies (azul-noite, não preto puro) */
  --bg:          #0A0E16;  /* fundo da página */
  --surface:     #111726;  /* cards, painéis */
  --surface-2:   #18202F;  /* hover, header de card, inputs */
  --border:      #232D40;  /* bordas padrão */
  --border-soft: #1A2233;  /* divisores internos */

  /* Texto */
  --text:        #E8ECF4;
  --text-muted:  #8A94A8;
  --text-faint:  #5C6577;  /* rótulos, metadados */

  /* Marca e semânticas */
  --accent:      #4D8DFF;  /* ação, links, foco — azul do universo Meta, dessaturado */
  --accent-soft: rgba(77, 141, 255, 0.12);
  --money:       #F5B84D;  /* preços, descontos, valores em destaque */
  --success:     #34D399;  /* sem dívidas, ativo, pago */
  --success-bg:  rgba(52, 211, 153, 0.10);
  --danger:      #F87171;  /* dívida, bloqueio, erro */
  --danger-bg:   rgba(248, 113, 113, 0.10);

  /* Forma */
  --radius:      10px;     /* cards e inputs */
  --radius-sm:   6px;      /* badges, botões pequenos */
  --shadow-card: 0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35);
}
```

Regras de uso:

- `--money` (âmbar) é reservado para **valores monetários e desconto**. Se tudo for âmbar, nada é âmbar.
- `--accent` (azul) é reservado para **ação**: botões, links, tab ativa, anel de foco. Nunca usar como cor decorativa de fundo grande.
- Verde/vermelho **somente** para estado financeiro (dívida, status). Nunca para decoração.
- Espaçamento na escala de 4px: `4, 8, 12, 16, 24, 32, 48, 64`. Padding interno de card: 20–24px.

---

## 3. Tipografia

Três papéis, três fontes:

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo** (700–800, tracking -2%) | Hero, títulos de seção, nome da BM |
| UI / corpo | **Geist Sans** (400/500/600) | Texto corrido, botões, formulários, tabelas |
| Dados | **Geist Mono** (500, `font-variant-numeric: tabular-nums`) | Todo valor numérico: gastos, limites, preços, IDs, datas |

No Next.js: Archivo via `next/font/google`; Geist via pacote `geist` (nativo da Vercel).

Escala:

```
Display XL  40/44  Archivo 800   — hero da landing
Display L   28/32  Archivo 700   — títulos de seção
Título card 17/24  Archivo 700   — nome da BM
Corpo       14/22  Geist 400
Rótulo      11/16  Geist 500, uppercase, tracking +6%, cor --text-faint
Dado        14/20  Geist Mono 500, tabular-nums
Dado grande 22/28  Geist Mono 500 — KPIs do admin, preço do card
```

A regra que mais muda a percepção do produto: **todo número em Geist Mono tabular, alinhado à direita quando em lista**. Números que se alinham verticalmente parecem auditados; números em fonte de texto parecem improvisados.

---

## 4. Modelo de dados do card (pré-requisito do redesign)

O maior problema visual atual não é CSS — é o conteúdo dos cards ser texto livre, cada BM formatada de um jeito (emojis ✅/📊, caixa alta inconsistente, campos ausentes). O redesign só funciona se o card renderizar **campos estruturados**:

```ts
type BMListing = {
  id: string
  nome: string
  tipo: 'BM' | 'PAGINA' | 'PERFIL' | 'ALUGUEL'
  anoCriacao?: number
  tier?: 1 | 2 | 3
  pais?: string            // ISO, ex. 'US'
  moeda: 'USD' | 'EUR' | 'BRL'
  limiteContas: number      // ex. 5 ou 10 (BM5/BM10)
  contasCriadas: number
  gastoTotal: number        // na moeda da conta
  verificada?: boolean
  contas: ContaAnuncio[]
  preco: number             // BRL
  precoOriginal?: number    // BRL — se presente, renderiza desconto
  status: 'DISPONIVEL' | 'RESERVADA' | 'VENDIDA'
  destaque?: boolean        // "Nova", etc.
}

type ContaAnuncio = {
  rotulo: string            // "CA 01"
  gasto: number
  limiteMeta?: number
  ciclo?: number
  threshold?: number
  divida: number            // 0 = sem dívidas
}
```

No admin, substituir o campo de descrição livre por um **formulário com esses campos** (contas como lista repetível). A conversão USD→BRL exibida no card deve ser calculada a partir da cotação já existente no módulo financeiro — nunca digitada à mão (hoje há cards com conversões em taxas diferentes entre si, o que mina a credibilidade).

---

## 5. Componentes — Landing

### 5.1 Card de BM (assinatura do design)

Estrutura, de cima para baixo:

```
┌──────────────────────────────────────────┐
│ [Tier 2] [🇺🇸 USD] [Nova]      [SEM DÍVIDAS]│  ← badges topo
│ BM Husky Coffee                            │  ← Archivo 700
│ Criada em 2020 · BM5 · 2 de 5 contas      │  ← metadados, muted
│────────────────────────────────────────── │
│ Gasto total ················· US$ 2.623,95│  ← linhas pontilhadas
│ Limite Meta ···················· US$ 900  │     (spec-sheet)
│ Ciclo ··························· US$ 50  │
│ Threshold ······················ US$ 125  │
│────────────────────────────────────────── │
│ R$ 2.290  ~R$ 3.490~  [-34%]              │  ← preço em --money
│ [ Ver detalhes ]      [ Chamar no WhatsApp]│
└──────────────────────────────────────────┘
```

Regras:

- O card mostra **no máximo 5 linhas de dados** (gasto total, limite, ciclo, threshold, contas). Detalhe por conta de anúncio (CA 01, CA 02…) vai só para a página/modal "Ver detalhes", numa tabela.
- Linha pontilhada: `border-bottom: 1px dotted var(--border)` num flex `justify-between`, ou pseudo-elemento com `flex: 1`. Rótulo à esquerda em Rótulo (uppercase), valor à direita em Geist Mono.
- Badge de dívida é **binário e sempre presente**: `SEM DÍVIDAS` (verde) ou `DÍVIDA US$ 250` (vermelho). Nunca escondido no meio do texto.
- Preço atual em `--money`, 22px mono; preço original riscado em `--text-faint`; percentual de desconto em badge âmbar.
- Hover: borda passa para `--accent` com transição de 150ms e leve elevação. Sem animações além disso.
- Grid: 1 coluna no mobile, 2 em ≥768px, 3 em ≥1200px; `gap: 24px`. Todos os cards com a mesma altura de seções (o modelo estruturado garante isso).

### 5.2 Badges

Altura 22px, `--radius-sm`, texto 11px uppercase Geist 600. Variantes: `tier` (neutro, borda), `moeda` (neutro), `nova` (accent-soft/accent), `sem-dividas` (success-bg/success), `divida` (danger-bg/danger), `vendida` (neutro, card inteiro com opacidade 0.55 e badge sobreposto).

### 5.3 Navegação de categorias

Substituir os ícones soltos por **tabs de segmento** logo abaixo do hero: `BMs · Páginas · Perfis · Aluguéis · Vendidos`, com contagem entre parênteses. Tab ativa: fundo `--surface-2`, texto `--text`, indicador inferior 2px `--accent`. É navegação, não decoração — precisa de estado ativo visível.

### 5.4 Hero

Uma dobra curta: headline em Archivo ("Ativos de Meta Ads verificados, sem dívidas e com histórico real" — ajustar ao gosto), sublinha de uma frase, botão primário "Ver catálogo" (âncora) e secundário WhatsApp. À direita ou abaixo, três dados agregados reais em mono ("BMs disponíveis", "gasto histórico somado do catálogo", "entrega média") — calculados do banco, não inventados. Remover o banner-imagem atual; o hero deve ser HTML/texto para carregar instantâneo e ser editável.

### 5.5 Seção "Como comprar"

Manter os 4 passos, mas como linha horizontal com conectores (é uma sequência real, numeração se justifica), números em Geist Mono dentro de círculos com borda `--border`, título Geist 600, descrição muted. Uma frase por passo.

### 5.6 Botões

- Primário: fundo `--accent`, texto `#0A0E16` ou branco (testar contraste), 40px de altura, `--radius-sm`.
- WhatsApp: variante com ícone, fundo `--success-bg`, borda `--success`, texto `--success` — verde só aqui porque é a identidade do canal.
- Secundário/ghost: borda `--border`, texto `--text`, hover `--surface-2`.
- Foco visível em tudo: `outline: 2px solid var(--accent); outline-offset: 2px`.

---

## 6. Componentes — Admin

Objetivo: admin e landing parecerem **o mesmo produto**. Mesmos tokens, mesmas fontes, mesmos badges.

### 6.1 Estrutura

Sidebar fixa 240px (`--surface`, borda direita `--border-soft`): logo, grupos de navegação com rótulos uppercase, item ativo com fundo `--accent-soft` e texto `--accent`. Conteúdo com largura máxima 1200px, título da página em Archivo 700 + ação primária à direita.

### 6.2 KPI cards

Grade de 3–4 cards: rótulo uppercase em cima, valor em Geist Mono 22–28px, variação vs. período anterior em badge (verde/vermelho com seta). Sem ícone decorativo — o número é o protagonista.

### 6.3 Tabelas

Cabeçalho no estilo Rótulo (11px uppercase, `--text-faint`), linhas 44px com `border-bottom: 1px solid var(--border-soft)`, colunas numéricas à direita em mono, coluna de status com os mesmos badges da landing. Hover de linha `--surface-2`. Zebra não é necessária com bom espaçamento.

### 6.4 Formulário de BM

Formulário estruturado seguindo o modelo da seção 4: dados gerais → lista repetível de contas de anúncio (adicionar/remover CA) → preço/status. Inputs: fundo `--surface-2`, borda `--border`, 40px, foco com borda `--accent`. Rótulo acima do campo, ajuda/erro abaixo (erro em `--danger`, dizendo o que corrigir). Preview do card ao lado ou em modal antes de publicar.

### 6.5 Recharts

Tema único compartilhado: grid `--border-soft` (dash 3 3), eixos em `--text-faint` 11px Geist Mono, série principal `--accent`, séries secundárias `#8A94A8` e `--money`, tooltip com fundo `--surface-2` e borda `--border`. Nada de paletas multicoloridas padrão do Recharts.

### 6.6 Empty states e feedback

Empty state: uma frase do que a tela mostraria + botão da ação que resolve ("Nenhuma BM cadastrada. Cadastrar primeira BM"). Toasts confirmam com o mesmo verbo do botão ("Publicar" → "Publicado").

---

## 7. Conteúdo e microcopy

- Eliminar emojis como estrutura (✅ 📊). Estado vira badge; dado vira linha da ficha técnica.
- Caixa alta apenas nos rótulos do design system, nunca em frases inteiras.
- Padrão de moeda: `US$ 1.675,40` / `€ 192,00` / `R$ 9.214,70` — sempre com símbolo, milhar com ponto, duas casas. Uma única função `formatCurrency` no código.
- Conversão exibida como `US$ 1.675,40 · ≈ R$ 9.214,70` com a cotação do dia visível no rodapé do catálogo ("cotação de hoje: R$ 5,50").
- Botões dizem o que fazem: "Chamar no WhatsApp", "Ver detalhes", "Publicar BM".

---

## 8. Qualidade mínima (não negociável)

- Responsivo até 360px; cards em 1 coluna, tabs com scroll horizontal.
- Contraste AA: `--text-muted` sobre `--surface` passa; verificar `--text-faint` (usar só em texto ≥11px 500+).
- `prefers-reduced-motion`: desativar transições de hover/reveal.
- Foco de teclado visível em links, tabs, botões e inputs.
- Imagens com `alt`; preço e status legíveis por leitor de tela (badge com texto real, não só cor).

---

## 9. Ordem sugerida de execução (Claude Code)

1. Criar tokens em `globals.css` + `tailwind.config`; instalar fontes (Archivo, Geist).
2. Componentes base: `Badge`, `Button`, `SpecRow` (linha pontilhada), `PriceTag`, `SectionTitle`.
3. Migrar o modelo de dados da BM para campos estruturados (schema Prisma + migração dos registros atuais parseando o texto livre).
4. Reescrever `BMCard` e a grade do catálogo; criar página/modal de detalhes com tabela de CAs.
5. Hero, tabs de categoria, "Como comprar", footer.
6. Admin: aplicar tokens ao layout/sidebar, KPI cards, tabelas, tema Recharts.
7. Formulário estruturado de BM com preview.
8. Passada final: responsivo, foco, reduced-motion, contraste.
