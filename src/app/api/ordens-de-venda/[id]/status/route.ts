import { NextResponse } from "next/server";
import { inMemoryAuditRepository } from "@/features/auditoria/infrastructure/repositories/in-memory-audit-repository";
import { changeOrderStatus } from "@/features/ordens-de-venda/application/change-order-status";
import { changeOrderStatusSchema } from "@/features/ordens-de-venda/application/sales-order-schemas";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";
import { errorResponse } from "@/shared/lib/error-response";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, changeOrderStatusSchema);
  if (parsed.response) return parsed.response;

  const result = changeOrderStatus(id, parsed.data.status, {
    salesOrderRepository: inMemorySalesOrderRepository,
    auditRepository: inMemoryAuditRepository,
  });

  if (!result.success) return errorResponse(result.error);

  return NextResponse.json(result.data);
}
