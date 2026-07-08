"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auditKeys } from "@/features/auditoria/presentation/hooks/audit-keys";
import type { JanelaAtendimento } from "../../domain/agendamento";
import { httpAgendamentoRepository } from "../../infrastructure/repositories/http-agendamento-repository";
import { agendamentoKeys } from "./agendamento-keys";

interface ReagendarInput {
  ordemId: string;
  dataEntrega: string;
  janela: JanelaAtendimento;
}

export function useReagendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ordemId, dataEntrega, janela }: ReagendarInput) =>
      httpAgendamentoRepository.reagendar(ordemId, dataEntrega, janela),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: agendamentoKeys.detail(variables.ordemId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
