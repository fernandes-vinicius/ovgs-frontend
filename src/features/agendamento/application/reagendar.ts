import type { AuditRepository } from "@/features/auditoria/domain/audit-repository";
import { err, notFound, ok, type Result } from "@/shared/types/result";
import type { Agendamento, JanelaAtendimento } from "../domain/agendamento";
import type { AgendamentoRepository } from "../domain/agendamento-repository";

interface Deps {
  agendamentoRepository: AgendamentoRepository;
  auditRepository: AuditRepository;
}

export function reagendar(
  ordemId: string,
  dataEntrega: string,
  janela: JanelaAtendimento,
  deps: Deps,
): Result<Agendamento> {
  const agendamento = deps.agendamentoRepository.findByOrdemId(ordemId);
  if (!agendamento) return err(notFound("Agendamento não encontrado para esta ordem de venda."));

  const estadoAnterior = { dataEntrega: agendamento.dataEntrega, janela: agendamento.janela };
  const atualizado = deps.agendamentoRepository.reagendar(ordemId, dataEntrega, janela);
  if (!atualizado) return err(notFound("Agendamento não encontrado para esta ordem de venda."));

  deps.auditRepository.record({
    entidadeTipo: "Agendamento",
    entidadeId: ordemId,
    acao: "ALTERACAO_AGENDAMENTO",
    estadoAnterior,
    estadoPosterior: { dataEntrega, janela },
  });

  return ok(atualizado);
}
