"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import RouteLoading from "@/components/loading/RouteLoading";

export default function AuthGuestGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/documents");
  }, [loading, user, router]);

  if (loading || user) return <RouteLoading label="Opening your workspace" />;
  return children;
}
