"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi"; // Added useDisconnect
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { config } from "@/lib/wagmi-config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const queryClient = new QueryClient();

const FarcasterUserContext = createContext({ user: null, loading: true });
export const useFarcasterUser = () => useContext(FarcasterUserContext);

function FarcasterProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks Farcaster context loading
  const { isConnected, isConnecting, isDisconnected } = useAccount(); // Added isConnecting, isDisconnected
  const { connect, connectors } = useConnect();
  // const { disconnect } = useDisconnect(); // Keep disconnect if needed elsewhere, but not used here for fetching

  // Callback to handle context changes from the SDK event
  const handleContextChange = useCallback((context) => {
    console.log("[v0] contextChanged event fired:", context); // Debug log
    setUser(context?.user || null);
    setLoading(false); // We got context info (or null), so loading is done
  }, []);

  // Effect 1: Initialize SDK and set up listener ONCE on mount
  useEffect(() => {
    let isMounted = true;
    console.log("[v0] Initializing SDK and adding listener...");
    sdk.actions.ready()
      .then(() => {
        if (!isMounted) return;
        console.log("[v0] SDK Ready.");
        // Check initial context right away
        const initialContext = sdk.context;
        console.log("[v0] Initial SDK Context:", initialContext);
        if (initialContext?.user) {
          setUser(initialContext.user);
        }
        // Always add listener
        sdk.addEventListener('contextChanged', handleContextChange);
        console.log("[v0] Added contextChanged listener.");
        // Initial loading state depends on whether we found a user right away
        setLoading(!initialContext?.user);
      })
      .catch(error => {
        console.error("[v0] SDK initialization error:", error);
        if (isMounted) setLoading(false); // Stop loading on error
      });

    // Cleanup listener on component unmount
    return () => {
      isMounted = false;
      sdk.removeEventListener('contextChanged', handleContextChange);
      console.log("[v0] Removed contextChanged listener.");
    };
  }, [handleContextChange]); // Only depends on the stable callback

  // Effect 2: Trigger Farcaster connection if needed, after SDK is potentially ready
  useEffect(() => {
    // Only try connecting if wagmi isn't already connected or trying to connect
    if (!isConnected && !isConnecting && connectors.length > 0) {
      const miniAppConnector = connectors.find((c) => c.id === 'farcaster');
      if (miniAppConnector) {
        console.log("[v0] Attempting Farcaster connect...");
        connect({ connector: miniAppConnector });
      } else {
        console.warn("[v0] Farcaster connector not found.");
         setLoading(false); // If connector isn't there, we can't get user data this way
      }
    } else if (isConnected) {
        // If already connected when this runs, explicitly check context again
        // This helps if context wasn't ready during initial check in Effect 1
        console.log("[v0] Already connected, checking context again");
        const currentContext = sdk.context;
        if(currentContext?.user && !user) { // Update only if needed
             setUser(currentContext.user);
        }
        // If connected, loading state should ideally be managed by listener or initial check
        // But let's ensure it's false if we have a user or are definitely connected
         if (loading && (currentContext?.user || isConnected)) {
            setLoading(false);
         }
    } else if (isDisconnected) {
        // Ensure user is null and loading is false if disconnected
        if (user !== null) setUser(null);
        if (loading) setLoading(false);
    }

  }, [isConnected, isConnecting, isDisconnected, connect, connectors, user, loading]); // Added user/loading


  // Effect 3: Firebase Auth (unchanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        signInAnonymously(auth).catch((error) => {
          console.error("[v0] Firebase auth error:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Debug log for context state
  useEffect(() => {
      console.log("[v0] Farcaster User Context State:", { user, loading });
  }, [user, loading]);

  return (
    <FarcasterUserContext.Provider value={{ user, loading }}>
      {children}
    </FarcasterUserContext.Provider>
  );
}

// Main Providers component remains the same
export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>{children}</FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
