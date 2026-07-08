import type { ClienteRepository } from "@/features/clientes/domain/cliente-repository";
import type { ItemRepository } from "@/features/itens/domain/item-repository";
import type { TipoTransporteRepository } from "@/features/tipos-transporte/domain/tipo-transporte-repository";
import { err, notFound, ok, type Result, validationError } from "@/shared/types/result";
import type { SalesOrder } from "../domain/sales-order";
import type { SalesOrderRepository } from "../domain/sales-order-repository";
import { isTransportAuthorized } from "./is-transport-authorized";
import type { CreateSalesOrderInput } from "./sales-order-schemas";

interface Deps {
  salesOrderRepository: SalesOrderRepository;
  clienteRepository: ClienteRepository;
  tipoTransporteRepository: TipoTransporteRepository;
  itemRepository: ItemRepository;
}

export function createSalesOrder(input: CreateSalesOrderInput, deps: Deps): Result<SalesOrder> {
  const cliente = deps.clienteRepository.findById(input.clienteId);
  if (!cliente) return err(notFound("Cliente não encontrado."));

  const tipoTransporte = deps.tipoTransporteRepository.findById(input.tipoTransporteId);
  if (!tipoTransporte) return err(notFound("Tipo de transporte não encontrado."));

  if (!isTransportAuthorized(cliente, input.tipoTransporteId)) {
    return err(validationError("Tipo de transporte não autorizado para este cliente."));
  }

  for (const { itemId } of input.itens) {
    if (!deps.itemRepository.findById(itemId)) {
      return err(validationError(`Item ${itemId} não encontrado.`));
    }
  }

  const order = deps.salesOrderRepository.create({
    clienteId: input.clienteId,
    tipoTransporteId: input.tipoTransporteId,
    itens: input.itens,
  });

  return ok(order);
}
