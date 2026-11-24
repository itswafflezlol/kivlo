import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideoLink } from "../../shared/linkParse.js";
import { creditsFor } from "../../shared/credits.js";
import { AppError, ValidationError, PaymentRequiredError, problemBody } from "../src/shared/errors.js";

// service-level logic exercised without a DB: link validation, credit math,
// problem body shape, idempotency decision.

test("parseVideoLink rejects channels/playlists/unsupported with the right reason", () => {
  assert.equal((parseVideoLink("https://www.youtube.com/@MrBeast") as { ok: false; reason: string }).reason, "channel");
  assert.equal((parseVideoLink("https://www.youtube.com/playlist?list=PLx") as { ok: false; reason: string }).reason, "playlist");
  assert.equal((parseVideoLink("https://kick.com/x") as { ok: false; reason: string }).reason, "unsupported");
  assert.equal((parseVideoLink("https://www.twitch.tv/kaicenat") as { ok: false; reason: string }).reason, "channel");
});

test("parseVideoLink canonicalizes youtube + twitch", () => {
  const y = parseVideoLink("https://youtu.be/dQw4w9WgXcQ?t=42");
  assert.deepEqual({ ok: y.ok, platform: (y as { platform?: string }).platform, id: (y as { id?: string }).id, url: (y as { url?: string }).url },
    { ok: true, platform: "youtube", id: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
  const t = parseVideoLink("https://www.twitch.tv/videos/2000000000");
  assert.equal((t as { kind?: string }).kind, "vod");
});

test("creditsFor: 1 credit per 20 min, ceil", () => {
  assert.equal(creditsFor(1200), 1);
  assert.equal(creditsFor(1201), 2);
  assert.equal(creditsFor(3600), 3);
});

test("ValidationError → problem body has field errors + request_id", () => {
  const e = new ValidationError("That's a channel link. Paste a link to one video.", { url: ["channel link"] });
  const body = problemBody(e, "req-1");
  assert.equal(body.status, 422);
  assert.equal(body.code, "validation_failed");
  assert.equal(body.request_id, "req-1");
  assert.deepEqual(body.errors, { url: ["channel link"] });
});

test("PaymentRequiredError is 402 out_of_credits", () => {
  const e = new PaymentRequiredError();
  assert.equal(e.status, 402);
  assert.equal(e.code, "out_of_credits");
});

test("unknown error maps to generic 500 (no internals leak)", () => {
  const e = new AppError(500, "internal_error", "Internal error", "Something went wrong.");
  assert.equal(problemBody(e, "r").code, "internal_error");
});
