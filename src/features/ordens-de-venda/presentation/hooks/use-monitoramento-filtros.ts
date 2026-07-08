"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { ORDER_STATUSES } from "../../domain/order-status";
import type { SalesOrderFilter } from "../../domain/sales-order-repository";
import { filtroAlterado, filtrosHidratados } from "../store/monitoramento-slice";

function isOrderStatus(value: string): value is SalesOrderFilter["status"] & string {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

function filterFromSearchParams(params: URLSearchParams): SalesOrderFilter {
  const status = params.get("status");
  return {
    status: status && isOrderStatus(status) ? status : undefined,
    clienteId: params.get("clienteId") ?? undefined,
    tipoTransporteId: params.get("tipoTransporteId") ?? undefined,
    data: params.get("data") ?? undefined,
  };
}

function searchParamsFromFilter(filter: SalesOrderFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.clienteId) params.set("clienteId", filter.clienteId);
  if (filter.tipoTransporteId) params.set("tipoTransporteId", filter.tipoTransporteId);
  if (filter.data) params.set("data", filter.data);
  return params.toString();
}

export function useMonitoramentoFiltros() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const draft = useAppSelector((state) => state.monitoramento.draft);
  const aplicado = useAppSelector((state) => state.monitoramento.aplicado);
  const hydrated = useRef(false);

  // Hidrata o filtro a partir da querystring uma única vez, no mount — sem
  // passar pela saga, para não mostrar dados não filtrados por um instante
  // ao abrir um link com filtros. Deps vazio é intencional: incluir
  // `searchParams` recriaria um loop, já que o efeito abaixo escreve na URL.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ver comentário acima
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    dispatch(filtrosHidratados(filterFromSearchParams(searchParams)));
  }, []);

  // Sincroniza a URL sempre que o filtro debounced (aplicado) mudar.
  useEffect(() => {
    if (!hydrated.current) return;
    const query = searchParamsFromFilter(aplicado);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [aplicado, pathname, router]);

  function setFiltro(next: SalesOrderFilter) {
    dispatch(filtroAlterado(next));
  }

  return { draft, aplicado, setFiltro };
}
