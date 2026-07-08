"use client";

import { useQuery } from "@tanstack/react-query";
import { httpTipoTransporteRepository } from "../../infrastructure/repositories/http-tipo-transporte-repository";
import { tipoTransporteKeys } from "./tipo-transporte-keys";

export function useTiposTransporte() {
  return useQuery({
    queryKey: tipoTransporteKeys.lists(),
    queryFn: httpTipoTransporteRepository.findAll,
  });
}
