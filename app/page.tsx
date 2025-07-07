"use client"

import { useState, useEffect, useMemo } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnhancedAIChat } from "@/components/enhanced-ai-chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, XCircle, RefreshCw } from "lucide-react"
import { SafeModeSystem } from "@/core/system/safe-mode"
import { OptimizedLoader } from "@/core/system/optimized-loader"
import { systemManager } from "@/core/system/manager"

type AppStatus = "initializing" | "ready" | "error"

export default function HomePage() {
  const [status, setStatus] = useState<AppStatus>("initializing")
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Booting up...")
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const safeMode = useMemo(() => new SafeModeSystem(), [])
  const loader = useMemo(() => new OptimizedLoader(), [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `${timestamp}: ${message}`])
  }

  const initialize = async () => {
    try {
      addLog("🛡️ Initializing Safe Mode & Health Monitor...")
      await safeMode.initialize()
      addLog(`✅ Health check complete. Overall status: ${safeMode.getSystemHealth()?.overall}`)

      if (safeMode.getConfiguration().fallbackMode) {
        throw new Error("Critical system checks failed. Entering fallback mode.")
      }

      addLog("📦 Registering modules with Optimized Loader...")
      systemManager.registerModules(loader)

      addLog("🚀 Starting Optimized Loader...")
      await loader.load((p, s) => {
        setProgress(p)
        setStage(s)
        addLog(`[${Math.round(p)}%] ${s}`)
      })

      addLog("🧠 Initializing System Manager with loaded modules...")
      systemManager.initialize(loader)

      addLog("🎉 System ready!")
      setStatus("ready")
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred."
      console.error("Initialization failed:", e)
      setError(errorMessage)
      addLog(`❌ CRITICAL ERROR: ${errorMessage}`)
      setStatus("error")
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  if (status === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ZacAI System Boot
            </CardTitle>
            <p className="text-gray-600">Robust & resilient initialization sequence...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>{stage}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <ScrollArea className="h-40 w-full rounded-md border bg-gray-50/50 p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{logs.join("\n")}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              Critical System Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600 font-medium">The application could not start due to a critical error.</p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">{error}</div>
            <ScrollArea className="h-40 w-full rounded-md border bg-gray-50/50 p-3">
              <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">{logs.join("\n")}</pre>
            </ScrollArea>
            <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Attempt to Reload
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <EnhancedAIChat loader={loader} safeMode={safeMode} />
    </ErrorBoundary>
  )
}
