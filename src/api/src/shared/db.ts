import postgres from "postgres";
import { config } from "../config.js";

export const sql = postgres(config.DATABASE_URL, {
  max: 10,
  connect_timeout: 10,
  idle_timeout: 20,
  prepare: true,
});

export async function closeDb() {
  await sql.end({ timeout: 5 });
}

/** Sets the RLS user GUC for a transaction so `auth.uid()` policies apply. */
export async function withUser<T>(userId: string, fn: (tx: postgres.Sql) => Promise<T>): Promise<T> {
  return (await sql.begin(async (tx) => {
    await tx`select set_config('app.user_id', ${userId}, true)`;
    return fn(tx);
  })) as T;
}
