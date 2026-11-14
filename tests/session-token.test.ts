import assert from "node:assert/strict";
import { resolveSessionSecret, signSessionToken, verifySessionToken, type UserSessionPayload } from "../lib/session-token";

const secret = "test-session-secret-with-enough-entropy";
const now = Date.now();
const payload: UserSessionPayload = {
  id: "user-1",
  email: "user@example.com",
  name: "Example User",
  role: "USER",
  expiresAt: now + 60_000,
};

const token = signSessionToken(payload, secret);
assert.deepEqual(verifySessionToken(token, secret, now), payload);
assert.equal(verifySessionToken(`${token.slice(0, -1)}x`, secret, now), null);
assert.equal(verifySessionToken(token, "different-secret", now), null);
assert.equal(verifySessionToken(signSessionToken({ ...payload, expiresAt: now - 1 }, secret), secret, now), null);
assert.equal(verifySessionToken("invalid-token", secret, now), null);
assert.equal(resolveSessionSecret({ SESSION_SECRET: " configured ", NODE_ENV: "production" }), "configured");
assert.throws(() => resolveSessionSecret({ NODE_ENV: "production" }), /SESSION_SECRET/);
assert.equal(typeof resolveSessionSecret({ NODE_ENV: "development" }), "string");

console.log("session token tests passed");
