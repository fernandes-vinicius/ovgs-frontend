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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type DefinirAgendamentoInput,
  definirAgendamentoSchema,
} from "../../application/agendamento-schemas";
import type { Agendamento, JanelaAtendimento } from "../../domain/agendamento";
import { useDefinirAgendamento } from "../hooks/use-definir-agendamento";
import { useReagendar } from "../hooks/use-reagendar";

const JANELAS_DISPONIVEIS: JanelaAtendimento[] = [
  { inicio: "08:00", fim: "12:00" },
  { inicio: "12:00", fim: "18:00" },
  { inicio: "18:00", fim: "22:00" },
];

function janelaParaValor(janela: JanelaAtendimento) {
  return `${janela.inicio}-${janela.fim}`;
}

function valorParaJanela(value: string): JanelaAtendimento {
  const [inicio, fim] = value.split("-");
  return { inicio, fim };
}

// Ver comentário em monitoramento-page.tsx: sem `items`, reagendar uma OV
// (valor pré-preenchido a partir do agendamento existente) mostraria a
// string crua da janela em vez do rótulo formatado.
const JANELA_ITEMS = Object.fromEntries(
  JANELAS_DISPONIVEIS.map((janela) => [
    janelaParaValor(janela),
    `${janela.inicio} – ${janela.fim}`,
  ]),
);

interface AgendamentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordemId: string;
  agendamentoExistente?: Agendamento;
}

export function AgendamentoFormDialog({
  open,
  onOpenChange,
  ordemId,
  agendamentoExistente,
}: AgendamentoFormDialogProps) {
  const isReagendamento = Boolean(agendamentoExistente);
  const definir = useDefinirAgendamento();
  const reagendar = useReagendar();
  const isPending = definir.isPending || reagendar.isPending;

  const form = useForm<DefinirAgendamentoInput>({
    resolver: zodResolver(definirAgendamentoSchema),
    defaultValues: { dataEntrega: "", janela: { inicio: "", fim: "" } },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dataEntrega: agendamentoExistente?.dataEntrega ?? "",
        janela: agendamentoExistente?.janela ?? { inicio: "", fim: "" },
      });
    }
  }, [open, agendamentoExistente, form]);

  // Sempre uma string definida (nunca `undefined`) pra manter o Select
  // controlado desde o primeiro render — ver o bug de uncontrolled->controlled
  // já corrigido nos Selects de sales-order-form.tsx (seção 7). Precisa ser
  // especificamente `""` (não outro valor "vazio" tipo "-") pra continuar
  // disparando o placeholder em vez de tentar resolver um rótulo inexistente.
  const janela = form.watch("janela");
  const janelaValue = janela?.inicio && janela?.fim ? janelaParaValor(janela) : "";

  async function onSubmit(values: DefinirAgendamentoInput) {
    try {
      if (isReagendamento) {
        await reagendar.mutateAsync({
          ordemId,
          dataEntrega: values.dataEntrega,
          janela: values.janela,
        });
        toast.success("Agendamento reagendado.");
      } else {
        await definir.mutateAsync({ ordemId, input: values });
        toast.success("Agendamento definido.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o agendamento.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReagendamento ? "Reagendar entrega" : "Agendar entrega"}</DialogTitle>
          <DialogDescription>
            Defina a data de entrega e a janela de atendimento para esta ordem de venda.
          </DialogDescription>
        </DialogHeader>

        <form id="agendamento-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dataEntrega">Data de entrega</FieldLabel>
              <FieldContent>
                <Input id="dataEntrega" type="date" {...form.register("dataEntrega")} />
                <FieldError errors={[form.formState.errors.dataEntrega]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="janela">Janela de atendimento</FieldLabel>
              <FieldContent>
                <Select
                  items={JANELA_ITEMS}
                  value={janelaValue}
                  onValueChange={(value) =>
                    value &&
                    form.setValue("janela", valorParaJanela(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="janela" className="w-full">
                    <SelectValue placeholder="Selecione uma janela" />
                  </SelectTrigger>
                  <SelectContent>
                    {JANELAS_DISPONIVEIS.map((j) => (
                      <SelectItem key={janelaParaValor(j)} value={janelaParaValor(j)}>
                        {j.inicio} – {j.fim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.janela?.inicio]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="agendamento-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
