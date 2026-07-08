"use client";

import { useQuery } from "@tanstack/react-query";
import { httpTipoTransporteRepository } from "../../infrastructure/repositories/http-tipo-transporte-repository";
import { tipoTransporteKeys } from "./tipo-transporte-keys";

export function useTipoTransporte(id: string) {
  return useQuery({
    queryKey: tipoTransporteKeys.detail(id),
    queryFn: () => httpTipoTransporteRepository.findById(id),
    enabled: Boolean(id),
  });
}
