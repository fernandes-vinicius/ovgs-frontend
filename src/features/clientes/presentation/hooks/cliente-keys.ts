export const clienteKeys = {
  all: ["clientes"] as const,
  lists: () => [...clienteKeys.all, "list"] as const,
  detail: (id: string) => [...clienteKeys.all, "detail", id] as const,
};
