"use client";

import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import type { OrderStatus } from "../../domain/order-status";
import { changeOrderStatusRequested } from "../store/order-status-slice";

export function useChangeOrderStatus(orderId: string) {
  const dispatch = useAppDispatch();
  const pendingStatus = useAppSelector((state) => state.orderStatus.pendingByOrderId[orderId]);

  function changeStatus(status: OrderStatus) {
    dispatch(changeOrderStatusRequested({ orderId, status }));
  }

  return { pendingStatus, changeStatus, isPending: pendingStatus !== undefined };
}
