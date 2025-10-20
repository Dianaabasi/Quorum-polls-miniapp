"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react"; // Added useCallback
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { config } from "@/lib/wagmi-config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const queryClient = new QueryClient();

// Context remains the same
const FarcasterUserContext = createContext({ user: null, loading: true });
export const useFarcasterUser = () => useContext(FarcasterUserContext);

// FarcasterProvider now uses event listener
function FarcasterProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected, isConnecting } = useAccount(); // Added isConnecting
  const { connect, connectors } = useConnect();

  // Memoize the handler function
  const handleContextChange = useCallback((context) => {
    console.log("Farcaster context changed:", context); // Debug log
    setUser(context?.user || null);
    // Consider loading false once context is received, even if user is null
    setLoading(false);
  }, []);

  useEffect(() => {
    const initAndListen = async () => {
      setLoading(true);
      try {
        // Initialize SDK first
        await sdk.actions.ready();
        console.log("[v0] SDK Ready"); // Debug log

        // Initial context check
        const initialContext = sdk.context;
        console.log("[v0] Initial SDK Context:", initialContext); // Debug log
        if (initialContext?.user) {
          setUser(initialContext.user);
        }

        // Add the event listener for future updates
        sdk.addEventListener('contextChanged', handleContextChange);
        console.log("[v0] Added contextChanged listener"); // Debug log

      } catch (error) {
        console.error("[v0] SDK initialization/listener error:", error);
      } finally {
         // Set loading false after initial setup attempt,
         // handleContextChange will manage it later if context arrives
         setLoading(false);
      }
    };

    initAndListen();

    // Cleanup listener on unmount
    return () => {
      sdk.removeEventListener('contextChanged', handleContextChange);
      console.log("[v0] Removed contextChanged listener"); // Debug log
    };
  }, [handleContextChange]); // Rerun if handler changes (it won't due to useCallback)


  // Effect for auto-connecting wallet (separated concern)
  useEffect(() => {
    // Only attempt auto-connect if not already connected or connecting
    if (!isConnected && !isConnecting && connectors.length > 0) {
      const miniAppConnector = connectors.find((c) => c.id === 'farcaster');
      if (miniAppConnector) {
        console.log("[v0] Attempting auto-connect with Farcaster connector"); // Debug log
        connect({ connector: miniAppConnector });
      }
    }
  }, [connect, connectors, isConnected, isConnecting]); // Added isConnecting dependency


  // Effect for Firebase anonymous sign-in (separated concern)
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

  return (
    // Provide the user state and loading status
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
