import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OrderStatus } from "../../domain/order-status";

interface ChangeOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

interface OrderIdPayload {
  orderId: string;
}

interface OrderStatusState {
  pendingByOrderId: Record<string, OrderStatus | undefined>;
}

const initialState: OrderStatusState = {
  pendingByOrderId: {},
};

const orderStatusSlice = createSlice({
  name: "orderStatus",
  initialState,
  reducers: {
    // No state change here — the saga picks this up via `takeEvery` and drives
    // the optimistic-update / API-call / settle sequence itself.
    changeOrderStatusRequested: (_state, _action: PayloadAction<ChangeOrderStatusPayload>) => {},
    orderStatusOptimisticallySet: (state, action: PayloadAction<ChangeOrderStatusPayload>) => {
      state.pendingByOrderId[action.payload.orderId] = action.payload.status;
    },
    orderStatusSettled: (state, action: PayloadAction<OrderIdPayload>) => {
      delete state.pendingByOrderId[action.payload.orderId];
    },
  },
});

export const { changeOrderStatusRequested, orderStatusOptimisticallySet, orderStatusSettled } =
  orderStatusSlice.actions;

export const orderStatusReducer = orderStatusSlice.reducer;
