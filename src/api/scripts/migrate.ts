import postgres from "postgres";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const migrationsDir = join(root, "supabase/migrations");
const localDir = join(root, "supabase/local");

const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/kivlo";
const sql = postgres(url, { max: 1 });

// local auth stub (skipped on real Supabase where the schema already exists)
if (existsSync(localDir) && process.env.SKIP_LOCAL_STUB !== "1") {
  for (const f of readdirSync(localDir).filter((f) => f.endsWith(".sql")).sort()) {
    await sql.unsafe(readFileSync(join(localDir, f), "utf8"));
    console.log(`applied local stub ${f}`);
  }
}

await sql`create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())`;

for (const f of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
  const [seen] = await sql`select name from _migrations where name = ${f}`;
  if (seen) { console.log(`skip ${f} (applied)`); continue; }
  await sql.unsafe(readFileSync(join(migrationsDir, f), "utf8"));
  await sql`insert into _migrations (name) values (${f})`;
  console.log(`applied ${f}`);
}

await sql.end();
console.log("migrations done");
