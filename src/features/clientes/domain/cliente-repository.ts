import type { Cliente } from "./cliente";

export interface ClienteRepository {
  findAll(): Cliente[];
  findById(id: string): Cliente | undefined;
  create(input: Omit<Cliente, "id">): Cliente;
  update(id: string, input: Partial<Omit<Cliente, "id">>): Cliente | undefined;
}
