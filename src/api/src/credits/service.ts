import type { Sql } from "../shared/db-types.js";

export const PLAN_CREDITS: Record<string, number> = { free: 3, pro: 30, creator: 70, agency: 150 };

export async function creditsFor(tx: Sql, userId: string) {
  const [row] = await tx`
    select p.plan, p.cycle_resets_at,
      coalesce(sum(case when l.kind in ('reserve','charge') then l.amount
                        when l.kind in ('refund','reset') then -l.amount end), 0)::int as used
    from profiles p left join credit_ledger l on l.user_id = p.id
    where p.id = ${userId}
    group by p.id`;
  if (!row) return null;
  const total = PLAN_CREDITS[row.plan] ?? 3;
  return { used: row.used, total, left: Math.max(0, total - row.used), resetsAt: row.cycle_resets_at };
}

export async function ledger(tx: Sql, userId: string, projectId: string | null, kind: "reserve" | "charge" | "refund" | "reset", amount: number, note?: string) {
  await tx`insert into credit_ledger (user_id, project_id, kind, amount, note)
           values (${userId}, ${projectId}, ${kind}, ${amount}, ${note ?? null})`;
}
