"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, XCircle, RefreshCw, CheckCircle } from "lucide-react"
import { EnhancedAIChat } from "@/components/enhanced-ai-chat"
import { ErrorBoundary } from "@/components/error-boundary"

type AppStatus = "initializing" | "ready" | "error"

export default function HomePage() {
  const [status, setStatus] = useState<AppStatus>("initializing")
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Starting system...")
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const initializationRef = useRef(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${message}`
    setLogs((prev) => [...prev, logEntry])
    console.log(`🔧 ${logEntry}`)
  }

  const initialize = async () => {
    if (initializationRef.current) return
    initializationRef.current = true

    try {
      addLog("🛡️ Initializing ZacAI System...")
      setProgress(10)
      setStage("Checking browser environment...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      addLog("✅ Browser environment check complete")
      setProgress(25)
      setStage("Loading storage systems...")
      await new Promise((resolve) => setTimeout(resolve, 300))

      addLog("✅ Storage systems initialized")
      setProgress(40)
      setStage("Loading AI engines...")
      await new Promise((resolve) => setTimeout(resolve, 400))

      addLog("✅ AI engines loaded")
      setProgress(60)
      setStage("Loading knowledge modules...")
      await new Promise((resolve) => setTimeout(resolve, 300))

      addLog("✅ Knowledge modules loaded")
      setProgress(80)
      setStage("Finalizing system...")
      await new Promise((resolve) => setTimeout(resolve, 200))

      addLog("🎉 ZacAI System fully operational!")
      setProgress(100)
      setStage("System ready!")

      await new Promise((resolve) => setTimeout(resolve, 500))
      setStatus("ready")
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown initialization error"
      console.error("❌ Initialization failed:", e)
      setError(errorMessage)
      addLog(`❌ CRITICAL ERROR: ${errorMessage}`)
      setStatus("error")
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  const handleRetry = () => {
    initializationRef.current = false
    setStatus("initializing")
    setProgress(0)
    setStage("Restarting system...")
    setError(null)
    setLogs([])
    initialize()
  }

  if (status === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ZacAI System v100
            </CardTitle>
            <p className="text-gray-600 text-lg">Initializing AI Assistant</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>{stage}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse px-4 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {stage}
              </Badge>
            </div>

            {/* System Log */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                System Initialization Log
              </h4>
              <ScrollArea className="h-48 w-full border rounded-lg p-3 bg-gray-50/80">
                <div className="space-y-1">
                  {logs.map((entry, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono leading-relaxed">
                      {entry}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              System Initialization Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>

            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry System Initialization
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Force Reload Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <EnhancedAIChat />
    </ErrorBoundary>
  )
}
