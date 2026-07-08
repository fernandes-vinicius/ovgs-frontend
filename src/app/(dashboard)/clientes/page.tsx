import type { Metadata } from "next";
import { ClientesPage } from "@/features/clientes/presentation/components/clientes-page";

export const metadata: Metadata = {
  title: "Clientes — OVGS",
};

export default function Page() {
  return <ClientesPage />;
}
