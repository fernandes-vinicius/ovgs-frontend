export const agendamentoKeys = {
  all: ["agendamentos"] as const,
  detail: (ordemId: string) => [...agendamentoKeys.all, "detail", ordemId] as const,
};
