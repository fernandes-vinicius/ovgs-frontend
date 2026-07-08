"use client";

import { useQuery } from "@tanstack/react-query";
import { httpClienteRepository } from "../../infrastructure/repositories/http-cliente-repository";
import { clienteKeys } from "./cliente-keys";

export function useClientes() {
  return useQuery({
    queryKey: clienteKeys.lists(),
    queryFn: httpClienteRepository.findAll,
  });
}
