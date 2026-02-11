import { createMiddleware } from "hono/factory";

const parseAllowedOrigins = (raw?: string) =>
  (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const corsAllowlist = createMiddleware(async (c, next) => {
  const origin = c.req.header("origin") ?? "";
  const allowedOrigins = parseAllowedOrigins(c.env.ALLOWED_ORIGINS);
  const allowAny = allowedOrigins.length === 0;
  const isAllowed = allowAny || allowedOrigins.includes(origin);

  if (origin && isAllowed) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
  }

  c.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id");
  c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  c.header("Access-Control-Max-Age", "3600");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
});
