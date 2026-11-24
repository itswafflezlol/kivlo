import { withUser, sql } from "../shared/db.js";
import { NotFoundError } from "../shared/errors.js";
import type { PatchClipBody } from "../../../shared/schema.js";

function mapClip(r: Record<string, unknown>) {
  return {
    id: r.id, projectId: r.project_id, title: r.title,
    start: Number(r.start_sec), end: Number(r.end_sec),
    duration: Number(r.end_sec) - Number(r.start_sec),
    score: r.score, reason: r.reason, status: r.status,
    words: r.words, settings: r.settings, fileKey: r.file_key, thumbKey: r.thumb_key,
  };
}

export async function listClips(userId: string, projectId: string) {
  return withUser(userId, async (tx) => {
    const own = await tx`select id from projects where id = ${projectId} and user_id = ${userId}`;
    if (!own.length) throw new NotFoundError("Project not found.");
    const rows = await tx`select * from clips where project_id = ${projectId} order by score desc nulls last, start_sec`;
    return rows.map(mapClip);
  });
}

export async function getClip(userId: string, id: string) {
  const rows = await sql`select * from clips where id = ${id} and user_id = ${userId}`;
  if (!rows.length) throw new NotFoundError("Clip not found.");
  return mapClip(rows[0]);
}

export async function patchClip(userId: string, id: string, patch: PatchClipBody) {
  const rows = await sql`
    update clips set
      title = coalesce(${patch.title ?? null}, title),
      settings = settings || ${sql.json((patch.settings ?? {}) as never)},
      words = coalesce(${patch.words ? sql.json(patch.words as never) : null}, words)
    where id = ${id} and user_id = ${userId}
    returning *`;
  if (!rows.length) throw new NotFoundError("Clip not found.");
  return mapClip(rows[0]);
}

export async function exportClip(userId: string, id: string) {
  return sql.begin(async (tx) => {
    const rows = await tx`update clips set status = 'rendering' where id = ${id} and user_id = ${userId} returning id, project_id`;
    if (!rows.length) throw new NotFoundError("Clip not found.");
    const job = await tx`insert into jobs (type, user_id, project_id, payload) values ('render', ${userId}, ${rows[0].project_id}, ${tx.json({ clipId: id })}) returning id`;
    return { clipId: id, jobId: job[0].id as number };
  });
}
