"use client"
import { useEffect, useState, createContext, useContext } from "react"
import { WagmiProvider, useAccount, useConnect } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { sdk } from "@farcaster/miniapp-sdk"
import { config } from "@/lib/wagmi-config"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

const queryClient = new QueryClient()
const FarcasterUserContext = createContext()

export const useFarcasterUser = () => {
  const context = useContext(FarcasterUserContext)
  return context || { user: null, loading: true }
}

function FarcasterProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { status } = useAccount()
  const { connect, connectors } = useConnect()

  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        const context = sdk.context
        if (context?.user) {
          setUser(context.user)
        }
        setLoading(false)
      } catch (error) {
        console.error("SDK init error:", error)
        setLoading(false)
      }
    }
    initSDK()
  }, [])

  useEffect(() => {
    if (status === "disconnected" && !loading && connectors.length > 0) {
      const connector = connectors.find((c) => c.id === "farcaster")
      if (connector?.ready) {
        connect({ connector })
      }
    }
  }, [status, loading, connectors, connect])

  useEffect(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        signInAnonymously(auth).catch(console.error)
      }
    })
  }, [])

  return <FarcasterUserContext.Provider value={{ user, loading }}>{children}</FarcasterUserContext.Provider>
}

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>{children}</FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
