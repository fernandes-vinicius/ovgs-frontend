"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useItens } from "@/features/itens/presentation/hooks/use-itens";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Loader2, Plus, Trash2 } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type CreateSalesOrderInput,
  createSalesOrderSchema,
} from "../../application/sales-order-schemas";
import { useCreateSalesOrder } from "../hooks/use-create-sales-order";

export function SalesOrderForm() {
  const router = useRouter();
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();
  const { data: itens } = useItens();
  const createSalesOrder = useCreateSalesOrder();

  const form = useForm<CreateSalesOrderInput>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: {
      clienteId: "",
      tipoTransporteId: "",
      itens: [{ itemId: "", quantidade: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "itens" });

  const clienteId = form.watch("clienteId");
  const tipoTransporteId = form.watch("tipoTransporteId");
  const clienteSelecionado = clientes?.find((cliente) => cliente.id === clienteId);

  const tiposAutorizados = (tiposTransporte ?? []).filter((tipo) =>
    clienteSelecionado ? clienteSelecionado.tiposTransporteAutorizados.includes(tipo.id) : false,
  );

  // Reavalia apenas quando o cliente muda, lendo o valor mais recente do form
  // via `getValues`/`setValue` (referências estáveis) em vez de depender do
  // array `tiposAutorizados`, que é recriado a cada render.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ver comentário acima
  useEffect(() => {
    const tipoAtual = form.getValues("tipoTransporteId");
    if (tipoAtual && !tiposAutorizados.some((tipo) => tipo.id === tipoAtual)) {
      form.setValue("tipoTransporteId", "");
    }
  }, [clienteId]);

  async function onSubmit(values: CreateSalesOrderInput) {
    try {
      const order = await createSalesOrder.mutateAsync(values);
      toast.success("Ordem de venda criada.");
      router.push(`/ordens-de-venda/${order.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível criar a ordem de venda.",
      );
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="clienteId">Cliente</FieldLabel>
          <FieldContent>
            <Select
              value={clienteId}
              onValueChange={(value) =>
                form.setValue("clienteId", value ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="clienteId"
                className="w-full"
                aria-invalid={!!form.formState.errors.clienteId}
                aria-describedby="clienteId-error"
              >
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes?.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="clienteId-error" errors={[form.formState.errors.clienteId]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="tipoTransporteId">Tipo de transporte</FieldLabel>
          <FieldContent>
            <Select
              value={tipoTransporteId}
              onValueChange={(value) =>
                form.setValue("tipoTransporteId", value ?? "", { shouldValidate: true })
              }
              disabled={!clienteSelecionado}
            >
              <SelectTrigger
                id="tipoTransporteId"
                className="w-full"
                aria-invalid={!!form.formState.errors.tipoTransporteId}
                aria-describedby="tipoTransporteId-error"
              >
                <SelectValue
                  placeholder={
                    clienteSelecionado
                      ? "Selecione um tipo de transporte autorizado"
                      : "Selecione um cliente primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tiposAutorizados.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              id="tipoTransporteId-error"
              errors={[form.formState.errors.tipoTransporteId]}
            />
            {clienteSelecionado && tiposAutorizados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Este cliente não possui tipos de transporte autorizados.
              </p>
            )}
          </FieldContent>
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Itens</FieldLegend>
          <FieldGroup>
            {fields.map((field, index) => (
              <Field key={field.id} orientation="horizontal">
                <FieldContent>
                  <Select
                    value={form.watch(`itens.${index}.itemId`)}
                    onValueChange={(value) =>
                      form.setValue(`itens.${index}.itemId`, value ?? "", { shouldValidate: true })
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!form.formState.errors.itens?.[index]?.itemId}
                      aria-describedby={`itens-${index}-itemId-error`}
                    >
                      <SelectValue placeholder="Selecione um item" />
                    </SelectTrigger>
                    <SelectContent>
                      {itens?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome} ({item.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError
                    id={`itens-${index}-itemId-error`}
                    errors={[form.formState.errors.itens?.[index]?.itemId]}
                  />
                </FieldContent>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="w-24"
                  aria-label="Quantidade"
                  aria-invalid={!!form.formState.errors.itens?.[index]?.quantidade}
                  {...form.register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                  <span className="sr-only">Remover item</span>
                </Button>
              </Field>
            ))}
          </FieldGroup>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ itemId: "", quantidade: 1 })}
          >
            <Plus />
            Adicionar item
          </Button>
        </FieldSet>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          render={<Link href="/ordens-de-venda" />}
          nativeButton={false}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={createSalesOrder.isPending}>
          {createSalesOrder.isPending && <Loader2 className="size-4 animate-spin" />}
          Criar ordem de venda
        </Button>
      </div>
    </form>
  );
}
