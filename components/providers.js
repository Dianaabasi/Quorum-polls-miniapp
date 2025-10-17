"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { config } from "@/lib/wagmi-config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const queryClient = new QueryClient();

// 1. Create the context to hold Farcaster user data
const FarcasterUserContext = createContext({ user: null, loading: true });

// 2. Create a custom hook for easy access to the context
export const useFarcasterUser = () => useContext(FarcasterUserContext);

// 3. A new component to manage Farcaster-specific state
function FarcasterProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Effect to auto-connect the wallet using the Farcaster connector
  useEffect(() => {
    const miniAppConnector = connectors.find((c) => c.id === 'farcaster');
    if (miniAppConnector && !isConnected) {
      connect({ connector: miniAppConnector });
    }
  }, [connect, connectors, isConnected]);

  // Effect to fetch Farcaster user data whenever the connection status changes
  useEffect(() => {
    const getFarcasterUser = async () => {
      if (isConnected) {
        setLoading(true);
        try {
          // Wait for the SDK to be ready
          await sdk.actions.ready();
          const context = sdk.context;
          if (context?.user) {
            setUser(context.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching Farcaster user:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // If disconnected, ensure user is null
        setUser(null);
        setLoading(false);
      }
    };

    getFarcasterUser();
  }, [isConnected]); // This dependency ensures the logic re-runs on connect/disconnect

  // Effect for anonymous Firebase sign-in (no changes here)
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
    <FarcasterUserContext.Provider value={{ user, loading }}>
      {children}
    </FarcasterUserContext.Provider>
  );
}

// 4. Main Providers component now wraps children with the FarcasterProvider
export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>{children}</FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
