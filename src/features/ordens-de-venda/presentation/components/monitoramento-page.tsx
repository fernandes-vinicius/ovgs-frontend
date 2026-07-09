"use client";

import { useMemo } from "react";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/list-state";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ORDER_STATUSES, type OrderStatus } from "../../domain/order-status";
import { useMonitoramentoFiltros } from "../hooks/use-monitoramento-filtros";
import { useSalesOrders } from "../hooks/use-sales-orders";
import { ORDER_STATUS_LABELS } from "../order-status-labels";
import { SalesOrderTable } from "./sales-order-table";

const TODOS = "todos";

export function MonitoramentoPage() {
  const { draft, aplicado, setFiltro } = useMonitoramentoFiltros();
  const { data: orders, isLoading, isError } = useSalesOrders(aplicado);
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();

  const contagemPorStatus = useMemo(() => {
    const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
      OrderStatus,
      number
    >;
    for (const order of orders ?? []) counts[order.status] += 1;
    return counts;
  }, [orders]);

  // Passado como `items` pro Select (não só como `SelectItem` filhos): sem
  // isso, `SelectValue` só resolve o rótulo exibido depois que o usuário abre
  // o dropdown pelo menos uma vez — um valor vindo direto da querystring (ex.:
  // reload de um link com `?clienteId=...`) ficaria mostrando o id cru.
  const statusItems = useMemo(
    () => ({
      [TODOS]: "Todos os status",
      ...Object.fromEntries(ORDER_STATUSES.map((s) => [s, ORDER_STATUS_LABELS[s]])),
    }),
    [],
  );
  const clienteItems = useMemo(
    () => ({
      [TODOS]: "Todos os clientes",
      ...Object.fromEntries((clientes ?? []).map((c) => [c.id, c.nome])),
    }),
    [clientes],
  );
  const tipoTransporteItems = useMemo(
    () => ({
      [TODOS]: "Todos os transportes",
      ...Object.fromEntries((tiposTransporte ?? []).map((t) => [t.id, t.nome])),
    }),
    [tiposTransporte],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Monitoramento operacional</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada das ordens de venda por status, cliente, transporte e data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ORDER_STATUSES.map((status) => (
          <Card key={status} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{ORDER_STATUS_LABELS[status]}</span>
              <span className="text-2xl font-semibold">{contagemPorStatus[status]}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="filtro-status">Status</FieldLabel>
            <FieldContent>
              <Select
                items={statusItems}
                value={draft.status ?? TODOS}
                onValueChange={(value) =>
                  setFiltro({
                    ...draft,
                    status: value && value !== TODOS ? (value as OrderStatus) : undefined,
                  })
                }
              >
                <SelectTrigger id="filtro-status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos os status</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="filtro-cliente">Cliente</FieldLabel>
            <FieldContent>
              <Select
                items={clienteItems}
                value={draft.clienteId ?? TODOS}
                onValueChange={(value) =>
                  setFiltro({ ...draft, clienteId: value && value !== TODOS ? value : undefined })
                }
              >
                <SelectTrigger id="filtro-cliente" className="w-full">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos os clientes</SelectItem>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="filtro-transporte">Tipo de transporte</FieldLabel>
            <FieldContent>
              <Select
                items={tipoTransporteItems}
                value={draft.tipoTransporteId ?? TODOS}
                onValueChange={(value) =>
                  setFiltro({
                    ...draft,
                    tipoTransporteId: value && value !== TODOS ? value : undefined,
                  })
                }
              >
                <SelectTrigger id="filtro-transporte" className="w-full">
                  <SelectValue placeholder="Tipo de transporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos os transportes</SelectItem>
                  {tiposTransporte?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="filtro-data">Data de criação</FieldLabel>
            <FieldContent>
              <Input
                id="filtro-data"
                type="date"
                value={draft.data ?? ""}
                onChange={(event) => setFiltro({ ...draft, data: event.target.value || undefined })}
              />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <div>
        <Button variant="outline" size="sm" onClick={() => setFiltro({})}>
          Limpar filtros
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Carregando ordens de venda…" />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar as ordens de venda." />
      ) : !orders?.length ? (
        <EmptyState message="Nenhuma ordem de venda encontrada para os filtros aplicados." />
      ) : (
        <SalesOrderTable orders={orders} clientes={clientes} tiposTransporte={tiposTransporte} />
      )}
    </div>
  );
}
