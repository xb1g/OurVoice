import { createMiddleware } from "hono/factory";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimit = (key: string, max: number, windowMs: number) =>
  createMiddleware(async (c, next) => {
    const now = Date.now();
    const auth = c.get("auth");
    const ip = c.req.header("cf-connecting-ip") ?? "unknown_ip";
    const identity = auth?.sub ?? ip;
    const bucketKey = `${key}:${identity}`;

    const existing = buckets.get(bucketKey);
    if (!existing || existing.resetAt <= now) {
      buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (existing.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfter));
      return c.json(
        {
          error: {
            code: "rate_limited",
            message: "Too many requests",
            requestId: c.get("requestId"),
          },
        },
        429
      );
    }

    existing.count += 1;
    buckets.set(bucketKey, existing);
    await next();
  });
