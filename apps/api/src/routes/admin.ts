import { Hono } from "hono";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { createSupabaseClientForUser } from "../lib/supabase";
import type { Env } from "../types/env";

export const adminRoutes = new Hono<Env>();

const customerCreateSchema = z.object({
  name: z.string().min(1),
  status: z.string().optional(),
  plan: z.string().optional(),
});

const customerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
});

const userCreateSchema = z.object({
  authUserId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(["user", "customer_admin", "superadmin"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  customerId: z.string().uuid().nullable().optional(),
});

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["user", "customer_admin", "superadmin"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  customerId: z.string().uuid().nullable().optional(),
});

const getAuth = (c: any) =>
  c.get("auth") as { role?: string; customer_id?: string; sub?: string };

adminRoutes.get("/customers", requireAuth, requireRole(["superadmin"]), async (c) => {
  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  const { data, error } = await supabase.from("customers").select("*");
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data });
});

adminRoutes.post("/customers", requireAuth, requireRole(["superadmin"]), async (c) => {
  const body = customerCreateSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    return c.json({ error: "Invalid payload", details: body.error.flatten() }, 400);
  }

  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: body.data.name,
      status: body.data.status ?? "active",
      plan: body.data.plan ?? "free",
    })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data }, 201);
});

adminRoutes.patch(
  "/customers/:id",
  requireAuth,
  requireRole(["superadmin"]),
  async (c) => {
    const body = customerUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!body.success) {
      return c.json({ error: "Invalid payload", details: body.error.flatten() }, 400);
    }

    const id = c.req.param("id");
    const accessToken = c.get("accessToken");
    const supabase = createSupabaseClientForUser(c.env, accessToken);
    const { data, error } = await supabase
      .from("customers")
      .update(body.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ data });
  }
);

adminRoutes.get("/users", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  let query = supabase.from("users").select("*");

  if (auth.role === "customer_admin") {
    if (!auth.customer_id) return c.json({ error: "Missing tenant" }, 400);
    query = query.eq("customer_id", auth.customer_id);
  } else if (auth.role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  } else {
    const customerId = c.req.query("customer_id");
    if (customerId) query = query.eq("customer_id", customerId);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data });
});

adminRoutes.post("/users", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const body = userCreateSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    return c.json({ error: "Invalid payload", details: body.error.flatten() }, 400);
  }

  if (auth.role === "customer_admin") {
    if (!auth.customer_id) return c.json({ error: "Missing tenant" }, 400);
    if (body.data.role === "superadmin") {
      return c.json({ error: "Cannot assign superadmin role" }, 403);
    }
  } else if (auth.role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const customerId =
    auth.role === "customer_admin" ? auth.customer_id : body.data.customerId ?? null;

  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_user_id: body.data.authUserId,
      email: body.data.email,
      name: body.data.name ?? null,
      role: body.data.role ?? "user",
      status: body.data.status ?? "active",
      customer_id: customerId,
    })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data }, 201);
});

adminRoutes.patch("/users/:id", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const body = userUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    return c.json({ error: "Invalid payload", details: body.error.flatten() }, 400);
  }

  const id = c.req.param("id");
  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);

  const existing = await supabase.from("users").select("*").eq("id", id).single();
  if (existing.error) return c.json({ error: existing.error.message }, 400);

  if (auth.role === "customer_admin") {
    if (!auth.customer_id) return c.json({ error: "Missing tenant" }, 400);
    if (existing.data.customer_id !== auth.customer_id) {
      return c.json({ error: "Forbidden" }, 403);
    }
    if (body.data.role === "superadmin") {
      return c.json({ error: "Cannot assign superadmin role" }, 403);
    }
  } else if (auth.role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      email: body.data.email,
      name: body.data.name,
      role: body.data.role,
      status: body.data.status,
      customer_id: body.data.customerId,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data });
});
