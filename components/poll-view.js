"use client"

import { useEffect, useState } from "react"
import { doc, updateDoc, increment, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PollResults } from "@/components/poll-results"
import { useAccount } from "wagmi"
import { toast } from "sonner"

export function PollView({ pollId }) {
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (address) {
      const votedPolls = JSON.parse(localStorage.getItem(`votedPolls_${address}`) || "{}")
      if (votedPolls[pollId]) {
        setHasVoted(true)
        setSelectedOption(votedPolls[pollId])
      }
    }

    const pollRef = doc(db, "polls", pollId)
    const unsubscribe = onSnapshot(
      pollRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPoll({ id: docSnap.id, ...docSnap.data() })
        } else {
          console.error("[v0] Poll not found")
        }
        setLoading(false)
      },
      (error) => {
        console.error("[v0] Error fetching poll:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [pollId, address])

  const handleVote = async (optionIndex) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to vote!")
      return
    }

    if (hasVoted || voting) return

    setVoting(true)
    try {
      const pollRef = doc(db, "polls", pollId)

      const updatedOptions = [...poll.options]
      updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1

      await updateDoc(pollRef, {
        options: updatedOptions,
        totalVotes: increment(1),
      })

      const votedPolls = JSON.parse(localStorage.getItem(`votedPolls_${address}`) || "{}")
      votedPolls[pollId] = optionIndex
      localStorage.setItem(`votedPolls_${address}`, JSON.stringify(votedPolls))

      setHasVoted(true)
      setSelectedOption(optionIndex)
    } catch (error) {
      console.error("[v0] Error voting:", error)
      toast.error("Failed to submit vote. Please try again.")
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 bg-card border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="space-y-3 pt-6">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <Card className="p-12 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Poll Not Found</h2>
          <p className="text-muted-foreground">This poll may have been deleted or doesn't exist.</p>
        </Card>
      </div>
    )
  }

  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0
  const endTime = poll.endTime?.toDate ? poll.endTime.toDate() : new Date(poll.endTime)
  const isEnded = endTime < new Date()
  const timeLeft = getTimeLeft(endTime)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6 md:p-8 bg-card border-border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-secondary/20 text-secondary border-0">
              {poll.category || "General"}
            </Badge>
            {isEnded && (
              <Badge variant="outline" className="border-destructive text-destructive">
                Ended
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{timeLeft}</div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">{poll.question}</h2>

        {!hasVoted && !isEnded ? (
          <div className="space-y-3">
            {poll.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleVote(index)}
                disabled={voting}
                className="w-full p-4 rounded-lg border-2 border-border bg-background hover:border-primary hover:bg-card transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-foreground font-medium">{option.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <PollResults poll={poll} selectedOption={selectedOption} />
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalVotes} votes
            </span>
            <span>by @{poll.creatorUsername || "anonymous"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success("Link copied to clipboard!")
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </Button>
        </div>
      </Card>

      {hasVoted && !isEnded && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <p className="text-sm text-foreground text-center">
            Thanks for voting! Results update in real-time as more people vote.
          </p>
        </Card>
      )}
    </div>
  )
}

function getTimeLeft(endTime) {
  const now = new Date()
  const diff = endTime - now

  if (diff <= 0) return "Poll ended"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}
