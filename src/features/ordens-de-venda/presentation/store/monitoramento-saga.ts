import { delay, put, takeLatest } from "redux-saga/effects";
import { filtroAlterado, filtrosAplicados } from "./monitoramento-slice";

type FiltroAlteradoAction = ReturnType<typeof filtroAlterado>;

const DEBOUNCE_MS = 300;

function* handleFiltroAlterado(action: FiltroAlteradoAction) {
  // `takeLatest` cancela esta task automaticamente se outro `filtroAlterado`
  // chegar antes do delay terminar — é o próprio debounce, sem estado extra.
  yield delay(DEBOUNCE_MS);
  yield put(filtrosAplicados(action.payload));
}

export function* monitoramentoSaga() {
  yield takeLatest(filtroAlterado.type, handleFiltroAlterado);
}
