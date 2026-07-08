"use client";

import { Separator } from "@/shared/components/ui/separator";
import { formatDateTime } from "@/shared/lib/date";
import type { AuditEvent } from "../../domain/audit-event";

const ACTION_LABELS: Record<AuditEvent["acao"], string> = {
  CRIACAO_ORDEM_VENDA: "Ordem de venda criada",
  ALTERACAO_STATUS: "Status alterado",
  ALTERACAO_TRANSPORTE: "Transporte alterado",
  ALTERACAO_AGENDAMENTO: "Agendamento alterado",
};

interface AuditTimelineProps {
  events: AuditEvent[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>;
  }

  const ordered = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <ul className="flex flex-col gap-3">
      {ordered.map((event, index) => (
        <li key={event.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{ACTION_LABELS[event.acao]}</span>
            <span className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</span>
          </div>
          {index < ordered.length - 1 && <Separator />}
        </li>
      ))}
    </ul>
  );
}
