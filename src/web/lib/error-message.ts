import { ApiError } from "./api-client";

// Maps problem+json responses to plain user-facing copy.
export function errorMessage(e: unknown): string {
  if (!(e instanceof ApiError)) return "Something went wrong. Try again.";
  if (e.status === 0) return "You're offline — check your connection.";
  if (e.status === 401) return "Sign in to continue.";
  if (e.status === 402) return "You're out of credits. Upgrade to keep clipping.";
  if (e.status === 403) return "You don't have access to that.";
  if (e.status === 404) return "That could not be found.";
  if (e.status === 409) return "That already exists.";
  if (e.status === 422) return e.fields ? "Check the highlighted fields." : e.message;
  if (e.status === 429) return "Too many requests — wait a moment and retry.";
  if (e.status >= 500) return "Something broke on our side. Try again in a bit.";
  return e.message;
}

export const fieldError = (e: unknown, field: string): string | undefined =>
  e instanceof ApiError ? e.fields?.[field]?.[0] : undefined;
