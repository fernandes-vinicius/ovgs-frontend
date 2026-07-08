import type { OrderStatus } from "./order-status";

// Fonte única da verdade do fluxo operacional da OV — usada tanto pelo route
// handler de transição de status (rejeita com 422 fora da sequência) quanto
// pela UI (habilita apenas as próximas transições válidas no detalhe da OV).
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CRIADA: ["PLANEJADA"],
  PLANEJADA: ["AGENDADA"],
  AGENDADA: ["EM_TRANSPORTE"],
  EM_TRANSPORTE: ["ENTREGUE"],
  ENTREGUE: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextValidStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}
