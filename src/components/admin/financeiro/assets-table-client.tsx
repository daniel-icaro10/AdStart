"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DollarSign,
  AlertTriangle,
  Pencil,
  Undo2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, formatInt } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_VENDA_META,
  CATEGORIA_META,
  PAGE_KIND_META,
  TIER_BADGE_CLASS,
  getIconeEmoji,
  type StatusVenda,
  type Categoria,
} from "@/lib/constants";
import type { SerializedAtivoFinanceiro } from "@/lib/financeiro";
import {
  venderAtivo,
  marcarPerdido,
  salvarFinanceiroAtivo,
  reverterStatus,
  estornarVenda,
  getAtivoDetalhe,
  type FinanceiroResult,
  type AtivoDetalhe,
} from "@/app/admin/financeiro/actions";
import { TIPO_LABELS } from "./assets-filters";

type Ativo = SerializedAtivoFinanceiro;
type ModalKind = "vender" | "perder" | "editar" | "reverter" | "detalhe";

const moedaFmt = (v: number | null) =>
  v == null ? "—" : formatCurrency(v, "BRL");

const hoje = () => new Date().toISOString().slice(0, 10);

function diasEmEstoque(entrada: string | null, saida: string | null): string {
  if (!entrada) return "—";
  const start = new Date(entrada).getTime();
  const end = saida ? new Date(saida).getTime() : Date.now();
  return String(Math.max(0, Math.floor((end - start) / 86_400_000)));
}

// ─── Tabela ───────────────────────────────────────────────────────────────────

export function AssetsTableClient({
  items,
  page,
  totalPages,
  total,
}: {
  items: Ativo[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [modal, setModal] = React.useState<{ kind: ModalKind; ativo: Ativo } | null>(
    null,
  );

  const goPage = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    sp.set("tab", "financeiro"); // a tabela vive na sub-aba Financeiro de Ativos
    router.push(`/admin/ativos?${sp.toString()}`);
  };

  const onDone = () => {
    setModal(null);
    router.refresh();
  };

  const onEstornar = async (saleId: string) => {
    if (
      !window.confirm("Estornar esta venda? A unidade volta para o estoque.")
    )
      return;
    const res = await estornarVenda(saleId);
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-ds-lg border border-ds-border bg-ds-surface">
        <Table>
          <TableHeader>
            <TableRow className="bg-ds-surface-2/50 hover:bg-ds-surface-2/50">
              <TableHead>Ativo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Previsto</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-right">Dias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={SearchX}
                    title="Nenhum ativo encontrado com esses filtros."
                    className="py-10"
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => {
                const status = a.statusVenda as StatusVenda;
                const ehVenda = a.ehVenda === true;
                const emEstoque =
                  !ehVenda &&
                  (status === "DISPONIVEL" || status === "RESERVADO");
                const margem =
                  a.precoPrevisto != null && a.custoAquisicao != null
                    ? a.precoPrevisto - a.custoAquisicao
                    : null;
                const grupoLabel =
                  a.grupo === "BM"
                    ? "BM"
                    : a.grupo === "PERFIL"
                      ? "Perfil"
                      : "Página";
                const sub = ehVenda
                  ? "Venda (unidade)"
                  : grupoLabel +
                    (a.grupo !== "BM" && a.quantidade != null
                      ? ` · ${a.quantidade} un.`
                      : "");
                return (
                  <TableRow key={`${a.ehVenda ? "sale" : a.origem}-${a.id}`}>
                    <TableCell>
                      {ehVenda ? (
                        <div className="font-medium">{a.titulo}</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModal({ kind: "detalhe", ativo: a })}
                          title="Ver detalhes do ativo"
                          className="rounded text-left font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {a.titulo}
                        </button>
                      )}
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {a.tipo ? TIPO_LABELS[a.tipo] ?? a.tipo : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{a.fornecedor ?? "—"}</TableCell>
                    <TableCell className="text-right font-ds-mono tabular-nums">
                      {moedaFmt(a.custoAquisicao)}
                    </TableCell>
                    <TableCell className="text-right font-ds-mono tabular-nums">
                      {moedaFmt(a.precoPrevisto)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-ds-mono tabular-nums",
                        margem != null && margem >= 0 && "text-ds-success",
                        margem != null && margem < 0 && "text-ds-danger",
                      )}
                    >
                      {moedaFmt(margem)}
                    </TableCell>
                    <TableCell className="text-right font-ds-mono tabular-nums text-ds-text-muted">
                      {diasEmEstoque(a.dataEntrada, a.dataSaida)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
                        {STATUS_VENDA_META[status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {ehVenda ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Estornar venda"
                            title="Estornar venda (devolve 1 ao estoque)"
                            onClick={() => onEstornar(a.id)}
                          >
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <>
                            {emEstoque ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Marcar como vendido"
                                  title="Vender"
                                  onClick={() => setModal({ kind: "vender", ativo: a })}
                                >
                                  <DollarSign className="h-4 w-4 text-positive" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Marcar como perdido"
                                  title="Perder"
                                  onClick={() => setModal({ kind: "perder", ativo: a })}
                                >
                                  <AlertTriangle className="h-4 w-4 text-negative" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Reverter status"
                                title="Reverter para estoque"
                                onClick={() => setModal({ kind: "reverter", ativo: a })}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar financeiro"
                              title="Editar dados financeiros"
                              onClick={() => setModal({ kind: "editar", ativo: a })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* paginação */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} ativo(s)</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* modais */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent
          className={cn(
            "admin-theme",
            modal?.kind === "detalhe"
              ? "max-h-[85vh] max-w-2xl overflow-y-auto"
              : "max-w-md",
          )}
        >
          {modal?.kind === "detalhe" && (
            <DetalheView
              ativo={modal.ativo}
              onEdit={() => setModal({ kind: "editar", ativo: modal.ativo })}
            />
          )}
          {modal?.kind === "vender" && (
            <VenderForm ativo={modal.ativo} onDone={onDone} />
          )}
          {modal?.kind === "perder" && (
            <PerderForm ativo={modal.ativo} onDone={onDone} />
          )}
          {modal?.kind === "editar" && (
            <EditarForm ativo={modal.ativo} onDone={onDone} />
          )}
          {modal?.kind === "reverter" && (
            <ReverterForm ativo={modal.ativo} onDone={onDone} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── helper de submit ─────────────────────────────────────────────────────────

function useSubmit(action: (input: unknown) => Promise<FinanceiroResult>) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const run = async (payload: unknown, onOk: () => void) => {
    setPending(true);
    setError(null);
    const res = await action(payload);
    setPending(false);
    if (res.ok) onOk();
    else setError(res.error);
  };
  return { pending, error, run };
}

function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-sm text-destructive">{msg}</p>;
}

function Footer({
  pending,
  onCancel,
  label,
  variant,
}: {
  pending: boolean;
  onCancel: () => void;
  label: string;
  variant?: "default" | "destructive";
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
        Cancelar
      </Button>
      <Button type="submit" variant={variant} disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </div>
  );
}

// ─── Vender ───────────────────────────────────────────────────────────────────

function VenderForm({ ativo, onDone }: { ativo: Ativo; onDone: () => void }) {
  const { pending, error, run } = useSubmit(venderAtivo);
  const [precoVenda, setPreco] = React.useState("");
  const [comprador, setComprador] = React.useState("");
  const [dataSaida, setData] = React.useState(hoje());
  const ehPagina = ativo.origem === "page";
  const maxUn = ativo.quantidade ?? 1;
  const [unidades, setUnidades] = React.useState("1");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          {
            origem: ativo.origem,
            id: ativo.id,
            precoVenda,
            unidades,
            comprador,
            dataSaida,
          },
          onDone,
        );
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>
          {ehPagina ? "Registrar venda" : "Marcar como vendido"}
        </DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {ativo.titulo}
        {ehPagina ? ` · ${maxUn} em estoque` : ""}
      </p>
      <div className={ehPagina ? "grid grid-cols-[1fr_120px] gap-3" : "space-y-1.5"}>
        <div className="space-y-1.5">
          <Label>
            {ehPagina ? "Preço por unidade (R$) *" : "Preço de venda (R$) *"}
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            autoFocus
            value={precoVenda}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Ex: 1500"
          />
        </div>
        {ehPagina && (
          <div className="space-y-1.5">
            <Label>Unidades</Label>
            <Input
              type="number"
              min="1"
              max={maxUn}
              step="1"
              value={unidades}
              onChange={(e) => setUnidades(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Comprador</Label>
          <Input value={comprador} onChange={(e) => setComprador(e.target.value)} placeholder="Nome/contato" />
        </div>
        <div className="space-y-1.5">
          <Label>Data da venda</Label>
          <Input type="date" value={dataSaida} onChange={(e) => setData(e.target.value)} />
        </div>
      </div>
      <ErrorMsg msg={error} />
      <Footer
        pending={pending}
        onCancel={onDone}
        label={ehPagina ? "Registrar venda" : "Confirmar venda"}
      />
    </form>
  );
}

// ─── Perder ───────────────────────────────────────────────────────────────────

function PerderForm({ ativo, onDone }: { ativo: Ativo; onDone: () => void }) {
  const { pending, error, run } = useSubmit(marcarPerdido);
  const [motivoPerda, setMotivo] = React.useState("");
  const [dataSaida, setData] = React.useState(hoje());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run({ origem: ativo.origem, id: ativo.id, motivoPerda, dataSaida }, onDone);
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>Marcar como perdido</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{ativo.titulo}</p>
      <div className="space-y-1.5">
        <Label>Motivo da perda *</Label>
        <Textarea
          required
          autoFocus
          value={motivoPerda}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: ban na verificação, restrição de anúncios…"
          className="min-h-[80px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Data da perda</Label>
        <Input type="date" value={dataSaida} onChange={(e) => setData(e.target.value)} />
      </div>
      <ErrorMsg msg={error} />
      <Footer pending={pending} onCancel={onDone} label="Confirmar perda" variant="destructive" />
    </form>
  );
}

// ─── Editar financeiro ────────────────────────────────────────────────────────

function EditarForm({ ativo, onDone }: { ativo: Ativo; onDone: () => void }) {
  const { pending, error, run } = useSubmit(salvarFinanceiroAtivo);
  const [tipo, setTipo] = React.useState<string>(ativo.tipo ?? "NONE");
  const [fornecedor, setForn] = React.useState(ativo.fornecedor ?? "");
  const [custoAquisicao, setCusto] = React.useState(
    ativo.custoAquisicao != null ? String(ativo.custoAquisicao) : "",
  );
  const [dataEntrada, setEntrada] = React.useState(
    ativo.dataEntrada ? ativo.dataEntrada.slice(0, 10) : "",
  );
  const [precoPrevisto, setPrevisto] = React.useState(
    ativo.precoPrevisto != null ? String(ativo.precoPrevisto) : "",
  );
  const [observacoes, setObs] = React.useState(ativo.observacoes ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          {
            origem: ativo.origem,
            id: ativo.id,
            tipo: tipo === "NONE" ? null : tipo,
            fornecedor,
            custoAquisicao,
            dataEntrada,
            precoPrevisto,
            observacoes,
          },
          onDone,
        );
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>Dados financeiros</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{ativo.titulo}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">—</SelectItem>
              {Object.entries(TIPO_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Fornecedor</Label>
          <Input value={fornecedor} onChange={(e) => setForn(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Custo (R$)</Label>
          <Input type="number" step="0.01" min="0" value={custoAquisicao} onChange={(e) => setCusto(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Preço previsto (R$)</Label>
          <Input type="number" step="0.01" min="0" value={precoPrevisto} onChange={(e) => setPrevisto(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Data de entrada</Label>
          <Input type="date" value={dataEntrada} onChange={(e) => setEntrada(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Textarea value={observacoes} onChange={(e) => setObs(e.target.value)} className="min-h-[60px]" />
      </div>
      <ErrorMsg msg={error} />
      <Footer pending={pending} onCancel={onDone} label="Salvar" />
    </form>
  );
}

// ─── Reverter ─────────────────────────────────────────────────────────────────

function ReverterForm({ ativo, onDone }: { ativo: Ativo; onDone: () => void }) {
  const { pending, error, run } = useSubmit(reverterStatus);
  const [novoStatus, setStatus] = React.useState("DISPONIVEL");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          { origem: ativo.origem, id: ativo.id, novoStatus, confirmar: true },
          onDone,
        );
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>Reverter para estoque</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Isso volta <strong className="text-foreground">{ativo.titulo}</strong> ao
        estoque e <strong>apaga</strong> preço de venda, comprador, data e motivo
        de perda. Confirmar?
      </p>
      <div className="space-y-1.5">
        <Label>Novo status</Label>
        <Select value={novoStatus} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DISPONIVEL">Disponível</SelectItem>
            <SelectItem value="RESERVADO">Reservado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ErrorMsg msg={error} />
      <Footer pending={pending} onCancel={onDone} label="Reverter" variant="destructive" />
    </form>
  );
}

// ─── Detalhe do ativo (read-only) ───────────────────────────────────────────────

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Bloco({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function gastosResumo(d: Extract<AtivoDetalhe, { origem: "asset" }>): string {
  const parts: string[] = [];
  if (d.totalGastosBRL != null) parts.push(formatCurrency(d.totalGastosBRL, "BRL"));
  if (d.totalGastosUSD != null) parts.push(formatCurrency(d.totalGastosUSD, "USD"));
  return parts.join(" · ") || "—";
}

function AssetDetalhe({
  data,
}: {
  data: Extract<AtivoDetalhe, { origem: "asset" }>;
}) {
  const categoria = data.categoria as Categoria;
  const catMeta = CATEGORIA_META[categoria];
  const emoji = getIconeEmoji(data.icone);
  const status = data.statusVenda as StatusVenda;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl leading-none">{emoji}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{data.titulo}</h3>
          <p className="text-xs text-muted-foreground">Código: {data.codigo}</p>
        </div>
        <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
          {STATUS_VENDA_META[status].label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {catMeta && (
          <Badge className={cn("border", catMeta.badgeClass)}>
            {catMeta.label}
          </Badge>
        )}
        {data.tier != null && (
          <Badge className={TIER_BADGE_CLASS}>Tier {data.tier}</Badge>
        )}
        {data.verificada && <Badge variant="secondary">Verificada</Badge>}
        {data.semDividas && <Badge variant="secondary">Sem dívidas</Badge>}
        {data.semBloqueios && <Badge variant="secondary">Sem bloqueios</Badge>}
        {data.destaque && <Badge variant="secondary">Nova</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Moeda" value={data.moeda} />
        <Field label="Valor (vitrine)" value={formatCurrency(data.valor, "BRL")} />
        <Field
          label="Qtd. contas"
          value={data.qtdContas != null ? formatInt(data.qtdContas) : "—"}
        />
        {data.anoCriacao != null && (
          <Field label="Ano de criação" value={data.anoCriacao} />
        )}
        {data.fornecedor && <Field label="Fornecedor" value={data.fornecedor} />}
        {(data.totalGastosBRL != null || data.totalGastosUSD != null) && (
          <Field label="Gastos hist." value={gastosResumo(data)} />
        )}
      </div>

      {data.conteudo && (
        <Bloco label="Descrição">
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {data.conteudo}
          </p>
        </Bloco>
      )}

      {data.contas.length > 0 && (
        <Bloco label={`Contas de anúncio (${data.contas.length})`}>
          <ul className="mt-1.5 space-y-1">
            {data.contas.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-sm"
              >
                <span className="font-medium">{c.nome}</span>
                <span className="text-xs text-muted-foreground">
                  {c.status}
                  {c.gastos != null
                    ? ` · ${formatCurrency(c.gastos, "BRL")}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {data.imagens.length > 0 && (
        <Bloco label="Imagens">
          <div className="mt-1.5 flex flex-wrap gap-2">
            {data.imagens.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className="h-24 w-24 rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </Bloco>
      )}

      {data.observacoes && (
        <Bloco label="Observações">
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {data.observacoes}
          </p>
        </Bloco>
      )}
    </div>
  );
}

function PageDetalhe({
  data,
}: {
  data: Extract<AtivoDetalhe, { origem: "page" }>;
}) {
  const status = data.status as StatusVenda;
  const kindMeta = PAGE_KIND_META[data.kind as "COM" | "SEM"];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{data.titulo}</h3>
          <p className="text-xs text-muted-foreground">
            Página{data.nicho ? ` · ${data.nicho}` : ""}
          </p>
        </div>
        <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
          {STATUS_VENDA_META[status].label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{kindMeta?.label ?? data.kind}</Badge>
        {data.destaque && <Badge variant="secondary">Nova</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {data.nicho && <Field label="Nicho" value={data.nicho} />}
        {data.seguidores > 0 && (
          <Field
            label="Seguidores"
            value={
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {formatInt(data.seguidores)}
              </span>
            }
          />
        )}
        <Field label="Valor (vitrine)" value={formatCurrency(data.valor, "BRL")} />
        {data.anoCriacao != null && (
          <Field label="Ano de criação" value={data.anoCriacao} />
        )}
        {data.fornecedor && <Field label="Fornecedor" value={data.fornecedor} />}
      </div>

      {data.conteudo && (
        <Bloco label="Descrição">
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {data.conteudo}
          </p>
        </Bloco>
      )}

      {data.observacoes && (
        <Bloco label="Observações">
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {data.observacoes}
          </p>
        </Bloco>
      )}
    </div>
  );
}

function DetalheView({
  ativo,
  onEdit,
}: {
  ativo: Ativo;
  onEdit: () => void;
}) {
  const [data, setData] = React.useState<AtivoDetalhe | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    getAtivoDetalhe(ativo.origem, ativo.id).then((d) => {
      if (active) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [ativo.origem, ativo.id]);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Detalhes do ativo</DialogTitle>
      </DialogHeader>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando…
        </div>
      ) : !data ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Ativo não encontrado.
        </p>
      ) : data.origem === "asset" ? (
        <AssetDetalhe data={data} />
      ) : (
        <PageDetalhe data={data} />
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <Button type="button" variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Editar financeiro
        </Button>
      </div>
    </div>
  );
}
