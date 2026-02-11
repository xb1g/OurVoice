import { createMiddleware } from "hono/factory";

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  await next();

  const latencyMs = Date.now() - start;
  const auth = c.get("auth");

  console.log(
    JSON.stringify({
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      latencyMs,
      userSub: auth?.sub,
    })
  );
});
