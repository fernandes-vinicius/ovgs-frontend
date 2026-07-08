"use client";

import type { OrderStatus } from "@/features/ordens-de-venda/domain/order-status";
import { useAppDispatch } from "@/shared/store/hooks";
import { confirmarAgendamentoRequested } from "../store/agendamento-actions";

export function useConfirmarAgendamento() {
  const dispatch = useAppDispatch();

  return function confirmar(ordemId: string, statusAtualDaOrdem: OrderStatus) {
    dispatch(confirmarAgendamentoRequested({ ordemId, statusAtualDaOrdem }));
  };
}
