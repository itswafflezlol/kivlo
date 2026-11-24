import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { z } from "zod";
import { CreateProjectBody } from "../../../shared/schema.js";
import { ValidationError } from "../shared/errors.js";
import * as svc from "./service.js";

export const projectsController = new Hono<AppEnv>();

projectsController.get("/", async (c) => {
  const user = c.get("user") as { id: string };
  return c.json({ projects: await svc.listProjects(user.id) });
});

projectsController.post("/", async (c) => {
  const user = c.get("user") as { id: string };
  const body = CreateProjectBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);
  }
  const idemKey = c.req.header("idempotency-key") ?? null;
  const r = await svc.createProject(user.id, body.data, idemKey);
  return c.json({ project: r.project, jobId: r.jobId ?? null, idempotent: r.reused }, r.reused ? 200 : 202);
});

projectsController.get("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  return c.json({ project: await svc.getProject(user.id, c.req.param("id")) });
});

projectsController.delete("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  await svc.deleteProject(user.id, c.req.param("id"));
  return c.body(null, 204);
});
