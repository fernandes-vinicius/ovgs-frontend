"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateClienteInput } from "../../application/cliente-schemas";
import { httpClienteRepository } from "../../infrastructure/repositories/http-cliente-repository";
import { clienteKeys } from "./cliente-keys";

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClienteInput) => httpClienteRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clienteKeys.lists() });
    },
  });
}
