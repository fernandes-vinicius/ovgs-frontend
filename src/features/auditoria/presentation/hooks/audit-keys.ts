import type { AuditFilter } from "../../domain/audit-repository";

export const auditKeys = {
  all: ["auditoria"] as const,
  list: (filter?: AuditFilter) => [...auditKeys.all, "list", filter ?? {}] as const,
};
