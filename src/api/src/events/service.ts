import { sql } from "../shared/db.js";
import { logger } from "../shared/logger.js";

type Listener = (event: string, data: unknown) => void;
const streams = new Map<string, Set<Listener>>();

let listening = false;

export async function startNotifyFanout() {
  if (listening) return;
  listening = true;
  await sql.listen("kivlo_events", (raw) => {
    try {
      const msg = JSON.parse(raw);
      const targets = msg.user_id ? streams.get(msg.user_id) : null;
      if (!targets) return;
      for (const send of targets) send(msg.type ?? "message", msg);
    } catch (e) {
      logger.warn({ err: String(e) }, "bad kivlo_events payload");
    }
  });
  logger.info("listening on kivlo_events");
}

export function subscribe(userId: string, send: Listener) {
  let set = streams.get(userId);
  if (!set) { set = new Set(); streams.set(userId, set); }
  set.add(send);
  return () => {
    set.delete(send);
    if (set.size === 0) streams.delete(userId);
  };
}
