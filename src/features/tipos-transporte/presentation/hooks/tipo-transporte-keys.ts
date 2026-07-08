export const tipoTransporteKeys = {
  all: ["tipos-transporte"] as const,
  lists: () => [...tipoTransporteKeys.all, "list"] as const,
  detail: (id: string) => [...tipoTransporteKeys.all, "detail", id] as const,
};
