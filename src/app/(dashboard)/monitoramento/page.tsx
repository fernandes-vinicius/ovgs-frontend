import type { Metadata } from "next";
import { Suspense } from "react";
import { MonitoramentoPage } from "@/features/ordens-de-venda/presentation/components/monitoramento-page";

export const metadata: Metadata = {
  title: "Monitoramento — OVGS",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <MonitoramentoPage />
    </Suspense>
  );
}
