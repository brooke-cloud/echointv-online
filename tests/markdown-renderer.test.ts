import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownRenderer, { normalizeMarkdownTables, preserveAsciiTreeBlocks } from "../components/MarkdownRenderer";

const explanation = `The tree is:
    5
   / \\
  1   5
 / \\   \\
5   5   5
There are four univalue subtrees.`;

assert.equal(preserveAsciiTreeBlocks(explanation), `The tree is:
\`\`\`ascii-tree
    5
   / \\
  1   5
 / \\   \\
5   5   5
\`\`\`
There are four univalue subtrees.`);

const regularText = "Use src / dst to describe the route.\nThen return the price.";
assert.equal(preserveAsciiTreeBlocks(regularText), regularText);

console.log("markdown renderer ASCII tree tests passed");

const continuedList = renderToStaticMarkup(React.createElement(MarkdownRenderer, {
  content: "1. First observation\n2. Second observation\n\n- Nested detail\n\n5. Continued observation",
}));
assert.match(continuedList, /<ol[^>]*start="5"/);
assert.match(continuedList, />Continued observation</);
console.log("markdown renderer ordered-list continuation test passed");

const compactTable = "Actual task execution time depends on the task itself.\n| Function | Time Complexity | Explanation |\n|---|---|---|\n| addTask | O(k) | Register a task |";
assert.match(normalizeMarkdownTables(compactTable), /itself\.\n\n\| Function/);
const renderedTable = renderToStaticMarkup(React.createElement(MarkdownRenderer, { content: compactTable }));
assert.match(renderedTable, /<table/);
assert.match(renderedTable, /<th[^>]*>Function<\/th>/);
assert.match(renderedTable, /<td[^>]*>addTask<\/td>/);

const fencedPipeText = "```text\nparagraph\n| A | B |\n|---|---|\n```";
assert.equal(normalizeMarkdownTables(fencedPipeText), fencedPipeText);
console.log("markdown renderer compact-table normalization test passed");
