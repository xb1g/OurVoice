import type { AuthClaims } from "../../../../packages/shared/src/index";

export type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_PUBLISHABLE_KEY: string;
    SUPABASE_SECRET_KEY: string;
    SUPABASE_PROJECT_REF: string;
    INVITE_BASE_URL?: string;
    GEMINI_API_KEY?: string;
    ALLOWED_ORIGINS?: string;
  };
  Variables: {
    auth: AuthClaims;
    accessToken: string;
    requestId: string;
  };
};
