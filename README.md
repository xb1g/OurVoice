# Hive Monorepo

Workspaces:
- apps/web: React + Vite frontend
- apps/api: Hono (edge) API
- packages/db: Prisma schema and client
- packages/shared: Shared types/validators

Common commands:
- pnpm dev:web
- pnpm dev:api
- pnpm check

API env vars live in `apps/api/.dev.vars` (see `.dev.vars.example`):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PROJECT_REF`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS`
- `INVITE_BASE_URL` (optional)
