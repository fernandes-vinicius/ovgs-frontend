import { describe, expect, it } from "vitest";
import type { Cliente } from "@/features/clientes/domain/cliente";
import { isTransportAuthorized } from "@/features/ordens-de-venda/application/is-transport-authorized";

const cliente: Cliente = {
  id: "cli-1",
  nome: "Cliente Teste",
  documento: "00.000.000/0001-00",
  tiposTransporteAutorizados: ["tt-caminhao", "tt-carreta"],
};

describe("isTransportAuthorized", () => {
  it("retorna true quando o tipo de transporte está na lista autorizada do cliente", () => {
    expect(isTransportAuthorized(cliente, "tt-caminhao")).toBe(true);
  });

  it("retorna false quando o tipo de transporte não está autorizado para o cliente", () => {
    expect(isTransportAuthorized(cliente, "tt-bitruck")).toBe(false);
  });

  it("retorna false quando o cliente não possui nenhum transporte autorizado", () => {
    const clienteSemAutorizacao: Cliente = { ...cliente, tiposTransporteAutorizados: [] };
    expect(isTransportAuthorized(clienteSemAutorizacao, "tt-caminhao")).toBe(false);
  });
});
