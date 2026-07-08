"use client";

import { useState } from "react";
import { AuditTimeline } from "@/features/auditoria/presentation/components/audit-timeline";
import { useAuditEvents } from "@/features/auditoria/presentation/hooks/use-audit-events";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useItens } from "@/features/itens/presentation/hooks/use-itens";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { ArrowRight, Loader2, Pencil } from "@/shared/components/icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatDateTime } from "@/shared/lib/date";
import { nextValidStatuses } from "../../domain/state-machine";
import { useChangeOrderStatus } from "../hooks/use-change-order-status";
import { useSalesOrder } from "../hooks/use-sales-order";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "../order-status-labels";
import { EditTransportDialog } from "./edit-transport-dialog";

const TRANSPORT_EDITABLE_STATUSES = ["CRIADA", "PLANEJADA"];

interface SalesOrderDetailProps {
  orderId: string;
}

export function SalesOrderDetail({ orderId }: SalesOrderDetailProps) {
  const { data: order, isLoading, isError } = useSalesOrder(orderId);
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();
  const { data: itens } = useItens();
  const { data: auditEvents } = useAuditEvents({ entidadeId: orderId });
  const { changeStatus, pendingStatus, isPending } = useChangeOrderStatus(orderId);
  const [editTransportOpen, setEditTransportOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando ordem de venda…</p>;
  if (isError || !order) {
    return (
      <p className="text-sm text-destructive">Não foi possível carregar esta ordem de venda.</p>
    );
  }

  const cliente = clientes?.find((c) => c.id === order.clienteId);
  const tipoTransporte = tiposTransporte?.find((t) => t.id === order.tipoTransporteId);
  const displayedStatus = pendingStatus ?? order.status;
  const proximosStatus = nextValidStatuses(displayedStatus);
  const podeEditarTransporte =
    TRANSPORT_EDITABLE_STATUSES.includes(displayedStatus) && Boolean(cliente);

  function itemNome(itemId: string) {
    return itens?.find((item) => item.id === itemId)?.nome ?? itemId;
  }

  function itemSku(itemId: string) {
    return itens?.find((item) => item.id === itemId)?.sku ?? "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ordem de venda</h1>
          <p className="text-sm text-muted-foreground">
            Criada em {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[displayedStatus]}>
          {ORDER_STATUS_LABELS[displayedStatus]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliente e transporte</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium">{cliente?.nome ?? order.clienteId}</p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de transporte</p>
                <p className="text-sm font-medium">
                  {tipoTransporte?.nome ?? order.tipoTransporteId}
                </p>
              </div>
              {podeEditarTransporte && (
                <Button variant="outline" size="sm" onClick={() => setEditTransportOpen(true)}>
                  <Pencil />
                  Editar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Fluxo: Criada → Planejada → Agendada → Em transporte → Entregue
            </p>
            {proximosStatus.length > 0 ? (
              proximosStatus.map((status) => (
                <Button key={status} onClick={() => changeStatus(status)} disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Avançar para {ORDER_STATUS_LABELS[status]}
                  <ArrowRight />
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Esta ordem já foi entregue.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {order.itens.map((item, index) => (
              <li
                key={`${item.itemId}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {itemNome(item.itemId)}{" "}
                  <span className="text-muted-foreground">({itemSku(item.itemId)})</span>
                </span>
                <span className="text-muted-foreground">{item.quantidade}x</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTimeline events={auditEvents ?? []} tiposTransporte={tiposTransporte} />
        </CardContent>
      </Card>

      {cliente && tiposTransporte && (
        <EditTransportDialog
          open={editTransportOpen}
          onOpenChange={setEditTransportOpen}
          orderId={order.id}
          tipoTransporteAtualId={order.tipoTransporteId}
          cliente={cliente}
          tiposTransporte={tiposTransporte}
        />
      )}
    </div>
  );
}
