"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PollCard } from "./poll-card"

export function ResultsGallery() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompletedPolls() {
      try {
        const pollsRef = collection(db, "polls")
        const q = query(pollsRef, where("endTime", "<=", new Date()), orderBy("endTime", "desc"), limit(12))
        const querySnapshot = await getDocs(q)
        const pollsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPolls(pollsData)
      } catch (error) {
        console.error("[v0] Error fetching completed polls:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedPolls()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-card border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No completed polls yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  )
}
