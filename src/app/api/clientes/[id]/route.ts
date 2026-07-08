import { NextResponse } from "next/server";
import { updateClienteSchema } from "@/features/clientes/application/cliente-schemas";
import { inMemoryClienteRepository } from "@/features/clientes/infrastructure/repositories/in-memory-cliente-repository";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const cliente = inMemoryClienteRepository.findById(id);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, updateClienteSchema);
  if (parsed.response) return parsed.response;

  const cliente = inMemoryClienteRepository.update(id, parsed.data);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json(cliente);
}
