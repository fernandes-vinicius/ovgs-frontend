import type { Metadata } from "next";
import { CentralAgendamentoPage } from "@/features/agendamento/presentation/components/central-agendamento-page";

export const metadata: Metadata = {
  title: "Central de Agendamento — OVGS",
};

export default function Page() {
  return <CentralAgendamentoPage />;
}
