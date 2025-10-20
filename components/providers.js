"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { config } from "@/lib/wagmi-config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const queryClient = new QueryClient();

// Context definition (no changes needed here)
const FarcasterUserContext = createContext({ user: null, loading: true });
export const useFarcasterUser = () => useContext(FarcasterUserContext);

// Internal component managing Farcaster state
function FarcasterProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start loading, only the listener or explicit checks will set it to false
  const [loading, setLoading] = useState(true);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const { isConnected, isConnecting, status } = useAccount(); // Using status for more granular checks
  const { connect, connectors } = useConnect();

  // Callback function to update user state when Farcaster context changes
  const handleContextChange = useCallback((context) => {
    console.log("[v0 Provider] contextChanged event received:", context);
    // Use the provided name prioritization logic here
    const farcasterUser = context?.user || null;
    setUser(farcasterUser);
    setLoading(false); // << Mark loading as complete once context is processed
  }, []);

  // Effect 1: Initialize SDK and set up listener once on mount
  useEffect(() => {
    let isMounted = true;
    console.log("[v0 Provider] Initializing SDK and adding listener...");

    sdk.actions.ready()
      .then(() => {
        if (!isMounted) return;
        console.log("[v0 Provider] SDK Ready.");
        setIsSdkReady(true);

        // Add listener *after* SDK is ready
        sdk.addEventListener('contextChanged', handleContextChange);
        console.log("[v0 Provider] Added contextChanged listener.");

        // Immediately check context *after* listener is added
        const initialContext = sdk.context;
        console.log("[v0 Provider] Initial Context Check:", initialContext);
        if (initialContext?.user) {
          console.log("[v0 Provider] Setting initial user from context.");
          setUser(initialContext.user);
          setLoading(false); // Have user data immediately, stop loading
        } else {
          // If no initial user, keep loading true and wait for the event listener
           console.log("[v0 Provider] No initial user in context. Waiting for event or connection.");
        }
      })
      .catch(error => {
        console.error("[v0 Provider] SDK initialization error:", error);
         if (isMounted) {
            setIsSdkReady(false); // SDK failed
            setLoading(false); // Stop loading on error
         }
      });

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      sdk.removeEventListener('contextChanged', handleContextChange);
      console.log("[v0 Provider] Removed contextChanged listener.");
    };
  }, [handleContextChange]); // Dependency ensures stable callback is used

  // Effect 2: Handle auto-connection via Farcaster connector
  useEffect(() => {
    // Only attempt to connect if SDK is ready, not already connected/connecting,
    // and the Farcaster connector exists.
    if (isSdkReady && status === 'disconnected' && connectors.length > 0) {
      const miniAppConnector = connectors.find((c) => c.id === 'farcaster');
      if (miniAppConnector) {
        console.log("[v0 Provider] SDK ready & disconnected. Attempting auto-connect...");
        // Avoid reconnect loops if connect fails immediately - check connector readiness if needed
         if (!miniAppConnector.ready) {
             console.warn("[v0 Provider] Farcaster connector not ready.");
             // setLoading(false); // If connector isn't ready, maybe stop loading? Or wait?
             return;
         }
        connect({ connector: miniAppConnector }, {
          onError: (error) => console.error("[v0 Provider] Auto-connect error:", error),
          onSuccess: () => console.log("[v0 Provider] Auto-connect initiated (wagmi status change expected).")
        });
      } else {
         console.warn("[v0 Provider] Farcaster connector not found.");
         setLoading(false); // No connector means no Farcaster user this way.
      }
    } else if (status === 'connected' && loading && isSdkReady) {
       // If wagmi connected, SDK ready, but still loading - check context manually as fallback
        const currentContext = sdk.context;
        console.log("[v0 Provider] Wagmi connected, SDK ready, still loading. Re-checking context:", currentContext);
        if (currentContext?.user) {
             setUser(currentContext.user);
             setLoading(false);
        }
    } else if (status === 'disconnected' && user !== null) {
      // Clear user on explicit disconnect
      console.log("[v0 Provider] Wagmi disconnected, clearing user state.");
      setUser(null);
      setLoading(false); // No user, loading finished.
    }

  }, [isSdkReady, status, connect, connectors, loading, user]); // Re-run when these change

  // Effect 3: Firebase Auth (unchanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        signInAnonymously(auth).catch((error) => {
          console.error("[v0 Provider] Firebase auth error:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Debugging log
  useEffect(() => {
    console.log("[v0 Provider] State Update:", { user, loading, status, isSdkReady });
  }, [user, loading, status, isSdkReady]);

  return (
    <FarcasterUserContext.Provider value={{ user, loading }}>
      {children}
    </FarcasterUserContext.Provider>
  );
}

// Main Providers component wrapping everything (no changes needed here)
export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>{children}</FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
