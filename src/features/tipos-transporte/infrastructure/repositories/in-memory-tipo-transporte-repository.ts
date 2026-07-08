import { randomUUID } from "node:crypto";
import { db } from "@/mocks/in-memory-db";
import type { TipoTransporte } from "../../domain/tipo-transporte";
import type { TipoTransporteRepository } from "../../domain/tipo-transporte-repository";

export const inMemoryTipoTransporteRepository: TipoTransporteRepository = {
  findAll() {
    return db.tiposTransporte;
  },
  findById(id) {
    return db.tiposTransporte.find((tipo) => tipo.id === id);
  },
  create(input) {
    const tipoTransporte: TipoTransporte = { id: randomUUID(), ...input };
    db.tiposTransporte.push(tipoTransporte);
    return tipoTransporte;
  },
  update(id, input) {
    const tipoTransporte = db.tiposTransporte.find((t) => t.id === id);
    if (!tipoTransporte) return undefined;
    Object.assign(tipoTransporte, input);
    return tipoTransporte;
  },
};
