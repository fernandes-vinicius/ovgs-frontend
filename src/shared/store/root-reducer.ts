import { combineReducers } from "@reduxjs/toolkit";
import { monitoramentoReducer } from "@/features/ordens-de-venda/presentation/store/monitoramento-slice";
import { orderStatusReducer } from "@/features/ordens-de-venda/presentation/store/order-status-slice";

export const rootReducer = combineReducers({
  orderStatus: orderStatusReducer,
  monitoramento: monitoramentoReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
