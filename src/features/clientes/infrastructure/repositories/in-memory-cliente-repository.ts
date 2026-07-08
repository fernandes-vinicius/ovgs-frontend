import { randomUUID } from "node:crypto";
import { db } from "@/mocks/in-memory-db";
import type { Cliente } from "../../domain/cliente";
import type { ClienteRepository } from "../../domain/cliente-repository";

export const inMemoryClienteRepository: ClienteRepository = {
  findAll() {
    return db.clientes;
  },
  findById(id) {
    return db.clientes.find((cliente) => cliente.id === id);
  },
  create(input) {
    const cliente: Cliente = { id: randomUUID(), ...input };
    db.clientes.push(cliente);
    return cliente;
  },
  update(id, input) {
    const cliente = db.clientes.find((c) => c.id === id);
    if (!cliente) return undefined;
    Object.assign(cliente, input);
    return cliente;
  },
};
