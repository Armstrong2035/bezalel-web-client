import { test } from "node:test";
import assert from "node:assert/strict";
import { createNavigationController, isRouteChange } from "../src/components/loading/navigationController.mjs";

function setup() {
  let clock = 0;
  let nextId = 0;
  const timers = new Map();
  const controller = createNavigationController({
    now: () => clock,
    schedule: (fn, delay) => { const id = ++nextId; timers.set(id, { at: clock + delay, fn }); return id; },
    unschedule: id => timers.delete(id),
  });
  const tick = (ms) => {
    const end = clock + ms;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      timers.delete(id); clock = timer.at; timer.fn();
    }
    clock = end;
  };
  return { controller, tick, state: () => controller.getSnapshot() };
}

test("cached routes get a visible entrance followed by a controlled reveal", () => {
  const { controller, tick, state } = setup();
  const id = controller.begin();
  controller.settle(id);
  tick(649);
  assert.equal(state().phase, "loading");
  tick(1);
  assert.equal(state().phase, "revealing");
  tick(240);
  assert.equal(state().phase, "idle");
});

test("URL commit cannot reveal a page until all required data has loaded", () => {
  const { controller, tick, state } = setup();
  const id = controller.begin();
  const releaseAuth = controller.hold("Checking your session");
  const releaseDocument = controller.hold("Restoring your canvas");
  controller.settle(id);
  tick(5000);
  releaseAuth(); tick(100);
  assert.equal(state().phase, "loading");
  releaseDocument(); tick(0);
  assert.equal(state().phase, "revealing");
  tick(240);
  assert.equal(state().phase, "idle");
});

test("a redirect or newer navigation ignores completion of the previous request", () => {
  const { controller, tick, state } = setup();
  const first = controller.begin();
  const second = controller.begin();
  controller.settle(first); tick(2000);
  assert.equal(state().phase, "loading");
  controller.settle(second); tick(240);
  assert.equal(state().phase, "idle");
});

test("a late loading boundary cancels the reveal", () => {
  const { controller, tick, state } = setup();
  controller.settle(controller.begin()); tick(650);
  const release = controller.hold("Loading data");
  tick(1000);
  assert.equal(state().phase, "loading");
  release(); tick(240);
  assert.equal(state().phase, "idle");
});

test("slow requests offer recovery without pretending the page is ready", () => {
  const { controller, tick, state } = setup();
  const id = controller.begin();
  const release = controller.hold();
  tick(12000);
  assert.equal(state().slow, true);
  assert.equal(state().phase, "loading");
  controller.cancel(); controller.settle(id); release(); tick(30000);
  assert.equal(state().phase, "idle");
});

test("stale releases cannot dismiss a subsequent navigation", () => {
  const { controller, tick, state } = setup();
  const release = controller.hold();
  controller.cancel();
  controller.begin(); release(); tick(2000);
  assert.equal(state().phase, "loading");
});

test("page errors/unmount release blockers, including initial page hydration", () => {
  const { controller, tick, state } = setup();
  const release = controller.hold("Opening documents");
  assert.equal(state().phase, "loading");
  release(); tick(890);
  assert.equal(state().phase, "idle");
});

test("hash links, same-page clicks and external URLs don't start an overlay", () => {
  const current = "https://example.com/documents?sort=new";
  assert.equal(isRouteChange("#section", current), false);
  assert.equal(isRouteChange(current, current), false);
  assert.equal(isRouteChange("https://other.example/auth", current), false);
  assert.equal(isRouteChange("mailto:hello@example.com", current), false);
  assert.equal(isRouteChange("/auth/signin", current), true);
  assert.equal(isRouteChange("?sort=old", current), true);
});
