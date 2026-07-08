import { NextResponse } from "next/server";
import { inMemoryAuditRepository } from "@/features/auditoria/infrastructure/repositories/in-memory-audit-repository";
import { inMemoryClienteRepository } from "@/features/clientes/infrastructure/repositories/in-memory-cliente-repository";
import { changeOrderTransport } from "@/features/ordens-de-venda/application/change-order-transport";
import { changeOrderTransportSchema } from "@/features/ordens-de-venda/application/sales-order-schemas";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";
import { inMemoryTipoTransporteRepository } from "@/features/tipos-transporte/infrastructure/repositories/in-memory-tipo-transporte-repository";
import { errorResponse } from "@/shared/lib/error-response";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, changeOrderTransportSchema);
  if (parsed.response) return parsed.response;

  const result = changeOrderTransport(id, parsed.data.tipoTransporteId, {
    salesOrderRepository: inMemorySalesOrderRepository,
    clienteRepository: inMemoryClienteRepository,
    tipoTransporteRepository: inMemoryTipoTransporteRepository,
    auditRepository: inMemoryAuditRepository,
  });

  if (!result.success) return errorResponse(result.error);

  return NextResponse.json(result.data);
}
