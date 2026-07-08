import type { Cliente } from "@/features/clientes/domain/cliente";
import type { Item } from "@/features/itens/domain/item";
import type { TipoTransporte } from "@/features/tipos-transporte/domain/tipo-transporte";

export const tiposTransporteSeed: TipoTransporte[] = [
  { id: "tt-caminhao", nome: "Caminhão", ativo: true },
  { id: "tt-carreta", nome: "Carreta", ativo: true },
  { id: "tt-bitruck", nome: "Bi-truck", ativo: true },
];

export const clientesSeed: Cliente[] = [
  {
    id: "cli-1",
    nome: "Distribuidora Aurora Ltda",
    documento: "12.345.678/0001-90",
    tiposTransporteAutorizados: ["tt-caminhao", "tt-carreta"],
  },
  {
    id: "cli-2",
    nome: "Comércio Vale Verde S.A.",
    documento: "98.765.432/0001-10",
    tiposTransporteAutorizados: ["tt-bitruck"],
  },
  {
    id: "cli-3",
    nome: "Mercado Central Ltda",
    documento: "11.222.333/0001-44",
    tiposTransporteAutorizados: ["tt-caminhao", "tt-carreta", "tt-bitruck"],
  },
];

export const itensSeed: Item[] = [
  { id: "item-1", sku: "SKU-0001", nome: "Cimento CP-II 50kg", unidade: "saco" },
  { id: "item-2", sku: "SKU-0002", nome: "Vergalhão CA-50 10mm", unidade: "barra" },
  { id: "item-3", sku: "SKU-0003", nome: "Tijolo cerâmico 9 furos", unidade: "milheiro" },
  { id: "item-4", sku: "SKU-0004", nome: "Areia média lavada", unidade: "m³" },
  { id: "item-5", sku: "SKU-0005", nome: "Telha fibrocimento 6mm", unidade: "unidade" },
];
