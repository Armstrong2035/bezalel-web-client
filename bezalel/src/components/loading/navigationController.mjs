// Framework-independent lifecycle: never reveal while a route or its data is pending.
export function createNavigationController({
  now = Date.now,
  schedule = setTimeout,
  unschedule = clearTimeout,
  minimumMs = 650,
  revealMs = 240,
  slowMs = 12000,
} = {}) {
  const idle = { phase: "idle", slow: false, label: "Opening your next page" };
  let state = idle;
  let generation = 0;
  let startedAt = 0;
  let routePending = false;
  let revealTimer;
  let slowTimer;
  const blockers = new Map();
  const listeners = new Set();
  const publish = (next) => { state = next; listeners.forEach(listener => listener()); };
  const clearReveal = () => { unschedule(revealTimer); revealTimer = undefined; };

  function activate(label) {
    clearReveal();
    if (state.phase !== "loading") {
      unschedule(slowTimer);
      startedAt = now();
      slowTimer = schedule(() => publish({ ...state, slow: true }), slowMs);
    }
    publish({ ...state, phase: "loading", label: label || state.label });
  }

  function maybeReveal() {
    clearReveal();
    if (routePending || blockers.size || state.phase === "idle") return;
    // A brief minimum makes even cached navigation feel intentional, without delaying requests.
    revealTimer = schedule(() => {
      if (routePending || blockers.size) return;
      unschedule(slowTimer);
      publish({ ...state, phase: "revealing" });
      revealTimer = schedule(() => publish(idle), revealMs);
    }, Math.max(0, minimumMs - (now() - startedAt)));
  }

  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => state,
    getServerSnapshot: () => idle,
    begin(label) {
      generation += 1;
      routePending = true;
      activate(label || "Opening your next page");
      return generation;
    },
    settle(id) {
      if (id !== generation) return;
      routePending = false;
      maybeReveal();
    },
    hold(label) {
      const token = Symbol();
      blockers.set(token, label);
      activate(label);
      return () => {
        if (!blockers.delete(token)) return;
        maybeReveal();
      };
    },
    cancel() {
      generation += 1;
      routePending = false;
      blockers.clear();
      clearReveal();
      unschedule(slowTimer);
      publish(idle);
    },
    destroy() {
      clearReveal();
      unschedule(slowTimer);
      listeners.clear();
    },
  };
}

export function isRouteChange(href, currentHref) {
  const current = new URL(currentHref);
  const destination = new URL(href, current);
  return destination.origin === current.origin &&
    (destination.pathname !== current.pathname || destination.search !== current.search);
}
