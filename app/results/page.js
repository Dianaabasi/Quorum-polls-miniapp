import { ResultsGallery } from "@/components/results-gallery"
import { Header } from "@/components/header"

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Results Gallery */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Poll Results</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse completed polls and see what the community decided.
          </p>
        </div>
        <ResultsGallery />
      </section>
    </div>
  )
}
