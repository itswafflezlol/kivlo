import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { withUser } from "../shared/db.js";
import { creditsFor } from "../credits/service.js";
import { NotFoundError } from "../shared/errors.js";

export const meController = new Hono<AppEnv>();

meController.get("/me", async (c) => {
  const user = c.get("user") as { id: string };
  return withUser(user.id, async (tx) => {
    const rows = await tx`select id, name, email, plan from profiles where id = ${user.id}`;
    if (!rows.length) throw new NotFoundError("Profile not found.");
    const credits = await creditsFor(tx, user.id);
    return c.json({ profile: rows[0], credits });
  });
});
