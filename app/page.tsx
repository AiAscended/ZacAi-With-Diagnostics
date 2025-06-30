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

        // Simulate progress
        setTimeout(() => setProgress(60), 500)

        await cognitiveEngine.initialize()

        setProgress(100)
        setInitializationMessage("Initialization complete!")

        setTimeout(() => setEngine(cognitiveEngine), 500) // Short delay to show completion
      } catch (error) {
        console.error("Failed to initialize AI Engine:", error)
        setInitializationMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}. Check console.`)
        setProgress(100) // Show full progress bar on error to stop animation
      }
    }
    initialize()
  }, [])

  if (!engine) {
    return (
      <main className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-slate-900 text-white">
        <div className="w-full max-w-md text-center">
          <div className="inline-block p-4 bg-slate-800/50 rounded-full border border-slate-700 mb-6">
            <Brain className="h-12 w-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-200 to-cyan-400 text-transparent bg-clip-text">
            ZacAI is Waking Up
          </h1>
          <p className="text-slate-400 mb-6">{initializationMessage}</p>
          <Progress value={progress} className="w-full [&>div]:bg-cyan-400" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <AIControlPanel engine={engine} />
    </main>
  )
}
