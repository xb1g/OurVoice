import { Hono } from "hono";
import type { Env } from "../types/env";

export const healthRoutes = new Hono<Env>();

healthRoutes.get("/health", (c) => c.json({ ok: true, service: "api" }));
healthRoutes.get("/", (c) =>
  c.json({ ok: true, service: "api", hint: "try /health" })
);
