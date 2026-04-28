"use client";

import { ReactNode, useState, useEffect } from "react";

/**
 * Client-only wrapper for next-auth SessionProvider.
 * Uses dynamic import to avoid React 19 compatibility issues with next-auth v4,
 * which internally uses require('react') that returns null during SSR/bundle.
 *
 * IMPORTANT: Children are NOT rendered until SessionProvider is loaded,
 * because useSession() will crash without the provider context.
 */
export default function NextAuthProvider({ children }: { children: ReactNode }) {
  const [SessionProvider, setSessionProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("next-auth/react").then((mod) => {
      setSessionProvider(() => mod.SessionProvider);
      setReady(true);
    });
  }, []);

  if (!SessionProvider || !ready) {
    return null;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
