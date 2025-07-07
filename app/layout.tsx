import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZacAI - Advanced AI Assistant",
  description:
    "Next-generation, browser-first AI platform designed for maximum privacy, modularity, and extensibility.",
  keywords: ["AI", "Assistant", "ZacAI", "Artificial Intelligence", "Chat", "Browser AI"],
  authors: [{ name: "AiAscended" }],
  creator: "AiAscended",
  publisher: "ZacAI",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
