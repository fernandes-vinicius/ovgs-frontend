import { randomUUID } from "node:crypto";
import { db } from "@/mocks/in-memory-db";
import type { Item } from "../../domain/item";
import type { ItemRepository } from "../../domain/item-repository";

export const inMemoryItemRepository: ItemRepository = {
  findAll() {
    return db.itens;
  },
  findById(id) {
    return db.itens.find((item) => item.id === id);
  },
  findBySku(sku) {
    return db.itens.find((item) => item.sku === sku);
  },
  create(input) {
    const item: Item = { id: randomUUID(), ...input };
    db.itens.push(item);
    return item;
  },
};
