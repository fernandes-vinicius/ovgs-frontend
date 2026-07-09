import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SalesOrderForm } from "@/features/ordens-de-venda/presentation/components/sales-order-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  // As listas de clientes/tipos de transporte/itens vêm de fetch — mockamos
  // pra manter o teste de componente determinístico e sem depender de rede.
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SalesOrderForm", () => {
  it("mostra erros de validação ao submeter sem selecionar cliente, transporte ou item", async () => {
    renderWithProviders(<SalesOrderForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /criar ordem de venda/i }));

    expect(await screen.findByText("Cliente é obrigatório.")).toBeInTheDocument();
    expect(await screen.findByText("Tipo de transporte é obrigatório.")).toBeInTheDocument();
    expect(await screen.findByText("Item é obrigatório.")).toBeInTheDocument();
  });
});
