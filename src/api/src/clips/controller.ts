import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { z } from "zod";
import { PatchClipBody } from "../../../shared/schema.js";
import { ValidationError } from "../shared/errors.js";
import * as svc from "./service.js";

export const clipsController = new Hono<AppEnv>();

clipsController.get("/projects/:id/clips", async (c) => {
  const user = c.get("user") as { id: string };
  return c.json({ clips: await svc.listClips(user.id, c.req.param("id")) });
});

clipsController.get("/clips/:id", async (c) => {
  const user = c.get("user") as { id: string };
  return c.json({ clip: await svc.getClip(user.id, c.req.param("id")) });
});

clipsController.patch("/clips/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const body = PatchClipBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);
  }
  return c.json({ clip: await svc.patchClip(user.id, c.req.param("id"), body.data) });
});

clipsController.post("/clips/:id/export", async (c) => {
  const user = c.get("user") as { id: string };
  return c.json(await svc.exportClip(user.id, c.req.param("id")), 202);
});
