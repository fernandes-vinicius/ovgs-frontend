import type { UnknownAction } from "@reduxjs/toolkit";

// Placeholder until the first feature slice is registered (see the plan's
// sections on the Central de Agendamento wizard and Monitoramento filters).
// combineReducers({}) throws "Store does not have a valid reducer" when the
// map is empty, so we provide a trivial no-op reducer instead.
export type RootState = Record<string, never>;

export function rootReducer(state: RootState = {}, _action: UnknownAction): RootState {
  return state;
}
