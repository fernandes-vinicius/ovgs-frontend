import type { OrderStatus } from "../domain/order-status";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CRIADA: "Criada",
  PLANEJADA: "Planejada",
  AGENDADA: "Agendada",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, "outline" | "secondary" | "default"> =
  {
    CRIADA: "outline",
    PLANEJADA: "outline",
    AGENDADA: "secondary",
    EM_TRANSPORTE: "secondary",
    ENTREGUE: "default",
  };
