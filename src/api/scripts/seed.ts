import postgres from "postgres";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/kivlo";
const sql = postgres(url, { max: 1 });

await sql.unsafe(readFileSync(join(root, "supabase/seed.sql"), "utf8"));
await sql.end();
console.log("seeded");
