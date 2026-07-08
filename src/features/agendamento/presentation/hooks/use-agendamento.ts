"use client";

import { useQuery } from "@tanstack/react-query";
import { httpAgendamentoRepository } from "../../infrastructure/repositories/http-agendamento-repository";
import { agendamentoKeys } from "./agendamento-keys";

export function useAgendamento(ordemId: string) {
  return useQuery({
    queryKey: agendamentoKeys.detail(ordemId),
    queryFn: () => httpAgendamentoRepository.findByOrdemId(ordemId),
    enabled: Boolean(ordemId),
  });
}
