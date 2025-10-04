"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PollCard({ poll }) {
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0
  const timeLeft = getTimeLeft(poll.endTime)

  return (
    <Link href={`/poll/${poll.id}`}>
      <Card className="p-6 bg-card border-border hover:border-primary transition-colors cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="secondary" className="bg-secondary/20 text-secondary border-0">
            {poll.category || "General"}
          </Badge>
          <div className="text-xs text-muted-foreground">{timeLeft}</div>
        </div>

        <h4 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 text-balance">{poll.question}</h4>

        <div className="space-y-2 mb-4 flex-1">
          {poll.options?.slice(0, 3).map((option, idx) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            return (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground truncate">{option.text}</span>
                  <span className="text-muted-foreground ml-2">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <span>{totalVotes} votes</span>
          <span>by @{poll.creatorUsername || "anonymous"}</span>
        </div>
      </Card>
    </Link>
  )
}

function getTimeLeft(endTime) {
  const now = new Date()
  const end = endTime?.toDate ? endTime.toDate() : new Date(endTime)
  const diff = end - now

  if (diff <= 0) return "Ended"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d left`
  if (hours > 0) return `${hours}h left`
  return "Ending soon"
}
