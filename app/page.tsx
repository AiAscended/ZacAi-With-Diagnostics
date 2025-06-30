// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { CognitiveEngine } from "@/lib/cognitive-engine"
import AIControlPanel from "@/components/ai-control-panel"
import { Progress } from "@/components/ui/progress"
import { Brain } from "lucide-react"

export default function Home() {
  const [engine, setEngine] = useState<CognitiveEngine | null>(null)
  const [initializationMessage, setInitializationMessage] = useState("Initializing Cognitive Engine...")
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    const initialize = async () => {
      try {
        const cognitiveEngine = new CognitiveEngine()

        setProgress(30)
        setInitializationMessage("Loading knowledge modules...")

        // Simulate progress for better UX
        setTimeout(() => setProgress(60), 500)

        await cognitiveEngine.initialize()

        setProgress(100)
        setInitializationMessage("Initialization complete!")

        setTimeout(() => setEngine(cognitiveEngine), 500) // Short delay to show completion
      } catch (error) {
        console.error("Failed to initialize AI Engine:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
        setInitializationMessage(`Error: ${errorMessage}. Check console for details.`)
        setProgress(100) // Show full progress bar on error to stop animation
      }
    }
    initialize()
  }, [])

  if (!engine) {
    return (
      <main className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-md text-center">
          <div className="inline-block p-4 bg-secondary rounded-full border border-border mb-6">
            <Brain className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">ZacAI is Waking Up</h1>
          <p className="text-muted-foreground mb-6">{initializationMessage}</p>
          <Progress value={progress} className="w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center p-2 sm:p-4 bg-secondary/40">
      <AIControlPanel engine={engine} />
    </main>
  )
}
