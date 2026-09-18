"use client";

import FirestoreInitializer from "./FirestoreInitializer";
import QuickTour from "@/components/tour/QuickTour";
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
