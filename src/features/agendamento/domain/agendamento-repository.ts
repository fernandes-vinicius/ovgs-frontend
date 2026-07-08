import type { Agendamento, JanelaAtendimento } from "./agendamento";

export interface AgendamentoRepository {
  findByOrdemId(ordemId: string): Agendamento | undefined;
  definir(ordemId: string, dataEntrega: string, janela: JanelaAtendimento): Agendamento;
  confirmar(ordemId: string): Agendamento | undefined;
  reagendar(
    ordemId: string,
    dataEntrega: string,
    janela: JanelaAtendimento,
  ): Agendamento | undefined;
}
