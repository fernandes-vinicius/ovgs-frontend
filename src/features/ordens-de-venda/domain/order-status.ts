export const ORDER_STATUSES = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
