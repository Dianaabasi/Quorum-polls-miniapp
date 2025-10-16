"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useFarcasterUser } from "@/components/providers" 
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Vote, DollarSign, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { user, loading: userLoading } = useFarcasterUser(); 
  const [stats, setStats] = useState({
    votesCast: 0,
    usdEarned: 0,
    pollsCreated: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && !isConnected) { 
      router.push("/")
      return
    }

    const fetchStats = async () => {
      if (address) {
        try {
          const pollsQuery = query(collection(db, "polls"), where("creatorAddress", "==", address))
          const pollsSnapshot = await getDocs(pollsQuery)
          const pollsCreated = pollsSnapshot.size

          const votedPolls = Object.keys(localStorage).filter((key) => key.startsWith(`votedPolls_${address}`))
          const votesCast = votedPolls.length

          setStats({
            votesCast,
            usdEarned: 0, 
            pollsCreated,
          })
        } catch (error) {
          console.error("[v0] Error fetching stats:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (isConnected && address) {
        fetchStats()
    } else if (!userLoading) {
        setLoading(false);
    }
  }, [address, isConnected, router, userLoading]) 

  if (userLoading || !isConnected) {
    return null
  }

  const displayName = user?.displayName || user?.username || "User"
  const pfpUrl = user?.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 hover:bg-accent">
          Back
        </Button>

        <Card className="bg-card border-border p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 ring-4 ring-primary/20">
              <img src={pfpUrl || "/placeholder.svg"} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{displayName}</h1>
            <p className="text-sm text-primary font-mono">{shortAddress}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-center text-muted-foreground text-sm font-medium mb-6">Lifetime Totals</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{loading ? "..." : stats.votesCast}</span>
                </div>
                <p className="text-xs text-muted-foreground">Votes Cast</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stats.usdEarned.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">USD Earned</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-2xl font-bold text-foreground">{loading ? "..." : stats.pollsCreated}</span>
                </div>
                <p className="text-xs text-muted-foreground">Polls Created</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
