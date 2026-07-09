import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/ordens-de-venda/route";
import { db, resetDb } from "@/mocks/in-memory-db";

function createRequest(body: unknown) {
  return new Request("http://localhost/api/ordens-de-venda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetDb();
});

describe("POST /api/ordens-de-venda", () => {
  it("caminho feliz: cria a OV com 201 e registra o evento de auditoria de criação", async () => {
    const response = await POST(
      createRequest({
        clienteId: "cli-1",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-1", quantidade: 2 }],
      }),
    );

    expect(response.status).toBe(201);
    const order = await response.json();
    expect(order.status).toBe("CRIADA");

    const auditEvent = db.auditLog.find(
      (event) => event.entidadeId === order.id && event.acao === "CRIACAO_ORDEM_VENDA",
    );
    expect(auditEvent).toBeDefined();
    expect(auditEvent?.entidadeTipo).toBe("OrdemDeVenda");
  });

  it("caminho de rejeição: 422 quando o transporte não é autorizado para o cliente", async () => {
    // cli-2 (Comércio Vale Verde) só autoriza tt-bitruck.
    const response = await POST(
      createRequest({
        clienteId: "cli-2",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-1", quantidade: 1 }],
      }),
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toMatch(/não autorizado/i);
    expect(db.ordensDeVenda).toHaveLength(0);
  });
});
