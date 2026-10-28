import assert from "node:assert/strict";
import { preserveAsciiTreeBlocks } from "../components/MarkdownRenderer";

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
