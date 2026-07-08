"use client";

import { useMemo } from "react";
import { useClientes } from "@/features/clientes/presentation/hooks/use-clientes";
import { useSalesOrders } from "@/features/ordens-de-venda/presentation/hooks/use-sales-orders";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { AgendamentoRow } from "./agendamento-row";

export function CentralAgendamentoPage() {
  const { data: orders, isLoading, isError } = useSalesOrders();
  const { data: clientes } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();

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

  // Ordens recém-criadas ainda não têm o que agendar — entram nessa central
  // a partir do momento em que passam a PLANEJADA.
  const ordensRelevantes = (orders ?? []).filter((order) => order.status !== "CRIADA");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Central de agendamento</h1>
        <p className="text-sm text-muted-foreground">
          Defina data de entrega e janela de atendimento, confirme ou reagende ordens de venda
          planejadas.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando ordens de venda…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Não foi possível carregar as ordens de venda.</p>
      ) : !ordensRelevantes.length ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma ordem de venda planejada aguardando agendamento no momento.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agendamento</TableHead>
              <TableHead className="w-px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordensRelevantes.map((order) => (
              <AgendamentoRow
                key={order.id}
                ordemId={order.id}
                status={order.status}
                clienteNome={clienteNomePorId.get(order.clienteId) ?? order.clienteId}
                tipoTransporteNome={
                  tipoNomePorId.get(order.tipoTransporteId) ?? order.tipoTransporteId
                }
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
