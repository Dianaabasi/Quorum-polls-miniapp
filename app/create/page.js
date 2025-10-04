"use client"

import { CreatePollForm } from "@/components/create-poll-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useAccount } from "wagmi"
import { Card } from "@/components/ui/card"

export default function CreatePollPage() {
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Header showCreateButton={false} />

      {/* Create Poll Form */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create a New Poll</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Ask the community what they think. Set a time limit and watch the votes roll in.
            </p>
          </div>

          {!isConnected ? (
            <Card className="p-8 md:p-12 bg-card border-border text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  You need to connect your wallet to create polls on Quorum. This ensures authenticity and prevents
                  spam.
                </p>
                <div className="pt-4">
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Go Back Home</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <CreatePollForm />
          )}

          <div className="mt-6 md:mt-8">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
