import type { Metadata } from "next";
import { TiposTransportePage } from "@/features/tipos-transporte/presentation/components/tipos-transporte-page";

export const metadata: Metadata = {
  title: "Tipos de Transporte — OVGS",
};

export default function Page() {
  return <TiposTransportePage />;
}
