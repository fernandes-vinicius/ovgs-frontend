import type { DefinirAgendamentoInput } from "@/features/agendamento/application/agendamento-schemas";
import { HttpError, httpClient } from "@/shared/lib/http-client";
import type { Agendamento, JanelaAtendimento } from "../../domain/agendamento";

export const httpAgendamentoRepository = {
  async findByOrdemId(ordemId: string): Promise<Agendamento | null> {
    try {
      return await httpClient.get<Agendamento>(`/api/agendamentos/${ordemId}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },
  definir: (ordemId: string, input: DefinirAgendamentoInput) =>
    httpClient.post<Agendamento>(`/api/agendamentos/${ordemId}`, input),
  reagendar: (ordemId: string, dataEntrega: string, janela: JanelaAtendimento) =>
    httpClient.patch<Agendamento>(`/api/agendamentos/${ordemId}`, {
      action: "reagendar",
      dataEntrega,
      janela,
    }),
  confirmar: (ordemId: string) =>
    httpClient.patch<Agendamento>(`/api/agendamentos/${ordemId}`, { action: "confirmar" }),
};
