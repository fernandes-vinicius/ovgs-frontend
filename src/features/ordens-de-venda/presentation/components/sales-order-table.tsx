"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Cliente } from "@/features/clientes/domain/cliente";
import type { TipoTransporte } from "@/features/tipos-transporte/domain/tipo-transporte";
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
import type { SalesOrder } from "../../domain/sales-order";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "../order-status-labels";

const PAGE_SIZE = 8;

interface SalesOrderTableProps {
  orders: SalesOrder[];
  clientes?: Cliente[];
  tiposTransporte?: TipoTransporte[];
}

export function SalesOrderTable({ orders, clientes, tiposTransporte }: SalesOrderTableProps) {
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

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
