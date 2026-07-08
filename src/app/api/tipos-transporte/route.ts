import { NextResponse } from "next/server";
import { createTipoTransporteSchema } from "@/features/tipos-transporte/application/tipo-transporte-schemas";
import { inMemoryTipoTransporteRepository } from "@/features/tipos-transporte/infrastructure/repositories/in-memory-tipo-transporte-repository";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

export async function GET() {
  return NextResponse.json(inMemoryTipoTransporteRepository.findAll());
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createTipoTransporteSchema);
  if (parsed.response) return parsed.response;

  const tipoTransporte = inMemoryTipoTransporteRepository.create(parsed.data);
  return NextResponse.json(tipoTransporte, { status: 201 });
}
