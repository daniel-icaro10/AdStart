"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Save, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_VENDA_META, type StatusVenda } from "@/lib/constants";
import { createPage, updatePage } from "@/app/admin/actions";
import type { Page } from "@prisma/client";

interface PageFormValues {
  nome: string;
  nicho: string;
  kind: "COM" | "SEM";
  seguidores: string;
  anoCriacao: string;
  status: StatusVenda;
  valor: string;
  destaque: boolean;
}

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

function toDefaults(page?: Page): PageFormValues {
  return {
    nome: page?.nome ?? "",
    nicho: page?.nicho ?? "",
    kind: (page?.kind as "COM" | "SEM") ?? "COM",
    seguidores: s(page?.seguidores),
    anoCriacao: s(page?.anoCriacao),
    status: (page?.status as StatusVenda) ?? "DISPONIVEL",
    valor: s(page?.valor),
    destaque: page?.destaque ?? false,
  };
}

interface PageFormProps {
  page?: Page;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PageForm({ page, onSuccess, onCancel }: PageFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({ defaultValues: toDefaults(page) });

  const onSubmit = async (values: PageFormValues) => {
    setServerError(null);
    const res = page
      ? await updatePage(page.id, values)
      : await createPage(values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/paginas");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" error={errors.nome?.message}>
            <Input placeholder="Página Moda & Estilo" {...register("nome", { required: "Informe o nome" })} />
          </Field>
          <Field label="Nicho" error={errors.nicho?.message}>
            <Input placeholder="Moda feminina" {...register("nicho", { required: "Informe o nicho" })} />
          </Field>

          <Field label="Tipo">
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
          </Field>
          <Field label="Seguidores">
            <Input type="number" placeholder="48200" {...register("seguidores")} />
          </Field>

          <Field label="Ano de criação">
            <Input type="number" placeholder="2021" {...register("anoCriacao")} />
          </Field>
          <Field label="Status da venda">
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
          </Field>

          <Field label="Valor (R$)" error={errors.valor?.message}>
            <Input type="number" step="0.01" placeholder="1200" {...register("valor", { required: "Informe o valor" })} />
          </Field>
          <div className="flex items-end">
            <Controller
              control={control}
              name="destaque"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  Destaque (tag &quot;Nova&quot;)
                </label>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel ?? (() => router.back())}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {page ? "Salvar alterações" : "Criar página"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
