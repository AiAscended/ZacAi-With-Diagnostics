// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { CognitiveEngine } from "@/lib/cognitive-engine"
import AIControlPanel from "@/components/ai-control-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain } from "lucide-react"

export default function Home() {
  const [engine, setEngine] = useState<CognitiveEngine | null>(null)
  const [initializationMessage, setInitializationMessage] = useState("Initializing Cognitive Engine...")

  useEffect(() => {
    const initialize = async () => {
      try {
        const cognitiveEngine = new CognitiveEngine()
        setInitializationMessage("Loading knowledge modules...")
        await cognitiveEngine.initialize()
        setEngine(cognitiveEngine)
      } catch (error) {
        console.error("Failed to initialize AI Engine:", error)
        setInitializationMessage("Error during initialization. Check console.")
      }
    }
    initialize()
  }, [])

  if (!engine) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 animate-pulse text-primary" />
              ZacAI is Waking Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">{initializationMessage}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <AIControlPanel engine={engine} />
    </main>
  )
}
