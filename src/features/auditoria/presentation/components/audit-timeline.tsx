"use client";

import { useMemo } from "react";
import type { OrderStatus } from "@/features/ordens-de-venda/domain/order-status";
import { ORDER_STATUS_LABELS } from "@/features/ordens-de-venda/presentation/order-status-labels";
import type { TipoTransporte } from "@/features/tipos-transporte/domain/tipo-transporte";
import { Separator } from "@/shared/components/ui/separator";
import { formatDate, formatDateTime } from "@/shared/lib/date";
import type { AuditEvent } from "../../domain/audit-event";

const ACTION_LABELS: Record<AuditEvent["acao"], string> = {
  CRIACAO_ORDEM_VENDA: "Ordem de venda criada",
  ALTERACAO_STATUS: "Status alterado",
  ALTERACAO_TRANSPORTE: "Transporte alterado",
  ALTERACAO_AGENDAMENTO: "Agendamento alterado",
};

interface AgendamentoEstado {
  dataEntrega?: string;
  janela?: { inicio: string; fim: string };
  confirmado?: boolean;
}

// Cada tipo de ação guarda um formato diferente em estadoAnterior/estadoPosterior
// (ver os use-cases em features/ordens-de-venda|agendamento/application) — esta
// função só sabe formatar o que já existe, sem inventar dado.
function describeChange(event: AuditEvent, tipoNomePorId: Map<string, string>): string | null {
  switch (event.acao) {
    case "ALTERACAO_STATUS": {
      const before = event.estadoAnterior as OrderStatus | undefined;
      const after = event.estadoPosterior as OrderStatus | undefined;
      if (!before || !after) return null;
      return `${ORDER_STATUS_LABELS[before]} → ${ORDER_STATUS_LABELS[after]}`;
    }
    case "ALTERACAO_TRANSPORTE": {
      const before = event.estadoAnterior as string | undefined;
      const after = event.estadoPosterior as string | undefined;
      if (!before || !after) return null;
      return `${tipoNomePorId.get(before) ?? before} → ${tipoNomePorId.get(after) ?? after}`;
    }
    case "ALTERACAO_AGENDAMENTO": {
      const after = event.estadoPosterior as AgendamentoEstado | undefined;
      if (!after) return null;
      if (typeof after.confirmado === "boolean") {
        return after.confirmado ? "Agendamento confirmado" : "Confirmação desfeita";
      }
      if (after.dataEntrega && after.janela) {
        return `${formatDate(after.dataEntrega)} · ${after.janela.inicio}–${after.janela.fim}`;
      }
      return null;
    }
    default:
      // CRIACAO_ORDEM_VENDA guarda a OV inteira em estadoPosterior — o rótulo
      // da ação já diz o que aconteceu, mostrar o objeto todo não ajudaria.
      return null;
  }
}

interface AuditTimelineProps {
  events: AuditEvent[];
  tiposTransporte?: TipoTransporte[];
}

export function AuditTimeline({ events, tiposTransporte }: AuditTimelineProps) {
  const tipoNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const tipo of tiposTransporte ?? []) map.set(tipo.id, tipo.nome);
    return map;
  }, [tiposTransporte]);

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>;
  }

  const ordered = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <ul className="flex flex-col gap-3">
      {ordered.map((event, index) => {
        const detalhe = describeChange(event, tipoNomePorId);
        return (
          <li key={event.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{ACTION_LABELS[event.acao]}</span>
                {detalhe && <span className="text-sm text-muted-foreground">{detalhe}</span>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)}
              </span>
            </div>
            {index < ordered.length - 1 && <Separator />}
          </li>
        );
      })}
    </ul>
  );
}
