"use client";

import { useQuery } from "@tanstack/react-query";
import { httpClienteRepository } from "../../infrastructure/repositories/http-cliente-repository";
import { clienteKeys } from "./cliente-keys";

export function useCliente(id: string) {
  return useQuery({
    queryKey: clienteKeys.detail(id),
    queryFn: () => httpClienteRepository.findById(id),
    enabled: Boolean(id),
  });
}
