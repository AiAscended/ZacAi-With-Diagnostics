// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { CognitiveEngine } from "@/lib/cognitive-engine"
import AIControlPanel from "@/components/ai-control-panel"
import { Progress } from "@/components/ui/progress"
import { Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

        await new Promise((resolve) => setTimeout(resolve, 500))
        setProgress(60)

        await cognitiveEngine.initialize()

        setProgress(100)
        setInitializationMessage("Initialization complete!")

        await new Promise((resolve) => setTimeout(resolve, 500))
        setEngine(cognitiveEngine)
      } catch (error) {
        console.error("Failed to initialize AI Engine:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
        setInitializationMessage(`Error: ${errorMessage}. Check console for details.`)
        setProgress(100)
      }
    }
    initialize()
  }, [])

  if (!engine) {
    return (
      <main className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-secondary">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Brain className="h-8 w-8 text-primary" />
              ZacAI is Waking Up
            </CardTitle>
            <CardDescription>{initializationMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center p-2 sm:p-4 bg-secondary/40">
      <AIControlPanel engine={engine} />
    </main>
  )
}
