import { combineReducers } from "@reduxjs/toolkit";
import { orderStatusReducer } from "@/features/ordens-de-venda/presentation/store/order-status-slice";

export const rootReducer = combineReducers({
  orderStatus: orderStatusReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
