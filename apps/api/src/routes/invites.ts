import { Hono } from "hono";
import { z } from "zod";
import { requireAuth, verifyAccessToken } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
  createSupabaseAdminClient,
  createSupabaseClientForUser,
} from "../lib/supabase";
import type { Env } from "../types/env";

export const inviteRoutes = new Hono<Env>();

const inviteCreateSchema = z.object({
  email: z.string().email(),
  role: z.enum(["user", "customer_admin", "superadmin"]),
  customerId: z.string().uuid().nullable().optional(),
  expiresInDays: z.number().int().min(1).max(30).optional(),
});

const inviteAcceptSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).optional(),
  name: z.string().min(1).optional(),
});

const getAuth = (c: any) =>
  c.get("auth") as { role?: string; customer_id?: string; sub?: string };

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const generateToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

inviteRoutes.post("/invites", requireAuth, rateLimit("invite_create", 20, 60_000), async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const body = inviteCreateSchema.safeParse(await c.req.json().catch(() => ({})));
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

  const token = generateToken();
  const expiresInDays = body.data.expiresInDays ?? 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  const creator = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", auth.sub)
    .single();

  if (creator.error) return c.json({ error: creator.error.message }, 400);

  const { data, error } = await supabase
    .from("invites")
    .insert({
      email: body.data.email,
      role: body.data.role,
      status: "pending",
      token,
      expiresAt: expiresAt.toISOString(),
      customer_id: customerId,
      created_by_id: creator.data?.id ?? null,
    })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);

  const admin = createSupabaseAdminClient(c.env);
  await admin.from("audit_logs").insert({
    action: "invite_sent",
    entityType: "invite",
    entityId: data.id,
    customerId: data.customer_id,
    actorId: data.created_by_id,
    data: { email: data.email, role: data.role },
  });

  const baseUrl = c.env.INVITE_BASE_URL || "http://localhost:3000";
  return c.json(
    {
      data,
      inviteUrl: `${baseUrl}/invite?token=${token}`,
    },
    201
  );
});

inviteRoutes.get("/invites", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);
  let query = supabase.from("invites").select("*").order("createdAt", {
    ascending: false,
  });

  if (auth.role === "customer_admin") {
    if (!auth.customer_id) return c.json({ error: "Missing tenant" }, 400);
    query = query.eq("customer_id", auth.customer_id);
  } else if (auth.role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  } else {
    const customerId = c.req.query("customer_id");
    if (customerId) query = query.eq("customer_id", customerId);
  }

  const status = c.req.query("status");
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ data });
});

inviteRoutes.post("/invites/:id/revoke", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.role) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const accessToken = c.get("accessToken");
  const supabase = createSupabaseClientForUser(c.env, accessToken);

  const existing = await supabase.from("invites").select("*").eq("id", id).single();
  if (existing.error) return c.json({ error: existing.error.message }, 400);

  if (auth.role === "customer_admin") {
    if (!auth.customer_id) return c.json({ error: "Missing tenant" }, 400);
    if (existing.data.customer_id !== auth.customer_id) {
      return c.json({ error: "Forbidden" }, 403);
    }
  } else if (auth.role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (existing.data.status === "accepted") {
    return c.json({ error: "Invite already accepted" }, 409);
  }

  const { data, error } = await supabase
    .from("invites")
    .update({ status: "revoked" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);

  const admin = createSupabaseAdminClient(c.env);
  await admin.from("audit_logs").insert({
    action: "invite_revoked",
    entityType: "invite",
    entityId: data.id,
    customerId: data.customer_id,
    actorId: data.created_by_id,
    data: { email: data.email, role: data.role },
  });

  return c.json({ data });
});

inviteRoutes.post("/invites/accept", rateLimit("invite_accept", 10, 60_000), async (c) => {
  const body = inviteAcceptSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    return c.json({ error: "Invalid payload", details: body.error.flatten() }, 400);
  }

  const admin = createSupabaseAdminClient(c.env);
  const { data: invite, error } = await admin
    .from("invites")
    .select("*")
    .eq("token", body.data.token)
    .single();

  if (error || !invite) return c.json({ error: "Invite not found" }, 404);

  if (invite.status === "revoked") return c.json({ error: "Invite revoked" }, 410);
  if (invite.status === "accepted") return c.json({ error: "Invite already accepted" }, 409);

  const now = new Date();
  const expiresAt = new Date(invite.expiresAt);
  if (expiresAt.getTime() < now.getTime()) {
    await admin.from("invites").update({ status: "expired" }).eq("id", invite.id);
    return c.json({ error: "Invite expired" }, 410);
  }

  const authHeader = c.req.header("authorization");
  let authSub: string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice("Bearer ".length).trim();
      const projectRef = c.env.SUPABASE_PROJECT_REF;
      if (!projectRef) return c.json({ error: "Auth not configured" }, 500);
      const payload = await verifyAccessToken(token, projectRef);
      authSub = payload.sub;
    } catch {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  let authUserId = authSub;
  let requiresLogin = false;

  if (authSub) {
    const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(authSub);
    if (authErr || !authUser?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (authUser.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return c.json({ error: "Invite does not match user" }, 403);
    }

    await admin.auth.admin.updateUserById(authSub, {
      app_metadata: {
        role: invite.role,
        customer_id: invite.customer_id ?? null,
      },
    });
  } else {
    if (!body.data.password) {
      return c.json({ error: "Password required" }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: invite.email,
      password: body.data.password,
      email_confirm: true,
      user_metadata: body.data.name ? { name: body.data.name } : undefined,
      app_metadata: {
        role: invite.role,
        customer_id: invite.customer_id ?? null,
      },
    });

    if (createErr || !created.user) {
      return c.json({ error: createErr?.message || "Failed to create user" }, 400);
    }

    authUserId = created.user.id;
    requiresLogin = true;
  }

  const { data: publicUser, error: publicErr } = await admin
    .from("users")
    .upsert(
      {
        auth_user_id: authUserId,
        email: invite.email,
        name: body.data.name ?? null,
        role: invite.role,
        status: "active",
        customer_id: invite.customer_id ?? null,
      },
      { onConflict: "auth_user_id" }
    )
    .select("*")
    .single();

  if (publicErr || !publicUser) {
    return c.json({ error: publicErr?.message || "Failed to upsert user" }, 400);
  }

  await admin.from("invites").update({ status: "accepted" }).eq("id", invite.id);
  await admin.from("audit_logs").insert({
    action: "invite_accepted",
    entityType: "invite",
    entityId: invite.id,
    customerId: invite.customer_id,
    actorId: publicUser.id,
    data: { email: invite.email, role: invite.role },
  });

  return c.json({
    ok: true,
    authUserId,
    userId: publicUser.id,
    role: invite.role,
    customerId: invite.customer_id ?? null,
    requiresLogin,
  });
});
