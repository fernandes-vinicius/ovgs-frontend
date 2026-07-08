"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSalesOrderInput } from "../../application/sales-order-schemas";
import { httpSalesOrderRepository } from "../../infrastructure/repositories/http-sales-order-repository";
import { salesOrderKeys } from "./sales-order-keys";

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSalesOrderInput) => httpSalesOrderRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.lists() });
    },
  });
}
