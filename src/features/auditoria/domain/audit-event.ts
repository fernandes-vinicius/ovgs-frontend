export type AuditEntityType = "OrdemDeVenda" | "Agendamento";

export type AuditAction =
  | "CRIACAO_ORDEM_VENDA"
  | "ALTERACAO_STATUS"
  | "ALTERACAO_AGENDAMENTO"
  | "ALTERACAO_TRANSPORTE";

export interface AuditEvent {
  id: string;
  entidadeTipo: AuditEntityType;
  entidadeId: string;
  acao: AuditAction;
  estadoAnterior?: unknown;
  estadoPosterior?: unknown;
  timestamp: string;
}
