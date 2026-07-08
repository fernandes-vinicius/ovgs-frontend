"use client";

import { useState } from "react";
import type { OrderStatus } from "@/features/ordens-de-venda/domain/order-status";
import {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
} from "@/features/ordens-de-venda/presentation/order-status-labels";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/date";
import { useAgendamento } from "../hooks/use-agendamento";
import { useConfirmarAgendamento } from "../hooks/use-confirmar-agendamento";
import { AgendamentoFormDialog } from "./agendamento-form-dialog";

interface AgendamentoRowProps {
  ordemId: string;
  status: OrderStatus;
  clienteNome: string;
  tipoTransporteNome: string;
}

export function AgendamentoRow({
  ordemId,
  status,
  clienteNome,
  tipoTransporteNome,
}: AgendamentoRowProps) {
  const { data: agendamento, isLoading } = useAgendamento(ordemId);
  const confirmar = useConfirmarAgendamento();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isEntregue = status === "ENTREGUE";

  return (
    <TableRow>
      <TableCell className="font-medium">{clienteNome}</TableCell>
      <TableCell className="text-muted-foreground">{tipoTransporteNome}</TableCell>
      <TableCell>
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
      </TableCell>
      <TableCell>
        {isLoading ? (
          <span className="text-muted-foreground">…</span>
        ) : agendamento ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm">
              {formatDate(agendamento.dataEntrega)} · {agendamento.janela.inicio}–
              {agendamento.janela.fim}
            </span>
            <Badge variant={agendamento.confirmado ? "default" : "outline"} className="w-fit">
              {agendamento.confirmado ? "Confirmado" : "Não confirmado"}
            </Badge>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Não agendado</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {!isEntregue && (
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              {agendamento ? "Reagendar" : "Agendar"}
            </Button>
          )}
          {!isEntregue && agendamento && !agendamento.confirmado && (
            <Button size="sm" onClick={() => confirmar(ordemId, status)}>
              Confirmar
            </Button>
          )}
        </div>
      </TableCell>

      <AgendamentoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ordemId={ordemId}
        agendamentoExistente={agendamento ?? undefined}
      />
    </TableRow>
  );
}
