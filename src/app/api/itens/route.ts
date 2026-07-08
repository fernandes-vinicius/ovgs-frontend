import { NextResponse } from "next/server";
import { createItemSchema } from "@/features/itens/application/item-schemas";
import { inMemoryItemRepository } from "@/features/itens/infrastructure/repositories/in-memory-item-repository";
import { parseJsonBody } from "@/shared/lib/parse-json-body";

export async function GET() {
  return NextResponse.json(inMemoryItemRepository.findAll());
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createItemSchema);
  if (parsed.response) return parsed.response;

  if (inMemoryItemRepository.findBySku(parsed.data.sku)) {
    return NextResponse.json({ error: "Já existe um item com este SKU." }, { status: 422 });
  }

  const item = inMemoryItemRepository.create(parsed.data);
  return NextResponse.json(item, { status: 201 });
}
