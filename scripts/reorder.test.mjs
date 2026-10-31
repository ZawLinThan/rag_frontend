import { test } from "node:test";
import assert from "node:assert/strict";
import { reorderIds } from "../src/lib/reorder.ts";
test("moves cards in either direction and preserves other cards", () => {
  const original = ["a", "b", "c", "d"];
  assert.deepEqual(reorderIds(original, "a", "c"), ["b", "c", "a", "d"]);
  assert.deepEqual(reorderIds(original, "d", "b"), ["a", "d", "b", "c"]);
  assert.deepEqual(original, ["a", "b", "c", "d"]);
  assert.equal(reorderIds(original, "missing", "a"), original);
});
