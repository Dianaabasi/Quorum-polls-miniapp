import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PollsList } from "@/components/polls-list"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 text-balance">
            Voice Your Opinion on What Matters
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 text-pretty px-4">
            Create polls, gather votes, and discover what the community thinks about crypto, tech, and culture.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center px-4">
            <Link href="/create">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                Create Your Poll
              </Button>
            </Link>
            <a href="#active-polls" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent w-full"
              >
                Browse Polls
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mt-12 md:mt-16 px-4">
          <Card className="p-4 md:p-6 text-center bg-card border-border hover:border-primary/50 transition-colors">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">1,234</div>
            <div className="text-xs md:text-sm text-muted-foreground">Active Polls</div>
          </Card>
          <Card className="p-4 md:p-6 text-center bg-card border-border hover:border-secondary/50 transition-colors">
            <div className="text-2xl md:text-3xl font-bold text-secondary mb-1 md:mb-2">45.6K</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Votes</div>
          </Card>
          <Card className="p-4 md:p-6 text-center bg-card border-border hover:border-accent/50 transition-colors">
            <div className="text-2xl md:text-3xl font-bold text-accent mb-1 md:mb-2">8.9K</div>
            <div className="text-xs md:text-sm text-muted-foreground">Participants</div>
          </Card>
        </div>
      </section>

      {/* Active Polls */}
      <section id="active-polls" className="container mx-auto px-4 py-8 md:py-12 scroll-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">Active Polls</h3>
          <a href="#active-polls">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View All
            </Button>
          </a>
        </div>
        <PollsList />
      </section>
    </div>
  )
}
