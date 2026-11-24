import type { AuthUser } from "./auth.js";

export type AppEnv = { Variables: { user: AuthUser; requestId: string } };
