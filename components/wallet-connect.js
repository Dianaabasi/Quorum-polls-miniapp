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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
        console.log("[v0] Full context object:", JSON.stringify(context, null, 2))
        console.log("[v0] Context type:", typeof context)
        console.log("[v0] Context keys:", Object.keys(context || {}))

        // Try different ways to access user data
        if (context) {
          const userData = context.user
          console.log("[v0] User data:", userData)
          console.log("[v0] User type:", typeof userData)

          if (userData) {
            console.log("[v0] User keys:", Object.keys(userData))
            console.log("[v0] User fid:", userData.fid)
            console.log("[v0] User username:", userData.username)
            console.log("[v0] User displayName:", userData.displayName)
            console.log("[v0] User pfpUrl:", userData.pfpUrl)
            setUser(userData)
          }
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

  const displayName = user?.displayName || user?.username || user?.display_name || user?.name || "User"
  const pfpUrl = user?.pfpUrl || user?.pfp_url || user?.pfp || user?.profileImage || user?.avatar || null
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const avatarSeed = user?.fid || address
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => router.push("/profile")}
        variant="ghost"
        size="icon"
        className="rounded-full p-0 w-10 h-10"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={pfpUrl || fallbackAvatar} alt={displayName} />
          <AvatarFallback className="text-sm">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hidden sm:flex">
            <span>{displayName}</span>
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
    </div>
  )
}
