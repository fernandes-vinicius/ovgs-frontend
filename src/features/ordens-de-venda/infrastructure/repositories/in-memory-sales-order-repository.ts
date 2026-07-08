import { randomUUID } from "node:crypto";
import { db } from "@/mocks/in-memory-db";
import type { SalesOrder } from "../../domain/sales-order";
import type {
  CreateSalesOrderData,
  SalesOrderFilter,
  SalesOrderRepository,
} from "../../domain/sales-order-repository";

export const inMemorySalesOrderRepository: SalesOrderRepository = {
  findAll(filter?: SalesOrderFilter) {
    return db.ordensDeVenda.filter((order) => {
      if (filter?.status && order.status !== filter.status) return false;
      if (filter?.clienteId && order.clienteId !== filter.clienteId) return false;
      if (filter?.tipoTransporteId && order.tipoTransporteId !== filter.tipoTransporteId)
        return false;
      // Filtro de "data" do Monitoramento Operacional compara com a data de
      // criação da OV (YYYY-MM-DD) — não há um campo de data de entrega na
      // própria OV, isso vive no Agendamento (feature separada).
      if (filter?.data && !order.createdAt.startsWith(filter.data)) return false;
      return true;
    });
  },
  findById(id) {
    return db.ordensDeVenda.find((order) => order.id === id);
  },
  create(input: CreateSalesOrderData) {
    const order: SalesOrder = {
      id: randomUUID(),
      clienteId: input.clienteId,
      tipoTransporteId: input.tipoTransporteId,
      itens: input.itens,
      status: "CRIADA",
      createdAt: new Date().toISOString(),
    };
    db.ordensDeVenda.push(order);
    return order;
  },
  updateStatus(id, status) {
    const order = db.ordensDeVenda.find((o) => o.id === id);
    if (!order) return undefined;
    order.status = status;
    return order;
  },
  updateTipoTransporte(id, tipoTransporteId) {
    const order = db.ordensDeVenda.find((o) => o.id === id);
    if (!order) return undefined;
    order.tipoTransporteId = tipoTransporteId;
    return order;
  },
  linkAgendamento(id, agendamentoId) {
    const order = db.ordensDeVenda.find((o) => o.id === id);
    if (!order) return undefined;
    order.agendamentoId = agendamentoId;
    return order;
  },
};
