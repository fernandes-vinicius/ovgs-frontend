import { NextResponse } from "next/server";
import { createClienteSchema } from "@/features/clientes/application/cliente-schemas";
import { inMemoryClienteRepository } from "@/features/clientes/infrastructure/repositories/in-memory-cliente-repository";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

export async function GET() {
  return NextResponse.json(inMemoryClienteRepository.findAll());
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createClienteSchema);
  if (parsed.response) return parsed.response;

  const cliente = inMemoryClienteRepository.create(parsed.data);
  return NextResponse.json(cliente, { status: 201 });
}
