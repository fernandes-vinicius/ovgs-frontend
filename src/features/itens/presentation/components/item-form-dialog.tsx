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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { HttpError } from "@/shared/lib/http-client";
import { type CreateItemInput, createItemSchema } from "../../application/item-schemas";
import { useCreateItem } from "../hooks/use-create-item";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemFormDialog({ open, onOpenChange }: ItemFormDialogProps) {
  const createItem = useCreateItem();

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: { sku: "", nome: "", unidade: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ sku: "", nome: "", unidade: "" });
    }
  }, [open, form]);

  async function onSubmit(values: CreateItemInput) {
    try {
      await createItem.mutateAsync(values);
      toast.success("Item criado.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof HttpError && error.status === 422) {
        form.setError("sku", { message: error.message });
        return;
      }
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o item.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo item</DialogTitle>
          <DialogDescription>
            Itens precisam estar previamente cadastrados para serem associados a ordens de venda.
          </DialogDescription>
        </DialogHeader>

        <form id="item-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sku">SKU</FieldLabel>
              <FieldContent>
                <Input
                  id="sku"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.sku}
                  aria-describedby="sku-error"
                  {...form.register("sku")}
                />
                <FieldError id="sku-error" errors={[form.formState.errors.sku]} />
              </FieldContent>
            </Field>

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
              <FieldLabel htmlFor="unidade">Unidade</FieldLabel>
              <FieldContent>
                <Input
                  id="unidade"
                  autoComplete="off"
                  placeholder="saco, unidade, m³…"
                  aria-invalid={!!form.formState.errors.unidade}
                  aria-describedby="unidade-error"
                  {...form.register("unidade")}
                />
                <FieldError id="unidade-error" errors={[form.formState.errors.unidade]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="item-form" disabled={createItem.isPending}>
            {createItem.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
