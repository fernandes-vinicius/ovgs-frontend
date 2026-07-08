"use client";

import { useQuery } from "@tanstack/react-query";
import { httpItemRepository } from "../../infrastructure/repositories/http-item-repository";
import { itemKeys } from "./item-keys";

export function useItens() {
  return useQuery({
    queryKey: itemKeys.lists(),
    queryFn: httpItemRepository.findAll,
  });
}
