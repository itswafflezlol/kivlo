import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { z } from "zod";
import { withUser, sql } from "../shared/db.js";
import { CreatePresetBody } from "../../../shared/schema.js";
import { ValidationError, NotFoundError } from "../shared/errors.js";

function mapPreset(r: Record<string, unknown>, userId: string) {
  return {
    id: r.id, ownerId: r.owner_id, name: r.name, kind: r.kind,
    settings: r.settings, isDefault: r.is_default, mine: r.owner_id === userId,
  };
}

export const presetsController = new Hono<AppEnv>();

presetsController.get("/presets", async (c) => {
  const user = c.get("user") as { id: string };
  const rows = await sql`select * from presets where owner_id is null or owner_id = ${user.id} order by kind, name`;
  return c.json({ presets: rows.map((r) => mapPreset(r, user.id)) });
});

presetsController.post("/presets", async (c) => {
  const user = c.get("user") as { id: string };
  const body = CreatePresetBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);
  const rows = await sql`insert into presets (owner_id, name, kind, settings) values (${user.id}, ${body.data.name}, ${body.data.kind}, ${sql.json(body.data.settings as never)}) returning *`;
  return c.json({ preset: mapPreset(rows[0], user.id) }, 201);
});

presetsController.patch("/presets/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const body = await c.req.json().catch(() => ({}));
  const rows = await sql`
    update presets set
      name = coalesce(${body.name ?? null}, name),
      settings = settings || ${sql.json((body.settings ?? {}) as never)},
      is_default = coalesce(${typeof body.isDefault === "boolean" ? body.isDefault : null}, is_default)
    where id = ${c.req.param("id")} and owner_id = ${user.id} returning *`;
  if (!rows.length) throw new NotFoundError("Preset not found (or is built-in).");
  return c.json({ preset: mapPreset(rows[0], user.id) });
});

presetsController.delete("/presets/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const rows = await sql`delete from presets where id = ${c.req.param("id")} and owner_id = ${user.id} returning id`;
  if (!rows.length) throw new NotFoundError("Preset not found (or is built-in).");
  return c.body(null, 204);
});

presetsController.post("/presets/:id/default", async (c) => {
  const user = c.get("user") as { id: string };
  const id = c.req.param("id");
  return withUser(user.id, async (tx) => {
    const target = await tx`select kind, owner_id from presets where id = ${id} and (owner_id is null or owner_id = ${user.id})`;
    if (!target.length) throw new NotFoundError("Preset not found.");
    await tx`update presets set is_default = false where kind = ${target[0].kind} and (owner_id = ${user.id} or (owner_id is null and kind = ${target[0].kind}))`;
    await tx`update presets set is_default = true where id = ${id}`;
    return c.json({ ok: true });
  });
});
