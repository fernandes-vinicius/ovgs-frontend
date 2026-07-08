import { call, put, takeEvery } from "redux-saga/effects";
import { toast } from "sonner";
import { auditKeys } from "@/features/auditoria/presentation/hooks/audit-keys";
import { HttpError } from "@/shared/lib/http-client";
import { getQueryClient } from "@/shared/lib/query-client";
import { httpSalesOrderRepository } from "../../infrastructure/repositories/http-sales-order-repository";
import { salesOrderKeys } from "../hooks/sales-order-keys";
import { ORDER_STATUS_LABELS } from "../order-status-labels";
import {
  changeOrderStatusRequested,
  orderStatusOptimisticallySet,
  orderStatusSettled,
} from "./order-status-slice";

type ChangeOrderStatusAction = ReturnType<typeof changeOrderStatusRequested>;

function* handleChangeOrderStatus(action: ChangeOrderStatusAction) {
  const { orderId, status } = action.payload;

  // Reflect the new status immediately (optimistic UI); the saga rolls this
  // back by clearing the override in the `finally` block if the mocked API
  // rejects the transition, without ever touching the React Query cache.
  yield put(orderStatusOptimisticallySet({ orderId, status }));

  try {
    yield call(httpSalesOrderRepository.changeStatus, orderId, status);

    const queryClient = getQueryClient();
    yield call([queryClient, queryClient.invalidateQueries], {
      queryKey: salesOrderKeys.detail(orderId),
    });
    yield call([queryClient, queryClient.invalidateQueries], { queryKey: salesOrderKeys.lists() });
    yield call([queryClient, queryClient.invalidateQueries], { queryKey: auditKeys.all });

    toast.success(`Status atualizado para "${ORDER_STATUS_LABELS[status]}".`);
  } catch (error) {
    toast.error(
      error instanceof HttpError ? error.message : "Não foi possível atualizar o status.",
    );
  } finally {
    yield put(orderStatusSettled({ orderId }));
  }
}

export function* orderStatusSaga() {
  yield takeEvery(changeOrderStatusRequested.type, handleChangeOrderStatus);
}
