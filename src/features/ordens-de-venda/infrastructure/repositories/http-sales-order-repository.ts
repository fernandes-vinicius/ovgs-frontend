import type { CreateSalesOrderInput } from "@/features/ordens-de-venda/application/sales-order-schemas";
import { httpClient } from "@/shared/lib/http-client";
import type { OrderStatus } from "../../domain/order-status";
import type { SalesOrder } from "../../domain/sales-order";
import type { SalesOrderFilter } from "../../domain/sales-order-repository";

function buildQuery(filter?: SalesOrderFilter): string {
  if (!filter) return "";
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.clienteId) params.set("clienteId", filter.clienteId);
  if (filter.tipoTransporteId) params.set("tipoTransporteId", filter.tipoTransporteId);
  if (filter.data) params.set("data", filter.data);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const httpSalesOrderRepository = {
  findAll: (filter?: SalesOrderFilter) =>
    httpClient.get<SalesOrder[]>(`/api/ordens-de-venda${buildQuery(filter)}`),
  findById: (id: string) => httpClient.get<SalesOrder>(`/api/ordens-de-venda/${id}`),
  create: (input: CreateSalesOrderInput) =>
    httpClient.post<SalesOrder>("/api/ordens-de-venda", input),
  changeStatus: (id: string, status: OrderStatus) =>
    httpClient.patch<SalesOrder>(`/api/ordens-de-venda/${id}/status`, { status }),
  changeTransport: (id: string, tipoTransporteId: string) =>
    httpClient.patch<SalesOrder>(`/api/ordens-de-venda/${id}/transporte`, { tipoTransporteId }),
};
