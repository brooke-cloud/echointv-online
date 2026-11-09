import assert from "node:assert/strict";
import { shouldAutoInvokePython } from "../lib/python-execution";

assert.equal(shouldAutoInvokePython(`def formatText(texts, width):
    return texts

if __name__ == "__main__":
    for line in formatText(["hello"], 16):
        print(line)`), false, "a complete script must not be invoked a second time");

assert.equal(shouldAutoInvokePython(`def formatText(texts, width):
    return texts`), true, "a function-only submission still needs the platform harness");

assert.equal(shouldAutoInvokePython(`def solve():
    print("debug")
    return [1, 2]`), true, "prints inside a function do not make it a complete script");

assert.equal(shouldAutoInvokePython(`if '__main__' == __name__:
    print("complete")`), false, "the reversed main-guard form is supported");

assert.equal(shouldAutoInvokePython(`if __name__ == "__main__": print("complete")`), false, "an inline main-guard body is supported");

assert.equal(shouldAutoInvokePython(`EXAMPLE = \"\"\"
if __name__ == "__main__":
    print("documentation only")
\"\"\"

def solve():
    return 1`), true, "a main guard shown inside a triple-quoted string is ignored");

assert.equal(shouldAutoInvokePython(`# if __name__ == "__main__":
def solve():
    return 1`), true, "a commented main guard is ignored");

console.log("python execution mode tests passed");
