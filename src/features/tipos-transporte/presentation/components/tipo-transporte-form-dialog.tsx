"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
  type CreateTipoTransporteInput,
  createTipoTransporteSchema,
} from "../../application/tipo-transporte-schemas";
import type { TipoTransporte } from "../../domain/tipo-transporte";
import { useCreateTipoTransporte } from "../hooks/use-create-tipo-transporte";
import { useUpdateTipoTransporte } from "../hooks/use-update-tipo-transporte";

interface TipoTransporteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoTransporte?: TipoTransporte;
}

export function TipoTransporteFormDialog({
  open,
  onOpenChange,
  tipoTransporte,
}: TipoTransporteFormDialogProps) {
  const isEditing = Boolean(tipoTransporte);
  const createTipoTransporte = useCreateTipoTransporte();
  const updateTipoTransporte = useUpdateTipoTransporte();
  const isPending = createTipoTransporte.isPending || updateTipoTransporte.isPending;

  const form = useForm<CreateTipoTransporteInput>({
    resolver: zodResolver(createTipoTransporteSchema),
    defaultValues: { nome: "", ativo: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nome: tipoTransporte?.nome ?? "",
        ativo: tipoTransporte?.ativo ?? true,
      });
    }
  }, [open, tipoTransporte, form]);

  async function onSubmit(values: CreateTipoTransporteInput) {
    try {
      if (isEditing && tipoTransporte) {
        await updateTipoTransporte.mutateAsync({ id: tipoTransporte.id, input: values });
        toast.success("Tipo de transporte atualizado.");
      } else {
        await createTipoTransporte.mutateAsync(values);
        toast.success("Tipo de transporte criado.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o tipo de transporte.",
      );
    }
  }

  const ativo = form.watch("ativo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar tipo de transporte" : "Novo tipo de transporte"}
          </DialogTitle>
          <DialogDescription>
            Novos tipos de transporte ficam disponíveis imediatamente para autorização de clientes e
            criação de ordens de venda.
          </DialogDescription>
        </DialogHeader>

        <form id="tipo-transporte-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <FieldContent>
                <Input
                  id="nome"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.nome}
                  aria-describedby="nome-error"
                  {...form.register("nome")}
                />
                <FieldError id="nome-error" errors={[form.formState.errors.nome]} />
              </FieldContent>
            </Field>

            <Field className="sm:flex-row sm:items-center sm:*:w-auto">
              <FieldContent>
                <FieldLabel htmlFor="ativo">Ativo</FieldLabel>
                <FieldDescription>
                  Tipos inativos deixam de aparecer como opção em novas ordens de venda.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={(checked) =>
                  form.setValue("ativo", checked, { shouldValidate: true })
                }
              />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="tipo-transporte-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
