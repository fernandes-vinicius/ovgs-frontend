import type { Agendamento } from "@/features/agendamento/domain/agendamento";
import type { AuditEvent } from "@/features/auditoria/domain/audit-event";
import type { Cliente } from "@/features/clientes/domain/cliente";
import type { Item } from "@/features/itens/domain/item";
import type { SalesOrder } from "@/features/ordens-de-venda/domain/sales-order";
import type { TipoTransporte } from "@/features/tipos-transporte/domain/tipo-transporte";
import { clientesSeed, itensSeed, tiposTransporteSeed } from "./seed-data";

interface InMemoryDb {
  clientes: Cliente[];
  tiposTransporte: TipoTransporte[];
  itens: Item[];
  ordensDeVenda: SalesOrder[];
  agendamentos: Agendamento[];
  auditLog: AuditEvent[];
}

function createDb(): InMemoryDb {
  return {
    clientes: structuredClone(clientesSeed),
    tiposTransporte: structuredClone(tiposTransporteSeed),
    itens: structuredClone(itensSeed),
    ordensDeVenda: [],
    agendamentos: [],
    auditLog: [],
  };
}

// Route handlers re-import this module on every request; a plain module-level
// singleton would still get reset by Next.js dev's Fast Refresh re-evaluating
// the module. Stashing it on `globalThis` keeps mock data stable across HMR.
declare global {
  var __ovgsDb: InMemoryDb | undefined;
}

if (!globalThis.__ovgsDb) {
  globalThis.__ovgsDb = createDb();
}

export const db: InMemoryDb = globalThis.__ovgsDb;

export function resetDb() {
  Object.assign(db, createDb());
}
