import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

const jsonError = (
  c: Context,
  status: number,
  code: string,
  message: string,
  details?: unknown
) => {
  const requestId = c.get("requestId") ?? "unknown";
  return c.json(
    {
      error: {
        code,
        message,
        requestId,
        details,
      },
    },
    status as any
  );
};

export const onError = (error: unknown, c: Context) => {
  if (error instanceof HTTPException) {
    return jsonError(c, error.status, "http_exception", error.message);
  }

  const message = error instanceof Error ? error.message : "Unhandled error";
  console.error("Unhandled API error", {
    requestId: c.get("requestId"),
    message,
  });

  return jsonError(c, 500, "internal_error", "Internal server error");
};

export const notFound = (c: Context) => {
  return jsonError(c, 404, "not_found", "Route not found");
};
