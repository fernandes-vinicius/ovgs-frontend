import { NextResponse } from "next/server";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const order = inMemorySalesOrderRepository.findById(id);
  if (!order)
    return NextResponse.json({ error: "Ordem de venda não encontrada." }, { status: 404 });
  return NextResponse.json(order);
}
