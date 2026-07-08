import type { Metadata } from "next";
import { ItensPage } from "@/features/itens/presentation/components/itens-page";

export const metadata: Metadata = {
  title: "Itens — OVGS",
};

export default function Page() {
  return <ItensPage />;
}
