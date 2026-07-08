export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Erro de use-case tipado por código em vez de string livre — os route
// handlers mapeiam `code` para o status HTTP (404/422) sem precisar
// inspecionar o texto da mensagem, que é só para exibição.
export type AppErrorCode = "NOT_FOUND" | "VALIDATION";

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export function notFound(message: string): AppError {
  return { code: "NOT_FOUND", message };
}

export function validationError(message: string): AppError {
  return { code: "VALIDATION", message };
}
