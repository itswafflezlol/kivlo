import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { z } from "zod";
import { sql } from "../shared/db.js";
import { CreatePostBody, PatchPostBody } from "../../../shared/schema.js";
import { ValidationError, NotFoundError } from "../shared/errors.js";

function mapPost(r: Record<string, unknown>) {
  return { id: r.id, clipId: r.clip_id, platform: r.platform, time: r.time, status: r.status };
}

export const scheduleController = new Hono<AppEnv>();

scheduleController.get("/schedule", async (c) => {
  const user = c.get("user") as { id: string };
  const from = c.req.query("from") ?? "1970-01-01";
  const to = c.req.query("to") ?? "2100-01-01";
  const rows = await sql`select * from scheduled_posts where user_id = ${user.id} and time between ${from} and ${to} order by time`;
  return c.json({ posts: rows.map(mapPost) });
});

scheduleController.post("/schedule", async (c) => {
  const user = c.get("user") as { id: string };
  const body = CreatePostBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);
  const own = await sql`select id from clips where id = ${body.data.clipId} and user_id = ${user.id}`;
  if (!own.length) throw new ValidationError("Unknown clip.", { clipId: ["Clip not found."] });
  const rows = await sql`insert into scheduled_posts (user_id, clip_id, platform, time) values (${user.id}, ${body.data.clipId}, ${body.data.platform}, ${body.data.time}) returning *`;
  return c.json({ post: mapPost(rows[0]) }, 201);
});

scheduleController.patch("/schedule/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const body = PatchPostBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);
  const rows = await sql`
    update scheduled_posts set
      time = coalesce(${body.data.time ?? null}, time),
      status = coalesce(${body.data.status ?? null}, status)
    where id = ${c.req.param("id")} and user_id = ${user.id} returning *`;
  if (!rows.length) throw new NotFoundError("Scheduled post not found.");
  return c.json({ post: mapPost(rows[0]) });
});

scheduleController.delete("/schedule/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const rows = await sql`delete from scheduled_posts where id = ${c.req.param("id")} and user_id = ${user.id} returning id`;
  if (!rows.length) throw new NotFoundError("Scheduled post not found.");
  return c.body(null, 204);
});
