"use client"

import { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { sdk } from "@farcaster/miniapp-sdk"
import { config } from "@/lib/wagmi-config"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

const queryClient = new QueryClient()

export function Providers({ children }) {
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        console.log("[v0] Farcaster SDK ready")
      } catch (error) {
        console.error("[v0] SDK initialization error:", error)
      }
    }

    initSDK()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          console.error("[v0] Firebase auth error:", error)
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
