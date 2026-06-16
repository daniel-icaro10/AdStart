"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Save, AlertCircle } from "lucide-react";

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
import { ImageUploader } from "@/components/admin/image-uploader";
import { STATUS_VENDA_META, type StatusVenda } from "@/lib/constants";
import { createPage, updatePage } from "@/app/admin/actions";
import type { PageWithImages } from "@/types";

interface PageFormValues {
  nome: string;
  kind: "COM" | "SEM";
  status: StatusVenda;
  valor: string;
  destaque: boolean;
  conteudo: string;
  imagens: string[];
}

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

function toDefaults(page?: PageWithImages): PageFormValues {
  return {
    nome: page?.nome ?? "",
    kind: (page?.kind as "COM" | "SEM") ?? "COM",
    status: (page?.status as StatusVenda) ?? "DISPONIVEL",
    valor: s(page?.valor),
    destaque: page?.destaque ?? false,
    conteudo: page?.conteudo ?? "",
    imagens: page?.imagens?.map((i) => i.data) ?? [],
  };
}

interface PageFormProps {
  page?: PageWithImages;
  /** Categoria do item criado nesta aba: "PAGINA" (padrão) ou "PERFIL". */
  categoria?: "PAGINA" | "PERFIL";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PageForm({
  page,
  categoria = "PAGINA",
  onSuccess,
  onCancel,
}: PageFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const cat = (page?.categoria as "PAGINA" | "PERFIL") ?? categoria;
  const termo = cat === "PERFIL" ? "perfil" : "página";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({ defaultValues: toDefaults(page) });

  const onSubmit = async (values: PageFormValues) => {
    setServerError(null);
    const payload = { ...values, categoria: cat };
    const res = page
      ? await updatePage(page.id, payload)
      : await createPage(payload);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (onSuccess) {
      onSuccess();
    } else {
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

      {/* linha 1: nome */}
      <div className="space-y-1.5">
        <Label>Nome</Label>
        <Input
          placeholder="Ex: Página Moda & Estilo"
          {...register("nome", { required: "Informe o nome" })}
        />
        {errors.nome && (
          <p className="text-xs text-destructive">{errors.nome.message}</p>
        )}
      </div>

      {/* linha 2: tipo + status + preço */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COM">Com seguidores</SelectItem>
                  <SelectItem value="SEM">Sem seguidores</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
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
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 1200"
            {...register("valor", { required: "Informe o valor" })}
          />
          {errors.valor && (
            <p className="text-xs text-destructive">{errors.valor.message}</p>
          )}
        </div>
      </div>

      {/* editor de texto livre */}
      <div className="space-y-1.5">
        <Label>Conteúdo {cat === "PERFIL" ? "do perfil" : "da página"}</Label>
        <Textarea
          {...register("conteudo")}
          rows={12}
          placeholder={
            "Escreva livremente, como no Notion. Ex:\n\nPerfil @marca (2021)\n48.2K seguidores · nicho moda\n✅ Engajamento alto\n✅ Sem strikes / sem restrições\n\nVALOR 1.2"
          }
          className="min-h-[260px] whitespace-pre-wrap font-mono text-[13px] leading-relaxed"
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
          Aparecem apenas no modal de detalhes quando o cliente clica {cat === "PERFIL" ? "no perfil" : "na página"}.
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
          {page ? "Salvar alterações" : `Criar ${termo}`}
        </Button>
      </div>
    </form>
  );
}
