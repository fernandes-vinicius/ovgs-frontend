import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SalesOrderFilter } from "../../domain/sales-order-repository";

interface MonitoramentoState {
  // Reflete a interação do usuário nos controles de filtro imediatamente.
  draft: SalesOrderFilter;
  // Valor "assentado" após o debounce da saga — é isso que efetivamente
  // vira query key do React Query e é sincronizado com a URL.
  aplicado: SalesOrderFilter;
}

const initialState: MonitoramentoState = {
  draft: {},
  aplicado: {},
};

const monitoramentoSlice = createSlice({
  name: "monitoramento",
  initialState,
  reducers: {
    filtroAlterado: (state, action: PayloadAction<SalesOrderFilter>) => {
      state.draft = action.payload;
    },
    filtrosAplicados: (state, action: PayloadAction<SalesOrderFilter>) => {
      state.aplicado = action.payload;
    },
    // Usado só na hidratação inicial a partir da querystring — não passa
    // pelo debounce da saga, senão a tabela mostraria dados não filtrados
    // por um instante a cada reload de um link com filtros.
    filtrosHidratados: (state, action: PayloadAction<SalesOrderFilter>) => {
      state.draft = action.payload;
      state.aplicado = action.payload;
    },
  },
});

export const { filtroAlterado, filtrosAplicados, filtrosHidratados } = monitoramentoSlice.actions;
export const monitoramentoReducer = monitoramentoSlice.reducer;
