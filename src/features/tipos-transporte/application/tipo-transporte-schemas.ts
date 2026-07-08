import { z } from "zod";

export const createTipoTransporteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório."),
  ativo: z.boolean(),
});

export const updateTipoTransporteSchema = createTipoTransporteSchema.partial();

export type CreateTipoTransporteInput = z.infer<typeof createTipoTransporteSchema>;
export type UpdateTipoTransporteInput = z.infer<typeof updateTipoTransporteSchema>;
