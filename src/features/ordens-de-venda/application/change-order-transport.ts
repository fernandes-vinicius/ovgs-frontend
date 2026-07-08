import type { AuditRepository } from "@/features/auditoria/domain/audit-repository";
import type { ClienteRepository } from "@/features/clientes/domain/cliente-repository";
import type { TipoTransporteRepository } from "@/features/tipos-transporte/domain/tipo-transporte-repository";
import { err, notFound, ok, type Result, validationError } from "@/shared/types/result";
import type { SalesOrder } from "../domain/sales-order";
import type { SalesOrderRepository } from "../domain/sales-order-repository";
import { isTransportAuthorized } from "./is-transport-authorized";

interface Deps {
  salesOrderRepository: SalesOrderRepository;
  clienteRepository: ClienteRepository;
  tipoTransporteRepository: TipoTransporteRepository;
  auditRepository: AuditRepository;
}

const EDITABLE_STATUSES = ["CRIADA", "PLANEJADA"];

export function changeOrderTransport(
  orderId: string,
  novoTipoTransporteId: string,
  deps: Deps,
): Result<SalesOrder> {
  const order = deps.salesOrderRepository.findById(orderId);
  if (!order) return err(notFound("Ordem de venda não encontrada."));

  if (!EDITABLE_STATUSES.includes(order.status)) {
    return err(
      validationError(
        "O transporte só pode ser alterado enquanto a OV estiver CRIADA ou PLANEJADA.",
      ),
    );
  }

  const cliente = deps.clienteRepository.findById(order.clienteId);
  if (!cliente) return err(notFound("Cliente não encontrado."));

  const tipoTransporte = deps.tipoTransporteRepository.findById(novoTipoTransporteId);
  if (!tipoTransporte) return err(notFound("Tipo de transporte não encontrado."));

  if (!isTransportAuthorized(cliente, novoTipoTransporteId)) {
    return err(validationError("Tipo de transporte não autorizado para este cliente."));
  }

  const estadoAnterior = order.tipoTransporteId;
  const updated = deps.salesOrderRepository.updateTipoTransporte(orderId, novoTipoTransporteId);
  if (!updated) return err(notFound("Ordem de venda não encontrada."));

  deps.auditRepository.record({
    entidadeTipo: "OrdemDeVenda",
    entidadeId: orderId,
    acao: "ALTERACAO_TRANSPORTE",
    estadoAnterior,
    estadoPosterior: novoTipoTransporteId,
  });

  return ok(updated);
}
