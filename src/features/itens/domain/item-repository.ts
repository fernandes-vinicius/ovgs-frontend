import type { Item } from "./item";

export interface ItemRepository {
  findAll(): Item[];
  findById(id: string): Item | undefined;
  findBySku(sku: string): Item | undefined;
  create(input: Omit<Item, "id">): Item;
}
