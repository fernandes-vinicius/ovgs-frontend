import { NextResponse } from "next/server";
import type { AppError } from "@/shared/types/result";

const STATUS_BY_CODE: Record<AppError["code"], number> = {
  NOT_FOUND: 404,
  VALIDATION: 422,
};

export function errorResponse(error: AppError) {
  return NextResponse.json({ error: error.message }, { status: STATUS_BY_CODE[error.code] });
}
