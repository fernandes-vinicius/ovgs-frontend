"use client";

import { useQuery } from "@tanstack/react-query";
import { httpSalesOrderRepository } from "../../infrastructure/repositories/http-sales-order-repository";
import { salesOrderKeys } from "./sales-order-keys";

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: salesOrderKeys.detail(id),
    queryFn: () => httpSalesOrderRepository.findById(id),
    enabled: Boolean(id),
  });
}
