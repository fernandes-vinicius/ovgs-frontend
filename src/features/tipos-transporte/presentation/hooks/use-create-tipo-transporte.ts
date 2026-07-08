"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTipoTransporteInput } from "../../application/tipo-transporte-schemas";
import { httpTipoTransporteRepository } from "../../infrastructure/repositories/http-tipo-transporte-repository";
import { tipoTransporteKeys } from "./tipo-transporte-keys";

export function useCreateTipoTransporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTipoTransporteInput) => httpTipoTransporteRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoTransporteKeys.lists() });
    },
  });
}
