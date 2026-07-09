"use client";

import Link from "next/link";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Plus } from "@/shared/components/icons";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/list-state";
import { Button } from "@/shared/components/ui/button";
import { useSalesOrders } from "../hooks/use-sales-orders";
import { SalesOrderTable } from "./sales-order-table";

export function OrdensDeVendaPage() {
  const { data: orders, isLoading, isError } = useSalesOrders();
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ordens de venda</h1>
          <p className="text-sm text-muted-foreground">
            Criação e acompanhamento do ciclo de vida das ordens de venda.
          </p>
        </div>
        <Button
          render={<Link href="/ordens-de-venda/nova" />}
          nativeButton={false}
          className="w-full sm:w-auto"
        >
          <Plus />
          Nova ordem de venda
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Carregando ordens de venda…" />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar as ordens de venda." />
      ) : !orders?.length ? (
        <EmptyState message="Nenhuma ordem de venda criada ainda." />
      ) : (
        <SalesOrderTable orders={orders} clientes={clientes} tiposTransporte={tiposTransporte} />
      )}
    </div>
  );
}
