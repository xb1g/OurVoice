import { getSession } from "./authService";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const getApiBaseUrl = () => apiBaseUrl;

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const session = getSession();
  const token = session?.access_token;

  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const json = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message =
      json?.error?.message || json?.error || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, json?.error?.details);
  }

  return json as T;
};
