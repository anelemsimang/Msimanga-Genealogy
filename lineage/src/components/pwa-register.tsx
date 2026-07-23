"use client";

import { useEffect } from "react";

/** Registers the service worker so browsers can offer “Install app” / Add to Home Screen. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    // Only register on HTTPS or localhost (required by browsers).
    const ok =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!ok) return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent — installability is progressive enhancement.
    });
  }, []);

  return null;
}
