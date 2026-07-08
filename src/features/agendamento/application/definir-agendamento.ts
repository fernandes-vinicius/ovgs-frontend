import type { AuditRepository } from "@/features/auditoria/domain/audit-repository";
import type { SalesOrderRepository } from "@/features/ordens-de-venda/domain/sales-order-repository";
import { err, notFound, ok, type Result } from "@/shared/types/result";
import type { Agendamento, JanelaAtendimento } from "../domain/agendamento";
import type { AgendamentoRepository } from "../domain/agendamento-repository";

interface Deps {
  agendamentoRepository: AgendamentoRepository;
  salesOrderRepository: SalesOrderRepository;
  auditRepository: AuditRepository;
}

export function definirAgendamento(
  ordemId: string,
  dataEntrega: string,
  janela: JanelaAtendimento,
  deps: Deps,
): Result<Agendamento> {
  const order = deps.salesOrderRepository.findById(ordemId);
  if (!order) return err(notFound("Ordem de venda não encontrada."));

  const estadoAnterior = deps.agendamentoRepository.findByOrdemId(ordemId);
  const agendamento = deps.agendamentoRepository.definir(ordemId, dataEntrega, janela);
  deps.salesOrderRepository.linkAgendamento(ordemId, ordemId);

  deps.auditRepository.record({
    entidadeTipo: "Agendamento",
    entidadeId: ordemId,
    acao: "ALTERACAO_AGENDAMENTO",
    estadoAnterior: estadoAnterior
      ? { dataEntrega: estadoAnterior.dataEntrega, janela: estadoAnterior.janela }
      : undefined,
    estadoPosterior: { dataEntrega, janela },
  });

  return ok(agendamento);
}
