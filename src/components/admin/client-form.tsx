"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Save, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient, updateClient } from "@/app/admin/actions";
import type { ClientWithPlan } from "@/types";
import type { RentalPlan } from "@prisma/client";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "CANCELADO", label: "Cancelado" },
];

interface ClientFormValues {
  nome: string;
  contato: string;
  planId: string;
  valorMensal: string;
  dataVencimento: string;
  status: string;
  observacoes: string;
}

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

function toDefaults(client?: ClientWithPlan): ClientFormValues {
  return {
    nome: client?.nome ?? "",
    contato: client?.contato ?? "",
    planId: client?.planId ?? "NONE",
    valorMensal: s(client?.valorMensal),
    dataVencimento: client?.dataVencimento
      ? new Date(client.dataVencimento).toISOString().slice(0, 10)
      : "",
    status: client?.status ?? "ATIVO",
    observacoes: client?.observacoes ?? "",
  };
}

interface ClientFormProps {
  client?: ClientWithPlan;
  plans: RentalPlan[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({
  client,
  plans,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({ defaultValues: toDefaults(client) });

  const onSubmit = async (values: ClientFormValues) => {
    setServerError(null);
    const payload = {
      ...values,
      planId: values.planId === "NONE" ? "" : values.planId,
    };
    const res = client
      ? await updateClient(client.id, payload)
      : await createClient(payload);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/clientes");
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input
            placeholder="Nome do cliente"
            {...register("nome", { required: "Informe o nome" })}
          />
          {errors.nome && (
            <p className="text-xs text-destructive">{errors.nome.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Contato</Label>
          <Input
            placeholder="WhatsApp / e-mail"
            {...register("contato")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Plano</Label>
          <Controller
            control={control}
            name="planId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  // Sugere o valor do plano se o valor mensal ainda estiver vazio.
                  const plano = plans.find((p) => p.id === v);
                  if (plano && !getValues("valorMensal")) {
                    setValue("valorMensal", String(plano.precoMensal));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">— Sem plano</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Valor mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 2750"
            {...register("valorMensal")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Data de vencimento</Label>
          <Input type="date" {...register("dataVencimento")} />
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
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Textarea
          {...register("observacoes")}
          rows={4}
          placeholder="Anotações sobre o cliente (histórico, combinados, etc.)"
          className="min-h-[90px] text-sm leading-relaxed"
        />
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
          {client ? "Salvar alterações" : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}
