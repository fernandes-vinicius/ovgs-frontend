"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auditKeys } from "@/features/auditoria/presentation/hooks/audit-keys";
import { httpSalesOrderRepository } from "../../infrastructure/repositories/http-sales-order-repository";
import { salesOrderKeys } from "./sales-order-keys";

export function useChangeOrderTransport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tipoTransporteId }: { id: string; tipoTransporteId: string }) =>
      httpSalesOrderRepository.changeTransport(id, tipoTransporteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
