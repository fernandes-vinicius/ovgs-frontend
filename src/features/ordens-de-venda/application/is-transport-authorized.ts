import type { Cliente } from "@/features/clientes/domain/cliente";

export function isTransportAuthorized(cliente: Cliente, tipoTransporteId: string): boolean {
  return cliente.tiposTransporteAutorizados.includes(tipoTransporteId);
}
