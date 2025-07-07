"use client"

import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { OptimizedLoader } from "@/core/system/optimized-loader"
import { SafeModeSystem } from "@/core/system/safe-mode"
import { EnhancedAIChat } from "@/components/enhanced-ai-chat"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, XCircle, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

type AppStatus = "initializing" | "ready" | "error"

export default function HomePage() {
  const [status, setStatus] = useState<AppStatus>("initializing")
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Starting system...")
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [loader, setLoader] = useState<OptimizedLoader | null>(null)
  const [safeMode, setSafeMode] = useState<SafeModeSystem | null>(null)
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
      addLog("🛡️ Initializing Safe Mode System...")
      const safeModeInstance = new SafeModeSystem()
      await safeModeInstance.initialize()
      setSafeMode(safeModeInstance)

      const health = safeModeInstance.getSystemHealth()
      addLog(`✅ Health check complete. Status: ${health.overall}`)

      if (health.overall === "critical") {
        safeModeInstance.enterSafeMode()
        addLog("🚨 Critical issues detected. Entering safe mode...")
      }

      addLog("📦 Initializing Optimized Loader...")
      const loaderInstance = new OptimizedLoader()
      setLoader(loaderInstance)

      addLog("🚀 Starting module loading sequence...")
      await loaderInstance.load((p, s) => {
        setProgress(p)
        setStage(s)
        addLog(`[${Math.round(p)}%] ${s}`)
      })

      const summary = loaderInstance.getLoadingSummary()
      addLog(`📊 Loading complete: ${summary.loaded}/${summary.total} modules loaded`)

      if (summary.failed > 0) {
        addLog(`⚠️ ${summary.failed} modules failed, ${summary.bypassed} bypassed`)
      }

      addLog("🧠 Initializing System Manager...")
      await systemManager.initialize(loaderInstance)

      addLog("🎉 ZacAI System fully operational!")
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
    setLoader(null)
    setSafeMode(null)
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
              ZacAI System v2.0.8
            </CardTitle>
            <p className="text-gray-600 text-lg">Production-grade initialization sequence</p>
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

            {/* Loading Stats */}
            {loader && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-800">Loaded Modules</div>
                  <div className="text-2xl font-bold text-green-600">{loader.getLoadingSummary().loaded}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800">Total Modules</div>
                  <div className="text-2xl font-bold text-blue-600">{loader.getLoadingSummary().total}</div>
                </div>
              </div>
            )}
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
              Critical System Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">System Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>

            {/* Error Log */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-red-700">Error Log:</h4>
              <ScrollArea className="h-32 w-full border border-red-200 rounded-lg p-3 bg-red-50/50">
                <div className="space-y-1">
                  {logs.slice(-10).map((entry, index) => (
                    <div key={index} className="text-xs text-red-700 font-mono">
                      {entry}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Module Status */}
            {loader && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-700">Module Status:</h4>
                <div className="space-y-2">
                  {loader.getFailedModules().map((module) => (
                    <div key={module.name} className="flex items-center justify-between p-2 bg-red-100 rounded">
                      <span className="text-sm font-medium">{module.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={module.essential ? "destructive" : "secondary"}>
                          {module.essential ? "Critical" : "Optional"}
                        </Badge>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
      <EnhancedAIChat loader={loader!} safeMode={safeMode!} />
    </ErrorBoundary>
  )
}
