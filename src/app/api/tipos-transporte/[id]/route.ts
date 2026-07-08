import { NextResponse } from "next/server";
import { updateTipoTransporteSchema } from "@/features/tipos-transporte/application/tipo-transporte-schemas";
import { inMemoryTipoTransporteRepository } from "@/features/tipos-transporte/infrastructure/repositories/in-memory-tipo-transporte-repository";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tipoTransporte = inMemoryTipoTransporteRepository.findById(id);
  if (!tipoTransporte) {
    return NextResponse.json({ error: "Tipo de transporte não encontrado." }, { status: 404 });
  }
  return NextResponse.json(tipoTransporte);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, updateTipoTransporteSchema);
  if (parsed.response) return parsed.response;

  const tipoTransporte = inMemoryTipoTransporteRepository.update(id, parsed.data);
  if (!tipoTransporte) {
    return NextResponse.json({ error: "Tipo de transporte não encontrado." }, { status: 404 });
  }
  return NextResponse.json(tipoTransporte);
}
