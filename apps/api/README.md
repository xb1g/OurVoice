# API (Hono on Edge)

## Local dev

1. Set env vars using `apps/api/.dev.vars` (see `.dev.vars.example`):
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_PROJECT_REF`
   - `GEMINI_API_KEY`
   - `ALLOWED_ORIGINS`
   - `INVITE_BASE_URL` (optional)
2. Install dependencies at repo root:
   - `pnpm install`
3. Run:
   - `pnpm dev:api`

## Routes
- `GET /health`
- `GET /auth/profile` (requires Supabase access token)
- `GET /backoffice/health` (requires `superadmin` role)
- `POST /invites` (admin)
- `GET /invites` (admin)
- `POST /invites/:id/revoke` (admin)
- `GET /v1/issues`
- `POST /v1/issues`
- `GET /v1/issues/:issueId`
- `PATCH /v1/issues/:issueId` (admin)
- `POST /v1/issues/:issueId/support`
- `POST /v1/issues/:issueId/vote`
- `POST /v1/issues/:issueId/comments`
- `POST /v1/issues/:issueId/solutions`
- `POST /v1/issues/:issueId/solutions/:solutionId/vote`
- `POST /v1/issues/:issueId/ai-suggestions`
