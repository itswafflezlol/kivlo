import type { Context } from "hono";
import type { AppEnv } from "./env.js";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly errors?: Record<string, string[]>;
  constructor(status: number, code: string, title: string, detail?: string, errors?: Record<string, string[]>) {
    super(detail ?? title);
    this.status = status;
    this.code = code;
    this.title = title;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(detail: string, errors?: Record<string, string[]>) {
    super(422, "validation_failed", "Validation failed", detail, errors);
  }
}
export class UnauthorizedError extends AppError {
  constructor(detail = "Sign in to continue.") {
    super(401, "unauthorized", "Unauthorized", detail);
  }
}
export class ForbiddenError extends AppError {
  constructor(detail = "You don't have access to this.") {
    super(403, "forbidden", "Forbidden", detail);
  }
}
export class NotFoundError extends AppError {
  constructor(detail = "Not found.") {
    super(404, "not_found", "Not found", detail);
  }
}
export class ConflictError extends AppError {
  constructor(detail = "This already exists.") {
    super(409, "conflict", "Conflict", detail);
  }
}
export class PaymentRequiredError extends AppError {
  constructor(detail = "You're out of credits. Upgrade to keep clipping.") {
    super(402, "out_of_credits", "Out of credits", detail);
  }
}
export class RateLimitError extends AppError {
  constructor() {
    super(429, "rate_limited", "Too many requests", "Slow down and try again in a moment.");
  }
}

export function problemBody(e: AppError, requestId: string) {
  return {
    type: "about:blank",
    title: e.title,
    status: e.status,
    detail: e.message,
    code: e.code,
    request_id: requestId,
    ...(e.errors ? { errors: e.errors } : {}),
  };
}

export function problemResponse(c: Context<AppEnv>, e: AppError) {
  return c.json(problemBody(e, c.get("requestId")), e.status as 400, {
    "content-type": "application/problem+json",
  });
}
