import assert from "node:assert/strict";
import { splitComplexityContent } from "../lib/complexity-content";

const tableFirst = `| Component | Space Complexity |
|---|---|
| Task registry | O(N + E) |
| Maximum heap | O(N) |

Overall auxiliary space complexity:
O(N + E)`;

const parsedTable = splitComplexityContent(tableFirst, "O(1)", "Missing");
assert.equal(parsedTable.value, "");
assert.equal(parsedTable.explanation, tableFirst);
assert.match(`${parsedTable.value}\n\n${parsedTable.explanation}`, /\| Component \| Space Complexity \|\n\|---\|---\|/);

const standard = splitComplexityContent("O(n)\nLinear scan.", "O(1)", "Missing");
assert.equal(standard.value, "O(n)");
assert.equal(standard.explanation, "Linear scan.");

console.log("complexity content tests passed");
