"use client"

import { PollView } from "@/components/poll-view"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PollPage({ params }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Poll Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 hover:bg-accent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <PollView pollId={params.id} />
      </section>
    </div>
  )
}
