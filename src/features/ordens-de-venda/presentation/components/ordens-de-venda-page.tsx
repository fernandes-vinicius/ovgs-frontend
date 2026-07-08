"use client";

import Link from "next/link";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Plus } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { useSalesOrders } from "../hooks/use-sales-orders";
import { SalesOrderTable } from "./sales-order-table";

export function OrdensDeVendaPage() {
  const { data: orders, isLoading, isError } = useSalesOrders();
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ordens de venda</h1>
          <p className="text-sm text-muted-foreground">
            Criação e acompanhamento do ciclo de vida das ordens de venda.
          </p>
        </div>
        <Button render={<Link href="/ordens-de-venda/nova" />} nativeButton={false}>
          <Plus />
          Nova ordem de venda
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando ordens de venda…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Não foi possível carregar as ordens de venda.</p>
      ) : !orders?.length ? (
        <p className="text-sm text-muted-foreground">Nenhuma ordem de venda criada ainda.</p>
      ) : (
        <SalesOrderTable orders={orders} clientes={clientes} tiposTransporte={tiposTransporte} />
      )}
    </div>
  );
}
