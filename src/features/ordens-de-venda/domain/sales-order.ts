import type { OrderStatus } from "./order-status";

export interface SalesOrderItem {
  itemId: string;
  quantidade: number;
}

export interface SalesOrder {
  id: string;
  clienteId: string;
  tipoTransporteId: string;
  itens: SalesOrderItem[];
  status: OrderStatus;
  agendamentoId?: string;
  createdAt: string;
}
