import { creditsFor } from "./credits.ts";
import assert from "node:assert";

assert.equal(creditsFor(0), 1);
assert.equal(creditsFor(1), 1);
assert.equal(creditsFor(60 * 19), 1);
assert.equal(creditsFor(60 * 20), 1);
assert.equal(creditsFor(60 * 20 + 1), 2);
assert.equal(creditsFor(60 * 60), 3);
assert.equal(creditsFor(60 * 90), 5);
assert.equal(creditsFor(NaN), 1);
assert.equal(creditsFor(-5), 1);
console.log("creditsFor: 9/9 passed");
