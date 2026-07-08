import { all } from "redux-saga/effects";
import { monitoramentoSaga } from "@/features/ordens-de-venda/presentation/store/monitoramento-saga";
import { orderStatusSaga } from "@/features/ordens-de-venda/presentation/store/order-status-saga";

export function* rootSaga() {
  yield all([orderStatusSaga(), monitoramentoSaga()]);
}
