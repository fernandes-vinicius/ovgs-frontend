"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Cliente } from "@/features/clientes/domain/cliente";
import type { TipoTransporte } from "@/features/tipos-transporte/domain/tipo-transporte";
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
import { Field, FieldContent, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useChangeOrderTransport } from "../hooks/use-change-order-transport";

interface EditTransportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  tipoTransporteAtualId: string;
  cliente: Cliente;
  tiposTransporte: TipoTransporte[];
}

export function EditTransportDialog({
  open,
  onOpenChange,
  orderId,
  tipoTransporteAtualId,
  cliente,
  tiposTransporte,
}: EditTransportDialogProps) {
  const [tipoTransporteId, setTipoTransporteId] = useState(tipoTransporteAtualId);
  const changeOrderTransport = useChangeOrderTransport();

  useEffect(() => {
    if (open) setTipoTransporteId(tipoTransporteAtualId);
  }, [open, tipoTransporteAtualId]);

  const tiposAutorizados = tiposTransporte.filter((tipo) =>
    cliente.tiposTransporteAutorizados.includes(tipo.id),
  );

  // Ver comentário equivalente em monitoramento-page.tsx: sem `items`, o
  // valor pré-preenchido (tipo atual da OV) mostraria o id cru em vez do
  // nome até o usuário abrir o dropdown.
  const tipoTransporteItems = useMemo(
    () => Object.fromEntries(tiposAutorizados.map((tipo) => [tipo.id, tipo.nome])),
    [tiposAutorizados],
  );

  async function handleSave() {
    try {
      await changeOrderTransport.mutateAsync({ id: orderId, tipoTransporteId });
      toast.success("Transporte atualizado.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar o transporte.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar transporte</DialogTitle>
          <DialogDescription>
            Só é possível alterar o transporte enquanto a ordem estiver criada ou planejada, e
            apenas para tipos autorizados para o cliente.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="tipoTransporteId">Tipo de transporte</FieldLabel>
          <FieldContent>
            <Select
              items={tipoTransporteItems}
              value={tipoTransporteId}
              onValueChange={(value) => setTipoTransporteId(value ?? "")}
            >
              <SelectTrigger id="tipoTransporteId" className="w-full">
                <SelectValue placeholder="Selecione um tipo de transporte" />
              </SelectTrigger>
              <SelectContent>
                {tiposAutorizados.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={changeOrderTransport.isPending || !tipoTransporteId}
          >
            {changeOrderTransport.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
