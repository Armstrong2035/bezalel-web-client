# Navigation loading

All app navigation shares a frosted full-screen overlay with the rolling Bezalel character. It blocks background pointer and keyboard interaction, moves focus into the overlay, and restores focus when the destination is revealed.

## Links and buttons

Use the shared link instead of importing `next/link` directly. It preserves prefetching, modified clicks, external links, and same-page anchors.

```jsx
import Link from "@/components/loading/NavigationLink";

<Link href="/documents">Your documents</Link>
```

For programmatic navigation, the shared router has the normal `push`, `replace`, `back`, `forward`, and `prefetch` interface. `push` and `replace` start the overlay before dispatching navigation. Back/forward transitions are observed through browser history.

```jsx
import { useLoadingRouter } from "@/app/hooks/useNavigationLoading";

const router = useLoadingRouter();
<button onClick={() => router.push("/documents")}>Open documents</button>
```

The lower-level hook supports a custom loading message:

```jsx
const { navigate } = useNavigationLoading();
navigate("/documents", { label: "Opening your documents" });
```

## Required page data

React's navigation transition covers loading the route and its client code. The root `app/loading.js` also holds the overlay during streamed route loading. Pages that fetch initial data on the client must explicitly hold it until they can render their content or error state:

```jsx
import { useRouteLoading } from "@/app/hooks/useNavigationLoading";

useRouteLoading(initialLoadPending, "Restoring your canvas");
```

Alternatively, render `<RouteLoading label="Restoring your canvas" />` as the page's initial loading branch. Unmounting this branch releases its hold. Documents, document detail, settings, and canvas authentication use this pattern. Background refreshes and in-page actions keep their local feedback.

## Timing and recovery

- The current page gets an overlay before navigation starts; requests then run normally behind it.
- The overlay remains visible for at least 650 ms. It fades out over 240 ms only after navigation and every required data hold have completed.
- The rolling animation is decorative, not a fabricated progress percentage.
- After 12 seconds, recovery controls let the user reload or dismiss a stalled overlay. Slow requests do not automatically reveal an unfinished page.
- Route errors clear the overlay so the error screen remains usable.
- Reduced-motion preferences disable the character, orbit, and progress animations.

The timing/state machine lives in `src/components/loading/navigationController.mjs`; the visual treatment lives in `navigation.module.css`. Regression coverage is in `tests/navigation-loading.test.mjs`.
