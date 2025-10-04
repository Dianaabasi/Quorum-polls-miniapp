import { PollView } from "@/components/poll-view"
import { Header } from "@/components/header"

export default function PollPage({ params }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Poll Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <PollView pollId={params.id} />
      </section>
    </div>
  )
}
