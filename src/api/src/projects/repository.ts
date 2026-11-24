import type { Sql } from "../shared/db-types.js";

export function mapProject(r: Record<string, unknown>) {
  return {
    id: r.id, userId: r.user_id, sourceUrl: r.source_url, platform: r.platform,
    sourceId: r.source_id, title: r.title, channel: r.channel,
    durationSec: r.duration_sec, thumbnailUrl: r.thumbnail_url,
    status: r.status, stage: r.stage, progress: r.progress, error: r.error,
    rightsConfirmedAt: r.rights_confirmed_at, idempotencyKey: r.idempotency_key,
    createdAt: r.created_at,
  };
}

export async function listByUser(tx: Sql, userId: string) {
  const rows = await tx`select * from projects where user_id = ${userId} order by created_at desc`;
  return rows.map(mapProject);
}

export async function getOwned(tx: Sql, userId: string, id: string) {
  const rows = await tx`select * from projects where id = ${id} and user_id = ${userId}`;
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function byIdemKey(tx: Sql, userId: string, key: string) {
  const rows = await tx`select * from projects where user_id = ${userId} and idempotency_key = ${key}`;
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function insert(tx: Sql, p: {
  userId: string; sourceUrl: string; platform: string | null; sourceId: string | null;
  startSec: number | null; rightsConfirmedAt: string; idempotencyKey: string | null;
  settings: Record<string, unknown>;
}) {
  const rows = await tx`
    insert into projects (user_id, source_url, platform, source_id, rights_confirmed_at, idempotency_key, error)
    values (${p.userId}, ${p.sourceUrl}, ${p.platform}, ${p.sourceId}, ${p.rightsConfirmedAt}, ${p.idempotencyKey}, null)
    returning *`;
  return mapProject(rows[0]);
}

export async function remove(tx: Sql, userId: string, id: string) {
  const rows = await tx`delete from projects where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}

export async function enqueue(tx: Sql, j: { type: string; userId: string; projectId: string; payload: Record<string, unknown> }) {
  const rows = await tx`
    insert into jobs (type, user_id, project_id, payload)
    values (${j.type}, ${j.userId}, ${j.projectId}, ${tx.json(j.payload as never)})
    returning id`;
  return rows[0].id as number;
}
