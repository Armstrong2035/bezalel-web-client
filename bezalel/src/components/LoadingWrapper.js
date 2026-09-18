// components/LoadingWrapper.js
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Backdrop } from "@mui/material";
import CustomSpinner from "./loading/LoadingPage";

export default function LoadingWrapper({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const fallbackTimer = useRef(null);

  useEffect(() => {
    const stopLoading = () => {
      setIsLoading(false);
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    };

    // Listen for route changes by intercepting Link clicks
    const handleClick = (e) => {
      const target = e.target.closest("a");
      if (target && target.href && target.href !== window.location.href) {
        setIsLoading(true);
        if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        // A failed or interrupted client navigation must not leave the app blocked.
        fallbackTimer.current = setTimeout(stopLoading, 1500);
      }
    };

    // Add click listener to document
    document.addEventListener("click", handleClick, true);

    // A changed pathname means navigation completed.
    stopLoading();

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [pathname]); // Re-run when pathname changes

  return (
    <>
      {children}
      {isLoading && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
          open={isLoading}
        >
          <CustomSpinner />
        </Backdrop>
      )}
    </>
  );
}
