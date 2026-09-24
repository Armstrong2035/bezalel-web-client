"use client";

import FirestoreInitializer from "./FirestoreInitializer";
import dynamic from "next/dynamic";

const QuickTour = dynamic(() => import("@/components/tour/QuickTour"), { ssr: false });
import { useAuth } from "./useAuth";

export default function AppProviders({ children }) {
  const { user, loading } = useAuth();

  return (
    <>
      {/* The Firestore initializer sits here, ensuring it always runs */}
      <FirestoreInitializer />
      {children}
      {!loading && user && <QuickTour />}
    </>
  );
}
