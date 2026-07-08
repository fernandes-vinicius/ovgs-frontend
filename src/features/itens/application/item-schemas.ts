import { z } from "zod";

export const createItemSchema = z.object({
  sku: z.string().trim().min(1, "SKU é obrigatório."),
  nome: z.string().trim().min(1, "Nome é obrigatório."),
  unidade: z.string().trim().min(1, "Unidade é obrigatória."),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
