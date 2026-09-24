"use client";

import { useEffect } from "react";
import { useNavigationLoading } from "@/app/hooks/useNavigationLoading";

export default function ErrorPage({ reset }) {
  const { controller } = useNavigationLoading();
  useEffect(() => { controller.cancel(); }, [controller]);
  return (
    <main role="alert" style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
      <h1>This page could not load</h1>
      <p style={{ margin: "16px 0" }}>Please try again. If this keeps happening, reload the page.</p>
      <button onClick={reset} style={{ padding: "10px 16px" }}>Try again</button>
      <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", marginLeft: 12 }}>Reload page</button>
    </main>
  );
}
