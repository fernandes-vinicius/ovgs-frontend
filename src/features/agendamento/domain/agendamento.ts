export interface JanelaAtendimento {
  inicio: string;
  fim: string;
}

export interface ReagendamentoHistorico {
  dataEntregaAnterior: string;
  janelaAnterior: JanelaAtendimento;
  timestamp: string;
}

export interface Agendamento {
  ordemId: string;
  dataEntrega: string;
  janela: JanelaAtendimento;
  confirmado: boolean;
  historicoReagendamentos: ReagendamentoHistorico[];
}
