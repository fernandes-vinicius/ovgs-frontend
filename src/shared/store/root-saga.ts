import { all } from "redux-saga/effects";
import { confirmarAgendamentoSaga } from "@/features/agendamento/presentation/store/confirmar-agendamento-saga";
import { monitoramentoSaga } from "@/features/ordens-de-venda/presentation/store/monitoramento-saga";
import { orderStatusSaga } from "@/features/ordens-de-venda/presentation/store/order-status-saga";

export function* rootSaga() {
  yield all([orderStatusSaga(), monitoramentoSaga(), confirmarAgendamentoSaga()]);
}
