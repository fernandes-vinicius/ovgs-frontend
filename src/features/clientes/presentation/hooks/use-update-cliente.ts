"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateClienteInput } from "../../application/cliente-schemas";
import { httpClienteRepository } from "../../infrastructure/repositories/http-cliente-repository";
import { clienteKeys } from "./cliente-keys";

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClienteInput }) =>
      httpClienteRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clienteKeys.lists() });
    },
  });
}
