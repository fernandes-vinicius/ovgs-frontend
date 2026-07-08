"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateItemInput } from "../../application/item-schemas";
import { httpItemRepository } from "../../infrastructure/repositories/http-item-repository";
import { itemKeys } from "./item-keys";

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) => httpItemRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
