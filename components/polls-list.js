"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { PollCard } from "./poll-card"

export function PollsList({ filter = "active" }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        async function fetchPolls() {
          try {
            const pollsRef = collection(db, "polls")
            const now = new Date()

            let q
            if (filter === "active") {
              q = query(pollsRef, where("endTime", ">", now), orderBy("endTime", "desc"), limit(6))
            } else {
              q = query(pollsRef, where("endTime", "<=", now), orderBy("endTime", "desc"), limit(6))
            }

            const querySnapshot = await getDocs(q)
            const pollsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            setPolls(pollsData)
          } catch (error) {
            console.error("Error fetching polls:", error)
          } finally {
            setLoading(false)
          }
        }

        fetchPolls()
      } else {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [filter])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-card border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {filter === "active"
            ? "No active polls yet. Be the first to create one!"
            : "No ended polls yet. Check back later!"}
        </p>
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
