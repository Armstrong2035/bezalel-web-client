// components/LoadingWrapper.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Backdrop } from "@mui/material";
import CustomSpinner from "./loading/LoadingPage";

export default function LoadingWrapper({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle route change start
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    // Handle route change complete
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    // Listen for route changes by intercepting Link clicks
    const handleClick = (e) => {
      const target = e.target.closest("a");
      if (target && target.href && target.href !== window.location.href) {
        setIsLoading(true);
      }
    };

    // Add click listener to document
    document.addEventListener("click", handleClick, true);

    // Hide loading when pathname changes (navigation complete)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimeout(timer);
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
