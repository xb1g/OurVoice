import { Hono } from "hono";
import { corsAllowlist } from "./middleware/cors";
import { notFound, onError } from "./middleware/error-handler";
import { requestLogger } from "./middleware/logger";
import { requestId } from "./middleware/request-id";
import { securityHeaders } from "./middleware/security";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { inviteRoutes } from "./routes/invites";
import { issueRoutes } from "./routes/issues";
import type { Env } from "./types/env";

const app = new Hono<Env>();

app.use("*", requestId);
app.use("*", corsAllowlist);
app.use("*", securityHeaders);
app.use("*", requestLogger);

app.route("/", healthRoutes);
app.route("/", authRoutes);
app.route("/", adminRoutes);
app.route("/", inviteRoutes);
app.route("/", issueRoutes);

app.notFound(notFound);
app.onError(onError);

export default app;
