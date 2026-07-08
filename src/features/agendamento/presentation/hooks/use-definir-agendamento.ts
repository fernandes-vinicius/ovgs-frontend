"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auditKeys } from "@/features/auditoria/presentation/hooks/audit-keys";
import type { DefinirAgendamentoInput } from "../../application/agendamento-schemas";
import { httpAgendamentoRepository } from "../../infrastructure/repositories/http-agendamento-repository";
import { agendamentoKeys } from "./agendamento-keys";

export function useDefinirAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ordemId, input }: { ordemId: string; input: DefinirAgendamentoInput }) =>
      httpAgendamentoRepository.definir(ordemId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: agendamentoKeys.detail(variables.ordemId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
