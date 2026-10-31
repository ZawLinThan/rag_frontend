import { test } from "node:test";
import assert from "node:assert/strict";
import { createCardOrderStore } from "../src/stores/cardOrderStore.ts";

test("persists sorting separately for each account and restores it", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const alice = createCardOrderStore("alice");
  const bob = createCardOrderStore("bob");
  alice.getState().setCourses(["b", "a"]);
  alice.getState().setCards("deck", ["two", "one"]);
  assert.deepEqual(bob.getState().courses, []);
  assert.deepEqual(bob.getState().cards, {});
  const restored = createCardOrderStore("alice");
  assert.deepEqual(restored.getState().courses, ["b", "a"]);
  assert.deepEqual(restored.getState().cards.deck, ["two", "one"]);
  values.set("folio:course-order:legacy", JSON.stringify(["old"]));
  assert.deepEqual(createCardOrderStore("legacy").getState().courses, ["old"]);
});
