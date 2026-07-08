import { NextResponse } from "next/server";
import type { z } from "zod";

type ParsedBody<T> =
  | { data: T; response?: undefined }
  | { data?: undefined; response: NextResponse };

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParsedBody<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      response: NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      response: NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      ),
    };
  }

  return { data: parsed.data };
}
