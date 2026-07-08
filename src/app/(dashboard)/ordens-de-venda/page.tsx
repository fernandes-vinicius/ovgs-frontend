import type { Metadata } from "next";
import { OrdensDeVendaPage } from "@/features/ordens-de-venda/presentation/components/ordens-de-venda-page";

export const metadata: Metadata = {
  title: "Ordens de Venda — OVGS",
};

export default function Page() {
  return <OrdensDeVendaPage />;
}
