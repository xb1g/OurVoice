import { Hono } from "hono";
import { requireAuth, requireRole } from "../middleware/auth";
import { createSupabaseClientForUser } from "../lib/supabase";
import type { Env } from "../types/env";

export const authRoutes = new Hono<Env>();

authRoutes.get("/auth/profile", requireAuth, async (c) => {
  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return c.json({ error: "Invalid token" }, 401);
  }

  return c.json({
    user: data.user,
    claims: c.get("auth"),
  });
});

authRoutes.get("/backoffice/health", requireAuth, requireRole(["superadmin"]), (c) => {
  return c.json({ ok: true, role: "superadmin" });
});
