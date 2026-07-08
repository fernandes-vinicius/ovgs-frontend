import { z } from "zod";

export const createClienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório."),
  documento: z.string().trim().min(1, "Documento é obrigatório."),
  tiposTransporteAutorizados: z.array(z.string()),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
