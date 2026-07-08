"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuditFilter } from "../../domain/audit-repository";
import { httpAuditRepository } from "../../infrastructure/repositories/http-audit-repository";
import { auditKeys } from "./audit-keys";

export function useAuditEvents(filter: AuditFilter) {
  return useQuery({
    queryKey: auditKeys.list(filter),
    queryFn: () => httpAuditRepository.findAll(filter),
  });
}
