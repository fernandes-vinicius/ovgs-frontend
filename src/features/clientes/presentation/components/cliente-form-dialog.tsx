"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Loader2 } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { type CreateClienteInput, createClienteSchema } from "../../application/cliente-schemas";
import type { Cliente } from "../../domain/cliente";
import { useCreateCliente } from "../hooks/use-create-cliente";
import { useUpdateCliente } from "../hooks/use-update-cliente";

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
}

export function ClienteFormDialog({ open, onOpenChange, cliente }: ClienteFormDialogProps) {
  const isEditing = Boolean(cliente);
  const { data: tiposTransporte } = useTiposTransporte();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const isPending = createCliente.isPending || updateCliente.isPending;

  const form = useForm<CreateClienteInput>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: { nome: "", documento: "", tiposTransporteAutorizados: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nome: cliente?.nome ?? "",
        documento: cliente?.documento ?? "",
        tiposTransporteAutorizados: cliente?.tiposTransporteAutorizados ?? [],
      });
    }
  }, [open, cliente, form]);

  async function onSubmit(values: CreateClienteInput) {
    try {
      if (isEditing && cliente) {
        await updateCliente.mutateAsync({ id: cliente.id, input: values });
        toast.success("Cliente atualizado.");
      } else {
        await createCliente.mutateAsync(values);
        toast.success("Cliente criado.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o cliente.");
    }
  }

  const tiposSelecionados = form.watch("tiposTransporteAutorizados");

  function toggleTipo(tipoId: string, checked: boolean) {
    const atual = form.getValues("tiposTransporteAutorizados");
    form.setValue(
      "tiposTransporteAutorizados",
      checked ? [...atual, tipoId] : atual.filter((id) => id !== tipoId),
      { shouldValidate: true },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            Defina os dados do cliente e os tipos de transporte que ele está autorizado a utilizar
            em ordens de venda.
          </DialogDescription>
        </DialogHeader>

        <form id="cliente-form" onSubmit={form.handleSubmit(onSubmit)}>
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

            <Field>
              <FieldLabel htmlFor="documento">Documento (CNPJ/CPF)</FieldLabel>
              <FieldContent>
                <Input
                  id="documento"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.documento}
                  aria-describedby="documento-error"
                  {...form.register("documento")}
                />
                <FieldError id="documento-error" errors={[form.formState.errors.documento]} />
              </FieldContent>
            </Field>

            <FieldSet>
              <FieldLegend variant="label">Tipos de transporte autorizados</FieldLegend>
              <FieldDescription>
                Uma ordem de venda só pode ser criada com um tipo de transporte autorizado para o
                cliente.
              </FieldDescription>
              <FieldGroup data-slot="checkbox-group">
                {tiposTransporte?.map((tipo) => (
                  <Field key={tipo.id} orientation="horizontal">
                    <Checkbox
                      id={`tipo-${tipo.id}`}
                      checked={tiposSelecionados?.includes(tipo.id)}
                      onCheckedChange={(checked) => toggleTipo(tipo.id, checked)}
                    />
                    <FieldLabel htmlFor={`tipo-${tipo.id}`}>{tipo.nome}</FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
