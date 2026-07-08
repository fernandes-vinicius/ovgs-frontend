import type { AuditRepository } from "@/features/auditoria/domain/audit-repository";
import { err, notFound, ok, type Result } from "@/shared/types/result";
import type { Agendamento } from "../domain/agendamento";
import type { AgendamentoRepository } from "../domain/agendamento-repository";

interface Deps {
  agendamentoRepository: AgendamentoRepository;
  auditRepository: AuditRepository;
}

export function confirmarAgendamento(ordemId: string, deps: Deps): Result<Agendamento> {
  const agendamento = deps.agendamentoRepository.findByOrdemId(ordemId);
  if (!agendamento) return err(notFound("Agendamento não encontrado para esta ordem de venda."));

  const estadoAnterior = { confirmado: agendamento.confirmado };
  const confirmado = deps.agendamentoRepository.confirmar(ordemId);
  if (!confirmado) return err(notFound("Agendamento não encontrado para esta ordem de venda."));

  deps.auditRepository.record({
    entidadeTipo: "Agendamento",
    entidadeId: ordemId,
    acao: "ALTERACAO_AGENDAMENTO",
    estadoAnterior,
    estadoPosterior: { confirmado: true },
  });

  return ok(confirmado);
}
