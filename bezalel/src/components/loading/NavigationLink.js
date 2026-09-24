"use client";

import Link from "next/link";
import { useNavigationLoading } from "@/app/hooks/useNavigationLoading";

// Keep Next's prefetching and native new-tab/hash behavior; only own the transition.
export default function NavigationLink({ href, onNavigate, replace, scroll, children, ...props }) {
  const { navigate } = useNavigationLoading();
  return (
    <Link {...props} href={href} replace={replace} scroll={scroll} onNavigate={(event) => {
      let cancelled = false;
      onNavigate?.({ preventDefault: () => { cancelled = true; } });
      event.preventDefault();
      if (!cancelled) navigate(href, { replace, scroll });
    }}>
      {children}
    </Link>
  );
}
