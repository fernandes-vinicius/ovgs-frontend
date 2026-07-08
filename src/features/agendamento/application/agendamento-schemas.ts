import { z } from "zod";

const janelaSchema = z.object({
  inicio: z.string().min(1, "Início da janela é obrigatório."),
  fim: z.string().min(1, "Fim da janela é obrigatório."),
});

export const definirAgendamentoSchema = z.object({
  dataEntrega: z.string().min(1, "Data de entrega é obrigatória."),
  janela: janelaSchema,
});

export const patchAgendamentoSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("confirmar") }),
  z.object({
    action: z.literal("reagendar"),
    dataEntrega: z.string().min(1, "Data de entrega é obrigatória."),
    janela: janelaSchema,
  }),
]);

export type DefinirAgendamentoInput = z.infer<typeof definirAgendamentoSchema>;
export type PatchAgendamentoInput = z.infer<typeof patchAgendamentoSchema>;
