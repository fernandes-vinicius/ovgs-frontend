import { db } from "@/mocks/in-memory-db";
import type { Agendamento, JanelaAtendimento } from "../../domain/agendamento";
import type { AgendamentoRepository } from "../../domain/agendamento-repository";

export const inMemoryAgendamentoRepository: AgendamentoRepository = {
  findByOrdemId(ordemId) {
    return db.agendamentos.find((agendamento) => agendamento.ordemId === ordemId);
  },
  definir(ordemId, dataEntrega, janela) {
    const existente = db.agendamentos.find((a) => a.ordemId === ordemId);
    if (existente) {
      existente.dataEntrega = dataEntrega;
      existente.janela = janela;
      existente.confirmado = false;
      return existente;
    }

    const agendamento: Agendamento = {
      ordemId,
      dataEntrega,
      janela,
      confirmado: false,
      historicoReagendamentos: [],
    };
    db.agendamentos.push(agendamento);
    return agendamento;
  },
  confirmar(ordemId) {
    const agendamento = db.agendamentos.find((a) => a.ordemId === ordemId);
    if (!agendamento) return undefined;
    agendamento.confirmado = true;
    return agendamento;
  },
  reagendar(ordemId, dataEntrega, janela: JanelaAtendimento) {
    const agendamento = db.agendamentos.find((a) => a.ordemId === ordemId);
    if (!agendamento) return undefined;

    agendamento.historicoReagendamentos.push({
      dataEntregaAnterior: agendamento.dataEntrega,
      janelaAnterior: agendamento.janela,
      timestamp: new Date().toISOString(),
    });
    agendamento.dataEntrega = dataEntrega;
    agendamento.janela = janela;
    agendamento.confirmado = false;
    return agendamento;
  },
};
