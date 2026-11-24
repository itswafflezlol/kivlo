import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import postgres from "postgres";

// Real local Postgres (docker compose profile `local`). Skipped unless RUN_DB_TESTS=1.
const RUN = process.env.RUN_DB_TESTS === "1";
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/kivlo";
const USER = process.env.DEV_USER_ID ?? "00000000-0000-0000-0000-0000000000a1";
process.env.DEV_AUTH = "1";
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = url;

const sql = RUN ? postgres(url, { max: 4 }) : (null as unknown as postgres.Sql);

before(async () => {
  if (!RUN) return;
  await sql`delete from jobs`;
  await sql`delete from credit_ledger`;
  await sql`delete from projects`;
});

after(async () => { if (RUN) await sql.end(); });

test("create project → job row + reserve ledger + NOTIFY received", { skip: !RUN }, async () => {
  const { createApp } = await import("../src/app.js");
  process.env.DEV_AUTH = "1";
  const app = createApp();

  const notified: string[] = [];
  const listener = postgres(url, { max: 1 });
  await listener.listen("kivlo_events", (p) => notified.push(p));

  const res = await app.request("http://x/v1/projects", {
    method: "POST",
    headers: { authorization: "Bearer dev", "content-type": "application/json", "idempotency-key": "test-k1" },
    body: JSON.stringify({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", rightsConfirmed: true, layout: "auto" }),
  });
  assert.equal(res.status, 202);
  const { project } = await res.json();

  const jobs = await sql`select * from jobs where project_id = ${project.id}`;
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].type, "import");

  const ledger = await sql`select * from credit_ledger where project_id = ${project.id}`;
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].kind, "reserve");
  assert.equal(ledger[0].amount, 1);

  // idempotent re-submit → same project, no new job/ledger rows
  const res2 = await app.request("http://x/v1/projects", {
    method: "POST",
    headers: { authorization: "Bearer dev", "content-type": "application/json", "idempotency-key": "test-k1" },
    body: JSON.stringify({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", rightsConfirmed: true, layout: "auto" }),
  });
  assert.equal(res2.status, 200);
  assert.equal((await sql`select count(*)::int c from jobs where project_id = ${project.id}`)[0].c, 1);

  // worker-style NOTIFY fanout
  await sql`select pg_notify('kivlo_events', ${JSON.stringify({ user_id: USER, type: "project.updated", projectId: project.id })})`;
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(notified.length >= 1);
  await listener.end();
});

test("out of credits → 402", { skip: !RUN }, async () => {
  const { createApp } = await import("../src/app.js");
  const app = createApp();
  // exhaust the demo user's credits
  await sql`insert into credit_ledger (user_id, kind, amount, note) values (${USER}, 'charge', 30, 'test exhaust')`;
  const res = await app.request("http://x/v1/projects", {
    method: "POST",
    headers: { authorization: "Bearer dev", "content-type": "application/json" },
    body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ", rightsConfirmed: true }),
  });
  assert.equal(res.status, 402);
  const body = await res.json();
  assert.equal(body.code, "out_of_credits");
  await sql`delete from credit_ledger where note = 'test exhaust'`;
});

test("channel URL → 422 field error; missing rights → 422", { skip: !RUN }, async () => {
  const { createApp } = await import("../src/app.js");
  const app = createApp();
  let res = await app.request("http://x/v1/projects", {
    method: "POST",
    headers: { authorization: "Bearer dev", "content-type": "application/json" },
    body: JSON.stringify({ url: "https://www.youtube.com/@MrBeast", rightsConfirmed: true }),
  });
  assert.equal(res.status, 422);
  let body = await res.json();
  assert.ok(body.errors?.url?.length);

  res = await app.request("http://x/v1/projects", {
    method: "POST",
    headers: { authorization: "Bearer dev", "content-type": "application/json" },
    body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ", rightsConfirmed: false }),
  });
  assert.equal(res.status, 422);
});
