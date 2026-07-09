import { beforeEach, describe, expect, it } from "vitest";
import { inMemoryClienteRepository } from "@/features/clientes/infrastructure/repositories/in-memory-cliente-repository";
import { inMemoryItemRepository } from "@/features/itens/infrastructure/repositories/in-memory-item-repository";
import { createSalesOrder } from "@/features/ordens-de-venda/application/create-sales-order";
import { inMemorySalesOrderRepository } from "@/features/ordens-de-venda/infrastructure/repositories/in-memory-sales-order-repository";
import { inMemoryTipoTransporteRepository } from "@/features/tipos-transporte/infrastructure/repositories/in-memory-tipo-transporte-repository";
import { resetDb } from "@/mocks/in-memory-db";

const deps = {
  salesOrderRepository: inMemorySalesOrderRepository,
  clienteRepository: inMemoryClienteRepository,
  tipoTransporteRepository: inMemoryTipoTransporteRepository,
  itemRepository: inMemoryItemRepository,
};

beforeEach(() => {
  resetDb();
});

describe("createSalesOrder", () => {
  it("cria a OV quando cliente, transporte autorizado e itens são válidos", () => {
    const result = createSalesOrder(
      {
        clienteId: "cli-1",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-1", quantidade: 2 }],
      },
      deps,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("CRIADA");
    expect(result.data.clienteId).toBe("cli-1");
    expect(result.data.itens).toEqual([{ itemId: "item-1", quantidade: 2 }]);
  });

  it("rejeita quando o cliente não existe", () => {
    const result = createSalesOrder(
      {
        clienteId: "cli-inexistente",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-1", quantidade: 1 }],
      },
      deps,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("NOT_FOUND");
  });

  it("rejeita quando o tipo de transporte não é autorizado para o cliente", () => {
    // cli-2 (Comércio Vale Verde) só autoriza tt-bitruck.
    const result = createSalesOrder(
      {
        clienteId: "cli-2",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-1", quantidade: 1 }],
      },
      deps,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("VALIDATION");
  });

  it("rejeita quando um item referenciado não existe", () => {
    const result = createSalesOrder(
      {
        clienteId: "cli-1",
        tipoTransporteId: "tt-caminhao",
        itens: [{ itemId: "item-inexistente", quantidade: 1 }],
      },
      deps,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("VALIDATION");
  });

  it("rejeita quando não há nenhum item (defesa em profundidade, além do zod)", () => {
    const result = createSalesOrder(
      { clienteId: "cli-1", tipoTransporteId: "tt-caminhao", itens: [] },
      deps,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("VALIDATION");
  });
});
