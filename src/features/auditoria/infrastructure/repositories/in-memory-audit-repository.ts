import { randomUUID } from "node:crypto";
import { db } from "@/mocks/in-memory-db";
import type { AuditEvent } from "../../domain/audit-event";
import type { AuditRepository } from "../../domain/audit-repository";

export const inMemoryAuditRepository: AuditRepository = {
  record(input) {
    const event: AuditEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...input,
      // Os repositórios in-memory mutam entidades no lugar (ex.: updateStatus
      // faz `order.status = ...`). Sem clonar aqui, um evento de auditoria que
      // guardou uma referência viva para a entidade "veria" mutações futuras
      // e passaria a mentir sobre o estado histórico — o oposto do que um
      // registro de auditoria deve garantir.
      estadoAnterior:
        input.estadoAnterior !== undefined ? structuredClone(input.estadoAnterior) : undefined,
      estadoPosterior:
        input.estadoPosterior !== undefined ? structuredClone(input.estadoPosterior) : undefined,
    };
    db.auditLog.push(event);
    return event;
  },
  findAll(filter) {
    return db.auditLog.filter((event) => {
      if (filter?.entidadeTipo && event.entidadeTipo !== filter.entidadeTipo) return false;
      if (filter?.entidadeId && event.entidadeId !== filter.entidadeId) return false;
      return true;
    });
  },
};
