import type { AuditAction, AuditEntityType, AuditEvent } from "./audit-event";

export interface RecordAuditEventInput {
  entidadeTipo: AuditEntityType;
  entidadeId: string;
  acao: AuditAction;
  estadoAnterior?: unknown;
  estadoPosterior?: unknown;
}

export interface AuditFilter {
  entidadeTipo?: AuditEntityType;
  entidadeId?: string;
}

export interface AuditRepository {
  record(input: RecordAuditEventInput): AuditEvent;
  findAll(filter?: AuditFilter): AuditEvent[];
}
