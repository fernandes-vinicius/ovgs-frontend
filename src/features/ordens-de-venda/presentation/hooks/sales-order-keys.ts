import type { SalesOrderFilter } from "../../domain/sales-order-repository";

export const salesOrderKeys = {
  all: ["ordens-de-venda"] as const,
  lists: () => [...salesOrderKeys.all, "list"] as const,
  list: (filter?: SalesOrderFilter) => [...salesOrderKeys.lists(), filter ?? {}] as const,
  detail: (id: string) => [...salesOrderKeys.all, "detail", id] as const,
};
