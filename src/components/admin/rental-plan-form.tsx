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
import { createRentalPlan, updateRentalPlan } from "@/app/admin/actions";
import type { RentalPlan } from "@prisma/client";

interface RentalPlanFormValues {
  nome: string;
  slug: string;
  precoMensalUSD: string;
  contasAtivas: string;
  perfisVerificados: string;
  ordem: string;
  reposicoesIlimitadas: boolean;
  paginasAntigas2021: boolean;
  paginasAntigas2021Ilimitadas: boolean;
  destaque: boolean;
  ativo: boolean;
  beneficios: string;
}

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

function toDefaults(plan?: RentalPlan): RentalPlanFormValues {
  return {
    nome: plan?.nome ?? "",
    slug: plan?.slug ?? "",
    precoMensalUSD: s(plan?.precoMensalUSD),
    contasAtivas: s(plan?.contasAtivas ?? 0),
    perfisVerificados: s(plan?.perfisVerificados ?? 0),
    ordem: s(plan?.ordem ?? 0),
    reposicoesIlimitadas: plan?.reposicoesIlimitadas ?? false,
    paginasAntigas2021: plan?.paginasAntigas2021 ?? false,
    paginasAntigas2021Ilimitadas: plan?.paginasAntigas2021Ilimitadas ?? false,
    destaque: plan?.destaque ?? false,
    ativo: plan?.ativo ?? true,
    beneficios: plan?.beneficios ?? "",
  };
}

/** Linha de toggle (checkbox + label) reutilizada nos booleanos do plano. */
function ToggleRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <span>
        <span className="font-medium">{label}</span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
    </label>
  );
}

interface RentalPlanFormProps {
  plan?: RentalPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RentalPlanForm({ plan, onSuccess, onCancel }: RentalPlanFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RentalPlanFormValues>({ defaultValues: toDefaults(plan) });

  const onSubmit = async (values: RentalPlanFormValues) => {
    setServerError(null);
    const res = plan
      ? await updateRentalPlan(plan.id, values)
      : await createRentalPlan(values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/alugueis");
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

      {/* nome + slug */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nome do plano</Label>
          <Input
            placeholder="Ex: Plano A"
            {...register("nome", { required: "Informe o nome" })}
          />
          {errors.nome && (
            <p className="text-xs text-destructive">{errors.nome.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Slug (opcional)</Label>
          <Input placeholder="auto a partir do nome" {...register("slug")} />
        </div>
      </div>

      {/* preço + quotas numéricas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Preço mensal (US$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 500"
            {...register("precoMensalUSD", { required: "Informe o preço" })}
          />
          {errors.precoMensalUSD && (
            <p className="text-xs text-destructive">
              {errors.precoMensalUSD.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Contas ativas</Label>
          <Input type="number" min="0" {...register("contasAtivas")} />
        </div>
        <div className="space-y-1.5">
          <Label>Perfis verificados</Label>
          <Input type="number" min="0" {...register("perfisVerificados")} />
        </div>
        <div className="space-y-1.5">
          <Label>Ordem</Label>
          <Input type="number" {...register("ordem")} />
        </div>
      </div>

      {/* toggles dos booleanos */}
      <div className="grid gap-2 sm:grid-cols-2">
        <Controller
          control={control}
          name="reposicoesIlimitadas"
          render={({ field }) => (
            <ToggleRow
              label="Reposições ilimitadas"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="paginasAntigas2021"
          render={({ field }) => (
            <ToggleRow
              label="Páginas antigas 2021"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="paginasAntigas2021Ilimitadas"
          render={({ field }) => (
            <ToggleRow
              label="Páginas antigas 2021 ilimitadas"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="destaque"
          render={({ field }) => (
            <ToggleRow
              label="Destaque"
              hint="Marca o plano como “mais popular”."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="ativo"
          render={({ field }) => (
            <ToggleRow
              label="Ativo"
              hint="Mostra o plano na landing."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* benefícios extras */}
      <div className="space-y-1.5">
        <Label>Benefícios extras</Label>
        <Textarea
          {...register("beneficios")}
          rows={4}
          placeholder={
            "Um benefício por linha. Ex:\nSuporte prioritário\nTroca de conta em até 24h"
          }
          className="min-h-[90px] text-sm leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Itens extras que aparecem na lista do card, além das quotas acima.
        </p>
      </div>

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
          {plan ? "Salvar alterações" : "Criar plano"}
        </Button>
      </div>
    </form>
  );
}
