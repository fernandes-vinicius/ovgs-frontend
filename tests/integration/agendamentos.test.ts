import { beforeEach, describe, expect, it } from "vitest";
import { GET, PATCH, POST } from "@/app/api/agendamentos/[ordemId]/route";
import { POST as createOrder } from "@/app/api/ordens-de-venda/route";
import { db, resetDb } from "@/mocks/in-memory-db";

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

async function criarOrdem() {
  const response = await createOrder(createOrderRequest());
  return response.json();
}

function definirRequest(dataEntrega: string, janela = { inicio: "08:00", fim: "12:00" }) {
  return new Request("http://localhost/api/agendamentos/ordem-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataEntrega, janela }),
  });
}

function confirmarRequest() {
  return new Request("http://localhost/api/agendamentos/ordem-id", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "confirmar" }),
  });
}

function reagendarRequest(dataEntrega: string, janela = { inicio: "14:00", fim: "18:00" }) {
  return new Request("http://localhost/api/agendamentos/ordem-id", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reagendar", dataEntrega, janela }),
  });
}

function routeParams(ordemId: string) {
  return { params: Promise.resolve({ ordemId }) };
}

beforeEach(() => {
  resetDb();
});

describe("GET /api/agendamentos/[ordemId]", () => {
  it("retorna 404 quando a ordem ainda não tem agendamento", async () => {
    const ordem = await criarOrdem();
    const response = await GET(new Request("http://localhost"), routeParams(ordem.id));
    expect(response.status).toBe(404);
  });
});

describe("POST /api/agendamentos/[ordemId] — definir agendamento", () => {
  it("cria o agendamento com confirmado=false e registra evento de auditoria", async () => {
    const ordem = await criarOrdem();

    const response = await POST(definirRequest("2026-08-12"), routeParams(ordem.id));

    expect(response.status).toBe(201);
    const agendamento = await response.json();
    expect(agendamento.confirmado).toBe(false);
    expect(agendamento.dataEntrega).toBe("2026-08-12");
    expect(agendamento.historicoReagendamentos).toEqual([]);

    const auditEvent = db.auditLog.find(
      (event) => event.entidadeId === ordem.id && event.entidadeTipo === "Agendamento",
    );
    expect(auditEvent).toBeDefined();
    expect(auditEvent?.acao).toBe("ALTERACAO_AGENDAMENTO");
  });

  it("retorna 404 quando a ordem de venda não existe", async () => {
    const response = await POST(definirRequest("2026-08-12"), routeParams("ordem-inexistente"));
    expect(response.status).toBe(404);
  });

  it("redefinir (POST de novo) atualiza o registro existente em vez de duplicar", async () => {
    const ordem = await criarOrdem();
    await POST(definirRequest("2026-08-12"), routeParams(ordem.id));
    await POST(definirRequest("2026-08-20"), routeParams(ordem.id));

    const agendamentosDaOrdem = db.agendamentos.filter((a) => a.ordemId === ordem.id);
    expect(agendamentosDaOrdem).toHaveLength(1);
    expect(agendamentosDaOrdem[0].dataEntrega).toBe("2026-08-20");
  });
});

describe("PATCH /api/agendamentos/[ordemId] — confirmar", () => {
  it("confirma um agendamento existente e grava o estado anterior real na auditoria", async () => {
    const ordem = await criarOrdem();
    await POST(definirRequest("2026-08-12"), routeParams(ordem.id));

    const response = await PATCH(confirmarRequest(), routeParams(ordem.id));

    expect(response.status).toBe(200);
    const agendamento = await response.json();
    expect(agendamento.confirmado).toBe(true);

    const auditEvent = db.auditLog
      .filter((event) => event.entidadeId === ordem.id && event.entidadeTipo === "Agendamento")
      .at(-1);
    expect(auditEvent?.estadoAnterior).toEqual({ confirmado: false });
    expect(auditEvent?.estadoPosterior).toEqual({ confirmado: true });
  });

  it("retorna 404 ao confirmar uma ordem sem agendamento", async () => {
    const ordem = await criarOrdem();
    const response = await PATCH(confirmarRequest(), routeParams(ordem.id));
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/agendamentos/[ordemId] — reagendar", () => {
  it("atualiza data/janela, zera a confirmação e acumula o histórico de reagendamentos", async () => {
    const ordem = await criarOrdem();
    await POST(definirRequest("2026-08-12"), routeParams(ordem.id));
    await PATCH(confirmarRequest(), routeParams(ordem.id));

    const response = await PATCH(reagendarRequest("2026-08-20"), routeParams(ordem.id));

    expect(response.status).toBe(200);
    const agendamento = await response.json();
    expect(agendamento.dataEntrega).toBe("2026-08-20");
    expect(agendamento.janela).toEqual({ inicio: "14:00", fim: "18:00" });
    expect(agendamento.confirmado).toBe(false);
    expect(agendamento.historicoReagendamentos).toHaveLength(1);
    expect(agendamento.historicoReagendamentos[0].dataEntregaAnterior).toBe("2026-08-12");
  });

  it("acumula múltiplos reagendamentos em sequência no histórico", async () => {
    const ordem = await criarOrdem();
    await POST(definirRequest("2026-08-12"), routeParams(ordem.id));

    await PATCH(reagendarRequest("2026-08-20"), routeParams(ordem.id));
    const response = await PATCH(reagendarRequest("2026-08-25"), routeParams(ordem.id));

    const agendamento = await response.json();
    expect(agendamento.historicoReagendamentos).toHaveLength(2);
    expect(
      agendamento.historicoReagendamentos.map(
        (h: { dataEntregaAnterior: string }) => h.dataEntregaAnterior,
      ),
    ).toEqual(["2026-08-12", "2026-08-20"]);
    expect(agendamento.dataEntrega).toBe("2026-08-25");
  });

  it("retorna 404 ao reagendar uma ordem sem agendamento", async () => {
    const ordem = await criarOrdem();
    const response = await PATCH(reagendarRequest("2026-08-20"), routeParams(ordem.id));
    expect(response.status).toBe(404);
  });
});
