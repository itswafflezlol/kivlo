import { Hono } from "hono";
import type { AppEnv } from "./shared/env.js";
import { AppError, problemResponse, problemBody } from "./shared/errors.js";
import { requestId, requestLogger, cors, secureHeaders, rateLimit } from "./shared/middleware.js";
import { requireAuth } from "./shared/auth.js";
import { logger } from "./shared/logger.js";
import { healthController } from "./health/controller.js";
import { meController } from "./me/controller.js";
import { projectsController } from "./projects/controller.js";
import { clipsController } from "./clips/controller.js";
import { presetsController } from "./presets/controller.js";
import { scheduleController } from "./schedule/controller.js";
import { uploadsController } from "./uploads/controller.js";
import { eventsController } from "./events/controller.js";

export function createApp() {
  const app = new Hono<AppEnv>();

  // middleware order: request ID → logging → CORS → secure headers → rate limit → auth → handler → errors
  app.use("*", requestId, requestLogger, cors, secureHeaders);

  app.route("/", healthController);
  app.route("/v1", eventsController); // /events ticket + stream (own auth)

  const v1 = new Hono<AppEnv>();
  v1.use("*", rateLimit, requireAuth);
  v1.route("/", meController);
  v1.route("/projects", projectsController);
  v1.route("/", clipsController);
  v1.route("/", presetsController);
  v1.route("/", scheduleController);
  v1.route("/", uploadsController);
  app.route("/v1", v1);

  app.notFound((c) =>
    c.json(
      problemBody(new AppError(404, "not_found", "Not found", "No such route."), c.get("requestId")),
      404,
      { "content-type": "application/problem+json" },
    ),
  );

  app.onError((err, c) => {
    if (err instanceof AppError) return problemResponse(c, err);
    logger.error({ err: String(err?.stack ?? err), request_id: c.get("requestId") }, "unhandled error");
    return c.json(
      problemBody(new AppError(500, "internal_error", "Internal error", "Something went wrong."), c.get("requestId") ?? "-"),
      500,
      { "content-type": "application/problem+json" },
    );
  });

  return app;
}
