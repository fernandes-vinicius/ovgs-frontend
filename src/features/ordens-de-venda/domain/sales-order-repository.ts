import type { OrderStatus } from "./order-status";
import type { SalesOrder, SalesOrderItem } from "./sales-order";

export interface SalesOrderFilter {
  status?: OrderStatus;
  clienteId?: string;
  tipoTransporteId?: string;
  data?: string;
}

export interface CreateSalesOrderData {
  clienteId: string;
  tipoTransporteId: string;
  itens: SalesOrderItem[];
}

export interface SalesOrderRepository {
  findAll(filter?: SalesOrderFilter): SalesOrder[];
  findById(id: string): SalesOrder | undefined;
  create(input: CreateSalesOrderData): SalesOrder;
  updateStatus(id: string, status: OrderStatus): SalesOrder | undefined;
  updateTipoTransporte(id: string, tipoTransporteId: string): SalesOrder | undefined;
  linkAgendamento(id: string, agendamentoId: string): SalesOrder | undefined;
}
