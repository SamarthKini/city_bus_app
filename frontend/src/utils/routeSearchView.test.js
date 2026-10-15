import test from "node:test";
import assert from "node:assert/strict";
import { getRouteSearchView } from "./routeSearchView.js";

test("route search view distinguishes loading from empty results", () => {
  assert.equal(getRouteSearchView("loading", []), "loading");
});

test("successful searches show results or a genuine empty state", () => {
  assert.equal(getRouteSearchView("success", [{ id: 1 }]), "results");
  assert.equal(getRouteSearchView("success", []), "empty");
});

test("request failures stay distinct from empty results", () => {
  assert.equal(getRouteSearchView("error", []), "error");
  assert.equal(getRouteSearchView("idle", []), "idle");
});
