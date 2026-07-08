"use client";

import { useQuery } from "@tanstack/react-query";
import type { SalesOrderFilter } from "../../domain/sales-order-repository";
import { httpSalesOrderRepository } from "../../infrastructure/repositories/http-sales-order-repository";
import { salesOrderKeys } from "./sales-order-keys";

export function useSalesOrders(filter?: SalesOrderFilter) {
  return useQuery({
    queryKey: salesOrderKeys.list(filter),
    queryFn: () => httpSalesOrderRepository.findAll(filter),
  });
}
