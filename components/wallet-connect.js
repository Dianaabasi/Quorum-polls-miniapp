"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        const context = sdk.context
        if (context?.user) {
          setUser(context.user)
        }
        setIsReady(true)
      } catch (error) {
        console.error("[v0] SDK initialization error:", error)
        setIsReady(true)
      }
    }
    initSDK()
  }, [])

  useEffect(() => {
    if (isReady && !isConnected && connectors.length > 0) {
      const miniAppConnector = connectors[0]
      if (miniAppConnector) {
        connect({ connector: miniAppConnector })
      }
    }
  }, [isReady, isConnected, connectors, connect])

  if (!isReady) {
    return (
      <Button disabled className="bg-primary/50">
        Loading...
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button
        onClick={() => {
          const miniAppConnector = connectors[0]
          if (miniAppConnector) {
            connect({ connector: miniAppConnector })
          }
        }}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Connect Wallet
      </Button>
    )
  }

  const displayName = user?.displayName || user?.username || "User"
  const pfpUrl = user?.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <img
              src={pfpUrl || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
              }}
            />
          </div>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground font-normal">{shortAddress}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
