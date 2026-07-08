import type { CreateItemInput } from "@/features/itens/application/item-schemas";
import { httpClient } from "@/shared/lib/http-client";
import type { Item } from "../../domain/item";

export const httpItemRepository = {
  findAll: () => httpClient.get<Item[]>("/api/itens"),
  create: (input: CreateItemInput) => httpClient.post<Item>("/api/itens", input),
};
