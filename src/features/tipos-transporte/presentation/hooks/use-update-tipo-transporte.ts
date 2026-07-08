"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTipoTransporteInput } from "../../application/tipo-transporte-schemas";
import { httpTipoTransporteRepository } from "../../infrastructure/repositories/http-tipo-transporte-repository";
import { tipoTransporteKeys } from "./tipo-transporte-keys";

export function useUpdateTipoTransporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTipoTransporteInput }) =>
      httpTipoTransporteRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoTransporteKeys.lists() });
    },
  });
}
