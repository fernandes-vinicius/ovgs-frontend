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

  // O schema zod já exige `itens.length >= 1`, mas revalidamos aqui pela mesma
  // razão de defesa em profundidade que já vale para as checagens acima —
  // este use-case não deve confiar cegamente na camada de validação de entrada.
  if (input.itens.length === 0) {
    return err(validationError("A ordem de venda deve conter ao menos um item."));
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
