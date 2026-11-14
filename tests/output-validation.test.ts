import assert from "node:assert/strict";
import { executionMatchesExpected, normalizeProgramOutput } from "../lib/output-validation";

assert.equal(normalizeProgramOutput("ok  \r\nnext\r\n"), "ok\nnext");
assert.equal(executionMatchesExpected(true, "2\n", "2"), true);
assert.equal(executionMatchesExpected(true, "2\nextra", "2"), false);
assert.equal(executionMatchesExpected(false, "2", "2"), false);
assert.equal(executionMatchesExpected(true, "", ""), false);

console.log("output validation tests passed");
