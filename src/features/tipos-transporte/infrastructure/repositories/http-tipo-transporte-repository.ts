import type {
  CreateTipoTransporteInput,
  UpdateTipoTransporteInput,
} from "@/features/tipos-transporte/application/tipo-transporte-schemas";
import { httpClient } from "@/shared/lib/http-client";
import type { TipoTransporte } from "../../domain/tipo-transporte";

export const httpTipoTransporteRepository = {
  findAll: () => httpClient.get<TipoTransporte[]>("/api/tipos-transporte"),
  findById: (id: string) => httpClient.get<TipoTransporte>(`/api/tipos-transporte/${id}`),
  create: (input: CreateTipoTransporteInput) =>
    httpClient.post<TipoTransporte>("/api/tipos-transporte", input),
  update: (id: string, input: UpdateTipoTransporteInput) =>
    httpClient.patch<TipoTransporte>(`/api/tipos-transporte/${id}`, input),
};
