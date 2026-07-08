export const itemKeys = {
  all: ["itens"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
};
