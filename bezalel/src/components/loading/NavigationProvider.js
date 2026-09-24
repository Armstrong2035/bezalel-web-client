"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createNavigationController, isRouteChange } from "./navigationController.mjs";
import NavigationOverlay from "./NavigationOverlay";

const NavigationContext = createContext(null);

export default function NavigationProvider({ children }) {
  const [controller] = useState(() => createNavigationController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [completedId, setCompletedId] = useState(null);
  const frame = useRef(null);
  const historyNavigation = useRef(null);
  const active = state.phase !== "idle";

  useEffect(() => {
    if (!pending && completedId !== null) controller.settle(completedId);
  }, [pending, completedId, controller]);

  const navigate = useCallback((href, options = {}) => {
    const { replace = false, label, ...routerOptions } = options;
    if (!isRouteChange(href, window.location.href)) {
      router[replace ? "replace" : "push"](href, routerOptions);
      return;
    }
    const id = controller.begin(label);
    cancelAnimationFrame(frame.current);
    // Paint the frosted overlay over the current page before starting navigation.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        startTransition(() => {
          router[replace ? "replace" : "push"](href, routerOptions);
          setCompletedId(id);
        });
      });
    });
  }, [controller, router]);

  const commitHistoryNavigation = useCallback(() => {
    if (historyNavigation.current !== null) {
      controller.settle(historyNavigation.current);
      historyNavigation.current = null;
    }
  }, [controller]);

  useEffect(() => {
    let previousUrl = window.location.href;
    const onPopState = () => {
      if (isRouteChange(window.location.href, previousUrl)) {
        historyNavigation.current = controller.begin();
      }
      previousUrl = window.location.href;
    };
    // Keep the comparison current after push/replace too, without patching browser APIs.
    const rememberUrl = () => { previousUrl = window.location.href; };
    const unsubscribe = controller.subscribe(rememberUrl);
    const onPageShow = (event) => { if (event.persisted) controller.cancel(); };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame.current);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [controller]);

  const value = useMemo(() => ({ navigate, controller }), [navigate, controller]);
  return (
    <NavigationContext.Provider value={value}>
      <Suspense fallback={null}><RouteCommitObserver onCommit={commitHistoryNavigation} /></Suspense>
      <div data-navigation-content="" inert={active ? true : undefined} aria-busy={active}>
        {children}
      </div>
      {active && <NavigationOverlay phase={state.phase} slow={state.slow} label={state.label} onDismiss={() => controller.cancel()} />}
    </NavigationContext.Provider>
  );
}

function RouteCommitObserver({ onCommit }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => { onCommit(); }, [pathname, searchParams, onCommit]);
  return null;
}

export function useNavigationLoading() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("Navigation loading requires NavigationProvider.");
  return context;
}

// Required initial page data holds the same overlay after the URL has changed.
// Use false for background refreshes and ordinary in-page button actions.
export function useRouteLoading(loading, label = "Getting your page ready") {
  const { controller } = useNavigationLoading();
  useLayoutEffect(() => {
    if (loading) return controller.hold(label);
  }, [controller, loading, label]);
}

export function useLoadingRouter() {
  const router = useRouter();
  const { navigate } = useNavigationLoading();
  return useMemo(() => ({
    ...router,
    push: (href, options) => navigate(href, options),
    replace: (href, options) => navigate(href, { ...options, replace: true }),
  }), [router, navigate]);
}
