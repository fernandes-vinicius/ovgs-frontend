import { NextResponse } from "next/server";
import { inMemoryAuditRepository } from "@/features/auditoria/infrastructure/repositories/in-memory-audit-repository";
import { inMemoryClienteRepository } from "@/features/clientes/infrastructure/repositories/in-memory-cliente-repository";
import { inMemoryItemRepository } from "@/features/itens/infrastructure/repositories/in-memory-item-repository";
import { createSalesOrder } from "@/features/ordens-de-venda/application/create-sales-order";
import { createSalesOrderSchema } from "@/features/ordens-de-venda/application/sales-order-schemas";
import { ORDER_STATUSES, type OrderStatus } from "@/features/ordens-de-venda/domain/order-status";
import type { SalesOrderFilter } from "@/features/ordens-de-venda/domain/sales-order-repository";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";
import { inMemoryTipoTransporteRepository } from "@/features/tipos-transporte/infrastructure/repositories/in-memory-tipo-transporte-repository";
import { errorResponse } from "@/shared/lib/error-response";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const filter: SalesOrderFilter = {
    status: status && isOrderStatus(status) ? status : undefined,
    clienteId: searchParams.get("clienteId") ?? undefined,
    tipoTransporteId: searchParams.get("tipoTransporteId") ?? undefined,
    data: searchParams.get("data") ?? undefined,
  };

  return NextResponse.json(inMemorySalesOrderRepository.findAll(filter));
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createSalesOrderSchema);
  if (parsed.response) return parsed.response;

  const result = createSalesOrder(parsed.data, {
    salesOrderRepository: inMemorySalesOrderRepository,
    clienteRepository: inMemoryClienteRepository,
    tipoTransporteRepository: inMemoryTipoTransporteRepository,
    itemRepository: inMemoryItemRepository,
  });

  if (!result.success) {
    return errorResponse(result.error);
  }

  inMemoryAuditRepository.record({
    entidadeTipo: "OrdemDeVenda",
    entidadeId: result.data.id,
    acao: "CRIACAO_ORDEM_VENDA",
    estadoPosterior: result.data,
  });

  return NextResponse.json(result.data, { status: 201 });
}
