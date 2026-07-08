import type { AuditRepository } from "@/features/auditoria/domain/audit-repository";
import { err, notFound, ok, type Result, validationError } from "@/shared/types/result";
import type { OrderStatus } from "../domain/order-status";
import type { SalesOrder } from "../domain/sales-order";
import type { SalesOrderRepository } from "../domain/sales-order-repository";
import { isValidTransition } from "../domain/state-machine";

interface Deps {
  salesOrderRepository: SalesOrderRepository;
  auditRepository: AuditRepository;
}

export function changeOrderStatus(
  orderId: string,
  novoStatus: OrderStatus,
  deps: Deps,
): Result<SalesOrder> {
  const order = deps.salesOrderRepository.findById(orderId);
  if (!order) return err(notFound("Ordem de venda não encontrada."));

  if (!isValidTransition(order.status, novoStatus)) {
    return err(validationError(`Transição de ${order.status} para ${novoStatus} não é permitida.`));
  }

  const estadoAnterior = order.status;
  const updated = deps.salesOrderRepository.updateStatus(orderId, novoStatus);
  if (!updated) return err(notFound("Ordem de venda não encontrada."));

  deps.auditRepository.record({
    entidadeTipo: "OrdemDeVenda",
    entidadeId: orderId,
    acao: "ALTERACAO_STATUS",
    estadoAnterior,
    estadoPosterior: novoStatus,
  });

  return ok(updated);
}
