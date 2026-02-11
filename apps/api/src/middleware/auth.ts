import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { authClaimsSchema } from "../../../../packages/shared/src/index";

type AuthPayload = ReturnType<typeof authClaimsSchema.parse>;

const getJwksUrl = (projectRef: string) =>
  `https://${projectRef}.supabase.co/auth/v1/keys`;

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

const getJwks = (projectRef: string) => {
  const existing = jwksCache.get(projectRef);
  if (existing) return existing;
  const jwks = createRemoteJWKSet(new URL(getJwksUrl(projectRef)));
  jwksCache.set(projectRef, jwks);
  return jwks;
};

export const verifyAccessToken = async (token: string, projectRef: string) => {
  const issuer = `https://${projectRef}.supabase.co/auth/v1`;
  const { payload } = await jwtVerify(token, getJwks(projectRef), {
    issuer,
    audience: "authenticated",
    algorithms: ["RS256", "ES256"],
  });
  return authClaimsSchema.parse(payload);
};

export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const projectRef = c.env.SUPABASE_PROJECT_REF;
    if (!projectRef) {
      return c.json({ error: "Auth not configured" }, 500);
    }

    const payload = await verifyAccessToken(token, projectRef);
    c.set("auth", payload);
    c.set("accessToken", token);
  } catch (error) {
    console.warn("Auth verification failed", {
      requestId: c.get("requestId"),
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

export const requireRole = (roles: string[]) =>
  createMiddleware(async (c, next) => {
    const auth = c.get("auth") as AuthPayload | undefined;
    if (!auth?.role || !roles.includes(auth.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
