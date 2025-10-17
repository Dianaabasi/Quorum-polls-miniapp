"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { WagmiProvider, useAccount } from "wagmi";
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
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();

  useEffect(() => {
    const initFarcaster = async () => {
      setLoading(true);
      try {
        await sdk.actions.ready();
        const context = sdk.context;
        if (context?.user) {
          setUser(context.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("[v0] SDK initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initFarcaster();
  }, [isConnected]); // This dependency is key: it re-runs the effect when the wallet connects

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
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

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>
          {children}
        </FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
