import { beforeEach, describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/ordens-de-venda/[id]/status/route";
import { POST as createOrder } from "@/app/api/ordens-de-venda/route";
import { resetDb } from "@/mocks/in-memory-db";

function createOrderRequest() {
  return new Request("http://localhost/api/ordens-de-venda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clienteId: "cli-1",
      tipoTransporteId: "tt-caminhao",
      itens: [{ itemId: "item-1", quantidade: 1 }],
    }),
  });
}

function statusRequest(orderId: string, status: string) {
  return new Request(`http://localhost/api/ordens-de-venda/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

beforeEach(() => {
  resetDb();
});

describe("PATCH /api/ordens-de-venda/[id]/status", () => {
  it("rejeita com 422 uma transição fora de sequência (CRIADA → AGENDADA)", async () => {
    const createResponse = await createOrder(createOrderRequest());
    const order = await createResponse.json();

    const response = await PATCH(statusRequest(order.id, "AGENDADA"), {
      params: Promise.resolve({ id: order.id }),
    });

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toMatch(/não é permitida/i);
  });

  it("aceita a transição válida CRIADA → PLANEJADA", async () => {
    const createResponse = await createOrder(createOrderRequest());
    const order = await createResponse.json();

    const response = await PATCH(statusRequest(order.id, "PLANEJADA"), {
      params: Promise.resolve({ id: order.id }),
    });

    expect(response.status).toBe(200);
    const updated = await response.json();
    expect(updated.status).toBe("PLANEJADA");
  });

  it("retorna 404 quando a ordem de venda não existe", async () => {
    const response = await PATCH(statusRequest("ordem-inexistente", "PLANEJADA"), {
      params: Promise.resolve({ id: "ordem-inexistente" }),
    });

    expect(response.status).toBe(404);
  });
});
