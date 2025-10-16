"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { sdk } from "@farcaster/miniapp-sdk"
import { config } from "@/lib/wagmi-config"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

const queryClient = new QueryClient()

const FarcasterUserContext = createContext({ user: null, loading: true });

export const useFarcasterUser = () => useContext(FarcasterUserContext);

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        const { user } = sdk.context;
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error("[v0] SDK initialization error:", error);
      } finally {
        setLoading(false);
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          signInAnonymously(auth).catch((error) => {
            console.error("[v0] Firebase auth error:", error);
          });
        }
      });
      return () => unsubscribe();
    };

    init();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterUserContext.Provider value={{ user, loading }}>
            {children}
        </FarcasterUserContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
