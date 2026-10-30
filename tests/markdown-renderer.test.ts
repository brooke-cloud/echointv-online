import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownRenderer, { preserveAsciiTreeBlocks } from "../components/MarkdownRenderer";

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
