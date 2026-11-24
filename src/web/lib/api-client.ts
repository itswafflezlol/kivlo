// Typed API client. Active only when NEXT_PUBLIC_API_URL is set — otherwise
// lib/data.ts serves the mock data and the Pages demo is untouched.
import { getSession } from "./session";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const apiEnabled = API_URL.length > 0;

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: FieldErrors;
  constructor(status: number, body: { title?: string; detail?: string; code?: string; errors?: FieldErrors } | null) {
    super(body?.detail ?? body?.title ?? `Request failed (${status})`);
    this.status = status;
    this.code = body?.code ?? "error";
    this.fields = body?.errors;
  }
}

// Dev tokens while the app runs the demo session; real Supabase JWTs slot in
// here later without callers changing.
function authToken(): string {
  return getSession() ? "dev" : "dev";
}

type Opts = { method?: string; body?: unknown; headers?: Record<string, string> };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        authorization: `Bearer ${authToken()}`,
        ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
        ...opts.headers,
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  } catch {
    throw new ApiError(0, { code: "offline", detail: "offline" });
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get("content-type") ?? "";
  const body = type.includes("json") ? await res.json().catch(() => null) : null;
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
