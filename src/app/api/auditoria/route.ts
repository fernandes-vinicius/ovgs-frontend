import { NextResponse } from "next/server";
import type { AuditEntityType } from "@/features/auditoria/domain/audit-event";
import { inMemoryAuditRepository } from "@/features/auditoria/infrastructure/repositories/in-memory-audit-repository";

const ENTITY_TYPES: AuditEntityType[] = ["OrdemDeVenda", "Agendamento"];

function isAuditEntityType(value: string): value is AuditEntityType {
  return (ENTITY_TYPES as string[]).includes(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entidadeTipo = searchParams.get("entidadeTipo");
  const events = inMemoryAuditRepository.findAll({
    entidadeTipo: entidadeTipo && isAuditEntityType(entidadeTipo) ? entidadeTipo : undefined,
    entidadeId: searchParams.get("entidadeId") ?? undefined,
  });

  return NextResponse.json(events);
}
