import { sql, withUser } from "../shared/db.js";
import { parseVideoLink } from "../../../shared/linkParse.js";
import { ValidationError, PaymentRequiredError, NotFoundError } from "../shared/errors.js";
import type { CreateProjectBody } from "../../../shared/schema.js";
import * as repo from "./repository.js";
import * as credits from "../credits/service.js";

export async function listProjects(userId: string) {
  return withUser(userId, (tx) => repo.listByUser(tx, userId));
}

export async function getProject(userId: string, id: string) {
  const p = await withUser(userId, (tx) => repo.getOwned(tx, userId, id));
  if (!p) throw new NotFoundError("Project not found.");
  return p;
}

export async function deleteProject(userId: string, id: string) {
  const ok = await withUser(userId, (tx) => repo.remove(tx, userId, id));
  if (!ok) throw new NotFoundError("Project not found.");
}

export async function createProject(userId: string, body: CreateProjectBody, idemKey: string | null) {
  const parsed = parseVideoLink(body.url);
  if (!parsed.ok) {
    throw new ValidationError(parsed.message, { url: [parsed.message] });
  }

  return withUser(userId, async (tx) => {
    // Idempotent submit: same key → same project, no double charge/job.
    if (idemKey) {
      const existing = await repo.byIdemKey(tx, userId, idemKey);
      if (existing) return { project: existing, reused: true };
    }
    const c = await credits.creditsFor(tx, userId);
    if (!c) throw new NotFoundError("Profile not found.");
    if (c.left < 1) throw new PaymentRequiredError();

    const project = await repo.insert(tx, {
      userId,
      sourceUrl: parsed.url,
      platform: parsed.platform,
      sourceId: parsed.id,
      startSec: parsed.startSec ?? null,
      rightsConfirmedAt: new Date().toISOString(),
      idempotencyKey: idemKey,
      settings: { layout: body.layout, presetId: body.presetId ?? null },
    });
    // length unknown until probe — hold 1 credit now, charge the real amount after probe
    await credits.ledger(tx, userId, project.id as string, "reserve", 1, "import reservation");
    const jobId = await repo.enqueue(tx, {
      type: "import", userId, projectId: project.id as string,
      payload: { url: parsed.url, platform: parsed.platform, sourceId: parsed.id, layout: body.layout, presetId: body.presetId ?? null, startSec: parsed.startSec ?? null },
    });
    return { project, jobId, reused: false };
  });
}

export { sql };
