import { call, put, takeEvery } from "redux-saga/effects";
import { toast } from "sonner";
import { auditKeys } from "@/features/auditoria/presentation/hooks/audit-keys";
import { salesOrderKeys } from "@/features/ordens-de-venda/presentation/hooks/sales-order-keys";
import { changeOrderStatusRequested } from "@/features/ordens-de-venda/presentation/store/order-status-slice";
import { HttpError } from "@/shared/lib/http-client";
import { getQueryClient } from "@/shared/lib/query-client";
import { httpAgendamentoRepository } from "../../infrastructure/repositories/http-agendamento-repository";
import { agendamentoKeys } from "../hooks/agendamento-keys";
import { confirmarAgendamentoRequested } from "./agendamento-actions";

type ConfirmarAgendamentoAction = ReturnType<typeof confirmarAgendamentoRequested>;

function* handleConfirmarAgendamento(action: ConfirmarAgendamentoAction) {
  const { ordemId, statusAtualDaOrdem } = action.payload;

  try {
    yield call(httpAgendamentoRepository.confirmar, ordemId);

    const queryClient = getQueryClient();
    yield call([queryClient, queryClient.invalidateQueries], {
      queryKey: agendamentoKeys.detail(ordemId),
    });
    yield call([queryClient, queryClient.invalidateQueries], { queryKey: auditKeys.all });

    toast.success("Agendamento confirmado.");

    // Encadeamento com a saga de status (seção 7): só faz sentido tentar
    // avançar CRIADA/PLANEJADA -> AGENDADA na primeira confirmação. Um
    // reagendamento de uma OV já AGENDADA/EM_TRANSPORTE não deve repetir essa
    // transição (o próprio state-machine já rejeitaria, mas evitamos até a
    // chamada e o toast de erro confuso que isso geraria).
    if (statusAtualDaOrdem === "PLANEJADA") {
      yield put(changeOrderStatusRequested({ orderId: ordemId, status: "AGENDADA" }));
    } else {
      yield call([queryClient, queryClient.invalidateQueries], {
        queryKey: salesOrderKeys.detail(ordemId),
      });
    }
  } catch (error) {
    toast.error(
      error instanceof HttpError ? error.message : "Não foi possível confirmar o agendamento.",
    );
  }
}

export function* confirmarAgendamentoSaga() {
  yield takeEvery(confirmarAgendamentoRequested.type, handleConfirmarAgendamento);
}
