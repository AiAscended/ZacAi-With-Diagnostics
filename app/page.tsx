"use client"

import { useState } from "react"
import EnhancedAIChat from "@/components/enhanced-ai-chat"

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <EnhancedAIChat />
    </main>
  )
}
