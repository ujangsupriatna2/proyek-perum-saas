"use client";

import { ReactNode, useState, useEffect } from "react";

/**
 * Client-only wrapper for next-auth SessionProvider.
 * Uses dynamic import to avoid React 19 compatibility issues with next-auth v4,
 * which internally uses require('react') that returns null during SSR/bundle.
 */
export default function NextAuthProvider({ children }: { children: ReactNode }) {
  const [SessionProvider, setSessionProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    // Dynamic import next-auth/react only on the client
    import("next-auth/react").then((mod) => {
      setSessionProvider(() => mod.SessionProvider);
    });
  }, []);

  // Render children immediately, wrap with provider once loaded
  if (!SessionProvider) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
