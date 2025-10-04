"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"  // Add this import
import { PollCard } from "./poll-card"

export function PollsList() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {  // Auth ready (anonymous or otherwise)
        async function fetchPolls() {
          try {
            const pollsRef = collection(db, "polls")
            const q = query(pollsRef, where("endTime", ">", new Date()), orderBy("endTime", "desc"), limit(6))
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
        setLoading(false)  // Or handle unauth state
      }
    })

    return unsubscribe  // Cleanup listener
  }, [])

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
        <p className="text-muted-foreground">No active polls yet. Be the first to create one!</p>
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
