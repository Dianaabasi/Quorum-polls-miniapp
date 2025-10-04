import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"
import "./globals.css"
import { Suspense } from "react"

export const metadata = {
  title: "Quorum - Community Polls on Base",
  description: "Create and vote on polls in the Farcaster community on Base",
  generator: "v0.app",
  icons: {
    icon: "/quorum-logo.ico",
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://quorum-polls.vercel.app/og-image.png",
      button: {
        title: "Open Quorum Polls",
        action: {
          type: "launch_miniapp",
          url: "https://quorum-polls.vercel.app",
          name: "Quorum Polls",
          splashImageUrl: "https://quorum-polls.vercel.app/quorum-logo.png",
          splashBackgroundColor: "#000000",
        },
      },
    }),
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://quorum-polls.vercel.app/og-image.png",
      button: {
        title: "Open Quorum Polls",
        action: {
          type: "launch_frame",
          url: "https://quorum-polls.vercel.app",
          name: "Quorum Polls",
          splashImageUrl: "https://quorum-polls.vercel.app/quorum-logo.png",
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
