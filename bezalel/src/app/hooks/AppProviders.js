"use client";

import FirestoreInitializer from "./FirestoreInitializer";

export default function AppProviders({ children }) {
  return (
    <>
      {/* The Firestore initializer sits here, ensuring it always runs */}
      <FirestoreInitializer />
      {children}
    </>
  );
}
