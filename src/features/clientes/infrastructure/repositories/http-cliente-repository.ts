import type {
  CreateClienteInput,
  UpdateClienteInput,
} from "@/features/clientes/application/cliente-schemas";
import { httpClient } from "@/shared/lib/http-client";
import type { Cliente } from "../../domain/cliente";

export const httpClienteRepository = {
  findAll: () => httpClient.get<Cliente[]>("/api/clientes"),
  findById: (id: string) => httpClient.get<Cliente>(`/api/clientes/${id}`),
  create: (input: CreateClienteInput) => httpClient.post<Cliente>("/api/clientes", input),
  update: (id: string, input: UpdateClienteInput) =>
    httpClient.patch<Cliente>(`/api/clientes/${id}`, input),
};
