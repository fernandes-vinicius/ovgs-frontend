import type { Metadata } from "next";
import { SalesOrderDetail } from "@/features/ordens-de-venda/presentation/components/sales-order-detail";

export const metadata: Metadata = {
  title: "Ordem de Venda — OVGS",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SalesOrderDetail orderId={id} />;
}
