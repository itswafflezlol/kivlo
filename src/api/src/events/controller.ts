import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { streamSSE } from "hono/streaming";
import { requireAuth, issueTicket, verifyTicket } from "../shared/auth.js";
import { subscribe } from "./service.js";
import { UnauthorizedError } from "../shared/errors.js";

export const eventsController = new Hono<AppEnv>();

// Long-lived JWT never goes in the URL; the client swaps it for a 60s ticket.
eventsController.post("/events/ticket", requireAuth, async (c) => {
  const user = c.get("user") as { id: string };
  return c.json({ ticket: await issueTicket(user.id), expiresIn: 60 });
});

eventsController.get("/events", async (c) => {
  const ticket = c.req.query("ticket");
  if (!ticket) throw new UnauthorizedError("Events stream needs a ticket. POST /v1/events/ticket first.");
  const user = await verifyTicket(ticket);

  return streamSSE(c, async (stream) => {
    const unsub = subscribe(user.id, (event, data) => {
      void stream.writeSSE({ event, data: JSON.stringify(data) });
    });
    await stream.writeSSE({ event: "connected", data: JSON.stringify({ ok: true }) });
    const hb = setInterval(() => void stream.writeSSE({ event: "heartbeat", data: "{}" }), 25_000);
    stream.onAbort(unsub);
    try {
      await new Promise<void>((resolve) => {
        stream.onAbort(() => resolve());
      });
    } finally {
      clearInterval(hb);
      unsub();
    }
  });
});
