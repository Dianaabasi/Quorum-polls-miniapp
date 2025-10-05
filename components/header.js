"use client"

import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center overflow-hidden">
              <Image
                src="/quorum-logo.ico"
                alt="Quorum Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">Quorum</h1>
              <p className="text-xs text-muted-foreground">Community Polls</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  )
}
