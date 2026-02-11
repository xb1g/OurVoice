const SESSION_KEY = "hive_auth_session";

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

type AuthChangeListener = (session: SupabaseSession | null) => void;

const listeners = new Set<AuthChangeListener>();

const emit = (session: SupabaseSession | null) => {
  listeners.forEach((listener) => listener(session));
};

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
};

export const getSession = (): SupabaseSession | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
};

const setSession = (session: SupabaseSession | null) => {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    emit(null);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emit(session);
};

export const signInWithPassword = async (email: string, password: string) => {
  const { url, anonKey } = getSupabaseConfig();

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.msg || data?.error_description || "Invalid credentials");
  }

  const session: SupabaseSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    user: data.user,
  };

  setSession(session);
  return session;
};

export const signOut = async () => {
  const session = getSession();
  if (!session) {
    setSession(null);
    return;
  }

  const { url, anonKey } = getSupabaseConfig();
  await fetch(`${url}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
    },
  }).catch(() => undefined);

  setSession(null);
};

export const onAuthStateChange = (listener: AuthChangeListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
