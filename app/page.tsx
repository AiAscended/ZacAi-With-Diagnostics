// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import AiDiagnosticPanel from "@/components/ai-diagnostic-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain } from "lucide-react"

export default function Home() {
  const [aiSystem, setAiSystem] = useState<CognitiveAISystem | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        const system = new CognitiveAISystem()
        await system.initialize()
        setAiSystem(system)
      } catch (error) {
        console.error("Failed to initialize AI System:", error)
      } finally {
        setIsInitializing(false)
      }
    }
    initialize()
  }, [])

  if (isInitializing || !aiSystem) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 animate-pulse" />
              Initializing ZacAI...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground">Loading cognitive models and knowledge base...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl h-[85vh]">
        <AiDiagnosticPanel aiSystem={aiSystem} />
      </div>
    </main>
  )
}
