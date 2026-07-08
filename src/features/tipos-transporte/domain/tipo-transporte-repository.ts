import type { TipoTransporte } from "./tipo-transporte";

export interface TipoTransporteRepository {
  findAll(): TipoTransporte[];
  findById(id: string): TipoTransporte | undefined;
  create(input: Omit<TipoTransporte, "id">): TipoTransporte;
  update(id: string, input: Partial<Omit<TipoTransporte, "id">>): TipoTransporte | undefined;
}
