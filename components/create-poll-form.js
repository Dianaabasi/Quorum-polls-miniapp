"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { useFarcasterUser } from "@/components/providers" 

const CATEGORIES = ["Crypto", "Tech", "Culture", "Gaming", "DeFi", "NFTs", "General"]

const TIME_LIMITS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
]

export function CreatePollForm() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { user: farcasterUser } = useFarcasterUser(); 
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    category: "General",
    timeLimit: 24,
    options: ["", ""],
  })

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ""] })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create a poll!")
      return
    }

    setLoading(true)

    try {
      const endTime = new Date()
      endTime.setHours(endTime.getHours() + formData.timeLimit)

      const creatorUsername = farcasterUser?.username || farcasterUser?.displayName || "anonymous"

      const pollData = {
        question: formData.question,
        category: formData.category,
        options: formData.options.filter((opt) => opt.trim()).map((text) => ({ text, votes: 0 })),
        createdAt: serverTimestamp(),
        endTime: endTime,
        totalVotes: 0,
        creatorAddress: address,
        creatorUsername: creatorUsername,
        voters: [],
      }

      const docRef = await addDoc(collection(db, "polls"), pollData)
      console.log("[v0] Poll created with ID:", docRef.id)

      router.push(`/poll/${docRef.id}`)
    } catch (error) {
      console.error("[v0] Error creating poll:", error)
      toast.error("Failed to create poll. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    formData.question.trim() && formData.options.filter((opt) => opt.trim()).length >= 2 && formData.options.length <= 6

  return (
    <Card className="p-6 md:p-8 bg-card border-border">
      {!isConnected && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">Please connect your wallet to create a poll</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-foreground">
            Poll Question
          </Label>
          <Textarea
            id="question"
            placeholder="What's your question for the community?"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground"
            maxLength={280}
            required
          />
          <p className="text-xs text-muted-foreground">{formData.question.length}/280 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-foreground">
            Category
          </Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeLimit" className="text-foreground">
            Time Limit
          </Label>
          <div className="flex flex-wrap gap-2">
            {TIME_LIMITS.map((time) => (
              <button
                key={time.hours}
                type="button"
                onClick={() => setFormData({ ...formData, timeLimit: time.hours })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.timeLimit === time.hours
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Poll Options (2-6)</Label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={100}
                  required
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
          </div>
          {formData.options.length < 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full border-border text-foreground hover:bg-card bg-transparent"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Option
            </Button>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={!isValid || loading || !isConnected}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="border-border text-foreground hover:bg-card"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
