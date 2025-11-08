"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFarcasterUser } from "@/components/providers"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const { user, loading: userLoading } = useFarcasterUser()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(!userLoading)
  }, [userLoading])

  useEffect(() => {
    if (isReady && !isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] })
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
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Connect Wallet
      </Button>
    )
  }

  const displayName = user?.displayName || user?.username || "User"
  const pfpUrl = user?.pfpUrl
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
  const avatarSeed = user?.fid || address
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
  const imageUrl = pfpUrl || fallbackAvatar

  const handleImageError = (e) => {
    e.currentTarget.src = fallbackAvatar
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => router.push("/profile")}
        variant="ghost"
        size="icon"
        className="rounded-full p-0 w-10 h-10"
      >
        <div className="rounded-full overflow-hidden w-10 h-10">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
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
