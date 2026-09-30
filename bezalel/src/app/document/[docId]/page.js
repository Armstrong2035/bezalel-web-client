"use client";

import { use } from "react";
import DocumentWorkspace from "@/components/document/DocumentWorkspace";

export default function DocumentPage({ params }) {
  const { docId } = use(params);
  return <DocumentWorkspace docId={docId} />;
}
