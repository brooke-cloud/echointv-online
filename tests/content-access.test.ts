import assert from "node:assert/strict";
import { decideContentAccess } from "../lib/content-access";

const base = {
  isAuthenticated: true,
  paywallEnabled: true,
  isFree: false,
  isAdmin: false,
  hasProAccess: false,
};

assert.deepEqual(decideContentAccess({ ...base, isAuthenticated: false, isFree: true }), {
  allowed: false,
  reason: "anonymous",
});
assert.equal(decideContentAccess({ ...base, paywallEnabled: false }).allowed, true);
assert.equal(decideContentAccess({ ...base, isFree: true }).allowed, true);
assert.equal(decideContentAccess({ ...base, isAdmin: true }).allowed, true);
assert.equal(decideContentAccess({ ...base, hasProAccess: true }).allowed, true);
assert.deepEqual(decideContentAccess(base), {
  allowed: false,
  reason: "subscription-required",
});

console.log("content access policy tests passed");
