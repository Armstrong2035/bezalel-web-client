"use client";

import { useRouteLoading } from "@/app/hooks/useNavigationLoading";

export default function RouteLoading({ label = "Getting your page ready" }) {
  useRouteLoading(true, label);
  return <span className="sr-only" role="status">{label}</span>;
}
