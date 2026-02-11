# Web App

## Run Locally

1. Install dependencies at repo root:
   pnpm install
2. Set env vars in `apps/web/.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (optional, defaults to `http://localhost:8787`)
3. Run the app:
   pnpm dev:web
