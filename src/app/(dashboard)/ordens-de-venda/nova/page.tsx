import type { Metadata } from "next";
import { SalesOrderForm } from "@/features/ordens-de-venda/presentation/components/sales-order-form";

export const metadata: Metadata = {
  title: "Nova Ordem de Venda — OVGS",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Nova ordem de venda</h1>
        <p className="text-sm text-muted-foreground">
          Selecione o cliente, um tipo de transporte autorizado e ao menos um item.
        </p>
      </div>
      <SalesOrderForm />
    </div>
  );
}
