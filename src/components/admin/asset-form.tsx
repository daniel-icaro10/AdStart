"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Save, AlertCircle, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIA_META,
  CATEGORIA_ORDER,
  ICONE_OPTIONS,
  STATUS_VENDA_META,
  TIER_OPTIONS,
  getIconeEmoji,
  type Categoria,
  type StatusVenda,
} from "@/lib/constants";
import { createAsset, updateAsset } from "@/app/admin/actions";
import type { AssetWithDetails } from "@/types";

interface AssetFormValues {
  titulo: string;
  icone: string;
  categoria: Categoria;
  statusVenda: StatusVenda;
  tier: string;
  valor: string;
  destaque: boolean;
  conteudo: string;
  imagens: string[];
}

function toDefaults(asset?: AssetWithDetails): AssetFormValues {
  return {
    titulo: asset?.titulo ?? "",
    icone: asset?.icone ?? "",
    categoria: (asset?.categoria as Categoria) ?? "DOLAR",
    statusVenda: (asset?.statusVenda as StatusVenda) ?? "DISPONIVEL",
    tier: asset?.tier ? String(asset.tier) : "NONE",
    valor: asset?.valor ? String(asset.valor) : "",
    destaque: asset?.destaque ?? false,
    conteudo: asset?.conteudo ?? "",
    imagens: asset?.imagens?.map((i) => i.data) ?? [],
  };
}

/** Lê um arquivo de imagem e devolve um data URL JPEG redimensionado (leve). */
async function fileToResizedDataURL(
  file: File,
  max = 1000,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Uploader de até 3 imagens com preview (resize no navegador). */
function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [busy, setBusy] = React.useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const remaining = 3 - value.length;
    const picked = Array.from(files).slice(0, Math.max(0, remaining));
    const urls: string[] = [];
    for (const f of picked) {
      try {
        urls.push(await fileToResizedDataURL(f));
      } catch {
        // ignora arquivo inválido
      }
    }
    onChange([...value, ...urls].slice(0, 3));
    setBusy(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div
            key={i}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {value.length < 3 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground transition-colors hover:bg-accent">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Adicionar
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{value.length}/3 imagens</p>
    </div>
  );
}

interface AssetFormProps {
  asset?: AssetWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssetForm({ asset, onSuccess, onCancel }: AssetFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormValues>({ defaultValues: toDefaults(asset) });

  const icone = watch("icone");

  const onSubmit = async (values: AssetFormValues) => {
    setServerError(null);
    const res = asset
      ? await updateAsset(asset.id, values)
      : await createAsset(values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (onSuccess) onSuccess();
    else {
      router.push("/admin/ativos");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* linha 1: ícone + título */}
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label>Ícone</Label>
          <Controller
            control={control}
            name="icone"
            render={({ field }) => (
              <Select
                value={field.value || "NONE"}
                onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">— Nenhum</SelectItem>
                  {ICONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <Label>Título</Label>
          <div className="flex items-center gap-2">
            {icone && <span className="text-xl leading-none">{getIconeEmoji(icone)}</span>}
            <Input
              placeholder="Ex: P100 · BM Verificada"
              {...register("titulo", { required: "Informe o título" })}
            />
          </div>
          {errors.titulo && (
            <p className="text-xs text-destructive">{errors.titulo.message}</p>
          )}
        </div>
      </div>

      {/* linha 2: categoria + status + tier + preço */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Categoria (coluna)</Label>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIA_ORDER.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_META[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="statusVenda"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_VENDA_META) as StatusVenda[]).map((st) => (
                    <SelectItem key={st} value={st}>
                      {STATUS_VENDA_META[st].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tier</Label>
          <Controller
            control={control}
            name="tier"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 4800"
            {...register("valor")}
          />
        </div>
      </div>

      {/* editor de texto livre */}
      <div className="space-y-1.5">
        <Label>Conteúdo da BM</Label>
        <Textarea
          {...register("conteudo")}
          rows={14}
          placeholder={
            "Escreva livremente, como no Notion. Ex:\n\nBM 01 (2023) 12.3K\nGastos Totais: R$ 12.384,00\n✅ Gastou: R$ 12.384,00\n✅ Sem dívidas e sem bloqueios\n\nCA 01 - ATIVA\nGastos: R$ 9.061,92\n\nVALOR 3.5"
          }
          className="min-h-[300px] whitespace-pre-wrap font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          As quebras de linha são preservadas exatamente como você digitar.
        </p>
      </div>

      {/* imagens (até 3) — só aparecem no modal de detalhes */}
      <div className="space-y-1.5">
        <Label>Imagens (até 3)</Label>
        <Controller
          control={control}
          name="imagens"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Aparecem apenas no modal de detalhes quando o cliente clica na BM.
        </p>
      </div>

      <Controller
        control={control}
        name="destaque"
        render={({ field }) => (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            Destaque (tag &quot;Nova&quot;)
          </label>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel ?? (() => router.back())}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {asset ? "Salvar alterações" : "Criar ativo"}
        </Button>
      </div>
    </form>
  );
}
