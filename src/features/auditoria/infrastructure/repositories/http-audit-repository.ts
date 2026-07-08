import { httpClient } from "@/shared/lib/http-client";
import type { AuditEvent } from "../../domain/audit-event";
import type { AuditFilter } from "../../domain/audit-repository";

function buildQuery(filter?: AuditFilter): string {
  if (!filter) return "";
  const params = new URLSearchParams();
  if (filter.entidadeTipo) params.set("entidadeTipo", filter.entidadeTipo);
  if (filter.entidadeId) params.set("entidadeId", filter.entidadeId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const httpAuditRepository = {
  findAll: (filter?: AuditFilter) =>
    httpClient.get<AuditEvent[]>(`/api/auditoria${buildQuery(filter)}`),
};
