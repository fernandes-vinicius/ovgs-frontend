import { NextResponse } from "next/server";
import {
  definirAgendamentoSchema,
  patchAgendamentoSchema,
} from "@/features/agendamento/application/agendamento-schemas";
import { confirmarAgendamento } from "@/features/agendamento/application/confirmar-agendamento";
import { definirAgendamento } from "@/features/agendamento/application/definir-agendamento";
import { reagendar } from "@/features/agendamento/application/reagendar";
import { inMemoryAgendamentoRepository } from "@/features/agendamento/infrastructure/repositories/in-memory-agendamento-repository";
import { inMemoryAuditRepository } from "@/features/auditoria/infrastructure/repositories/in-memory-audit-repository";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";
import { errorResponse } from "@/shared/lib/error-response";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

interface RouteParams {
  params: Promise<{ ordemId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { ordemId } = await params;
  const agendamento = inMemoryAgendamentoRepository.findByOrdemId(ordemId);
  if (!agendamento) {
    return NextResponse.json(
      { error: "Agendamento não encontrado para esta ordem de venda." },
      { status: 404 },
    );
  }
  return NextResponse.json(agendamento);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { ordemId } = await params;
  const parsed = await parseJsonBody(request, definirAgendamentoSchema);
  if (parsed.response) return parsed.response;

  const result = definirAgendamento(ordemId, parsed.data.dataEntrega, parsed.data.janela, {
    agendamentoRepository: inMemoryAgendamentoRepository,
    salesOrderRepository: inMemorySalesOrderRepository,
    auditRepository: inMemoryAuditRepository,
  });

  if (!result.success) return errorResponse(result.error);

  return NextResponse.json(result.data, { status: 201 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { ordemId } = await params;
  const parsed = await parseJsonBody(request, patchAgendamentoSchema);
  if (parsed.response) return parsed.response;

  const result =
    parsed.data.action === "confirmar"
      ? confirmarAgendamento(ordemId, {
          agendamentoRepository: inMemoryAgendamentoRepository,
          auditRepository: inMemoryAuditRepository,
        })
      : reagendar(ordemId, parsed.data.dataEntrega, parsed.data.janela, {
          agendamentoRepository: inMemoryAgendamentoRepository,
          auditRepository: inMemoryAuditRepository,
        });

  if (!result.success) return errorResponse(result.error);

  return NextResponse.json(result.data);
}
