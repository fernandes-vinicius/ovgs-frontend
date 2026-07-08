import { createAction } from "@reduxjs/toolkit";
import type { OrderStatus } from "@/features/ordens-de-venda/domain/order-status";

export const confirmarAgendamentoRequested = createAction<{
  ordemId: string;
  statusAtualDaOrdem: OrderStatus;
}>("agendamento/confirmarAgendamentoRequested");
