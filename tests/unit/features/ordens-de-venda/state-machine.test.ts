import { describe, expect, it } from "vitest";
import { ORDER_STATUSES, type OrderStatus } from "@/features/ordens-de-venda/domain/order-status";
import {
  isValidTransition,
  nextValidStatuses,
} from "@/features/ordens-de-venda/domain/state-machine";

const VALID_SEQUENCE: OrderStatus[] = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
];

describe("state-machine", () => {
  it("permite cada passo da sequência esperada CRIADA→PLANEJADA→AGENDADA→EM_TRANSPORTE→ENTREGUE", () => {
    for (let i = 0; i < VALID_SEQUENCE.length - 1; i++) {
      expect(isValidTransition(VALID_SEQUENCE[i], VALID_SEQUENCE[i + 1])).toBe(true);
    }
  });

  it("rejeita transições fora de sequência (pular etapas ou andar para trás)", () => {
    expect(isValidTransition("CRIADA", "AGENDADA")).toBe(false);
    expect(isValidTransition("CRIADA", "EM_TRANSPORTE")).toBe(false);
    expect(isValidTransition("CRIADA", "ENTREGUE")).toBe(false);
    expect(isValidTransition("PLANEJADA", "CRIADA")).toBe(false);
    expect(isValidTransition("ENTREGUE", "CRIADA")).toBe(false);
  });

  it("rejeita transição para o mesmo status", () => {
    for (const status of ORDER_STATUSES) {
      expect(isValidTransition(status, status)).toBe(false);
    }
  });

  it("ENTREGUE é estado terminal (nenhuma transição válida a partir dele)", () => {
    expect(nextValidStatuses("ENTREGUE")).toEqual([]);
  });

  it("nextValidStatuses retorna exatamente o próximo passo da sequência para estados não terminais", () => {
    expect(nextValidStatuses("CRIADA")).toEqual(["PLANEJADA"]);
    expect(nextValidStatuses("PLANEJADA")).toEqual(["AGENDADA"]);
    expect(nextValidStatuses("AGENDADA")).toEqual(["EM_TRANSPORTE"]);
    expect(nextValidStatuses("EM_TRANSPORTE")).toEqual(["ENTREGUE"]);
  });
});
