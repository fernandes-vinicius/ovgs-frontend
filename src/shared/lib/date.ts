import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// `parseISO` (não o construtor nativo `Date`) trata strings de data pura
// ("2026-08-01", sem horário) como meia-noite no fuso LOCAL — o construtor
// nativo trata como meia-noite UTC, o que em fusos atrás de UTC (ex.: -03:00)
// exibe o dia anterior. Strings ISO completas com timezone continuam corretas
// nos dois casos.
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}
