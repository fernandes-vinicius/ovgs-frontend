import { all } from "redux-saga/effects";
import { orderStatusSaga } from "@/features/ordens-de-venda/presentation/store/order-status-saga";

export function* rootSaga() {
  yield all([orderStatusSaga()]);
}
