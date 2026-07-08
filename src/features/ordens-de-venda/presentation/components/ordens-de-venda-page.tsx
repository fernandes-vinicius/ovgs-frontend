"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Plus } from "@/shared/components/icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDateTime } from "@/shared/lib/date";
import { useSalesOrders } from "../hooks/use-sales-orders";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "../order-status-labels";

const PAGE_SIZE = 8;

export function OrdensDeVendaPage() {
  const { data: orders, isLoading, isError } = useSalesOrders();
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();
  const [page, setPage] = useState(1);

  const clienteNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const cliente of clientes ?? []) map.set(cliente.id, cliente.nome);
    return map;
  }, [clientes]);

  const tipoNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const tipo of tiposTransporte ?? []) map.set(tipo.id, tipo.nome);
    return map;
  }, [tiposTransporte]);

  const totalPages = orders ? Math.max(1, Math.ceil(orders.length / PAGE_SIZE)) : 1;
  const pageOrders = orders?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

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
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Transporte</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {clienteNomePorId.get(order.clienteId) ?? order.clienteId}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tipoNomePorId.get(order.tipoTransporteId) ?? order.tipoTransporteId}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.itens.length} {order.itens.length === 1 ? "item" : "itens"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/ordens-de-venda/${order.id}`} />}
                      nativeButton={false}
                    >
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.max(1, current - 1));
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.min(totalPages, current + 1));
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
