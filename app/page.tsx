"use client"
import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { ChatWindow } from "@/ui/chat/chat-window"
import { AdminDashboard } from "@/ui/admin/dashboard"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

type AppMode = "loading" | "chat" | "admin" | "error"

interface SystemStatus {
  initialized: boolean
  loading: boolean
  error: string | null
  progress: number
  stage: string
  modules: string[]
  health: any
}

export default function ZacAIApp() {
  const [appMode, setAppMode] = useState<AppMode>("loading")
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    initialized: false,
    loading: true,
    error: null,
    progress: 0,
    stage: "Initializing...",
    modules: [],
    health: null,
  })
  const [initializationLog, setInitializationLog] = useState<string[]>([])
  const initializationRef = useRef(false)

  const addLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${message}`
    setInitializationLog((prev) => [...prev, logEntry])
    console.log(`🔧 ${logEntry}`)
  }

  const updateProgress = (progress: number, stage: string) => {
    setSystemStatus((prev) => ({ ...prev, progress, stage }))
  }

  const initializeSystem = async () => {
    if (initializationRef.current) return
    initializationRef.current = true

    try {
      addLogEntry("🚀 Starting ZacAI System Manager...")
      updateProgress(10, "Starting system initialization...")

      // Initialize core system
      addLogEntry("🔧 Initializing core systems...")
      updateProgress(25, "Loading core systems...")
      await systemManager.initialize()

      addLogEntry("✅ Core systems online")
      updateProgress(50, "Core systems ready")

      // Check system health
      addLogEntry("🔍 Running system health checks...")
      updateProgress(75, "Performing health checks...")
      const stats = systemManager.getSystemStats()

      setSystemStatus((prev) => ({
        ...prev,
        modules: stats.modules ? Object.keys(stats.modules) : [],
        health: stats,
      }))

      addLogEntry(`📦 Loaded ${Object.keys(stats.modules || {}).length} modules`)
      updateProgress(90, "Finalizing initialization...")

      // Final setup
      await new Promise((resolve) => setTimeout(resolve, 500))
      addLogEntry("🎉 ZacAI System fully operational!")
      updateProgress(100, "System ready")

      setSystemStatus((prev) => ({
        ...prev,
        initialized: true,
        loading: false,
        error: null,
      }))

      // Switch to chat mode after brief delay
      setTimeout(() => {
        setAppMode("chat")
      }, 1000)
    } catch (error) {
      console.error("❌ System initialization failed:", error)
      addLogEntry(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`)

      setSystemStatus((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "System initialization failed",
      }))

      setAppMode("error")
    }
  }

  useEffect(() => {
    initializeSystem()
  }, [])

  const handleRetryInitialization = () => {
    initializationRef.current = false
    setInitializationLog([])
    setSystemStatus({
      initialized: false,
      loading: true,
      error: null,
      progress: 0,
      stage: "Initializing...",
      modules: [],
      health: null,
    })
    setAppMode("loading")
    initializeSystem()
  }

  // Loading Screen
  if (appMode === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 glass-effect animate-fadeIn">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">ZacAI System v2.0.8</CardTitle>
            <p className="text-gray-600 text-lg">Initializing advanced AI assistant...</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{systemStatus.stage}</span>
                <span>{systemStatus.progress}%</span>
              </div>
              <Progress value={systemStatus.progress} className="h-3" />
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse px-4 py-2">
                <Loader2 className="w-4 h-4 mr-2" />
                {systemStatus.stage}
                <span className="loading-dots"></span>
              </Badge>
            </div>

            {/* Module Status */}
            {systemStatus.modules.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Loaded Modules:</h4>
                <div className="flex flex-wrap gap-2">
                  {systemStatus.modules.map((module) => (
                    <Badge key={module} variant="outline" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Initialization Log */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">System Log:</h4>
              <div className="h-32 w-full border rounded-lg p-3 bg-white/80 overflow-y-auto">
                <div className="space-y-1">
                  {initializationLog.map((entry, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono leading-relaxed animate-slideIn">
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error Screen
  if (appMode === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              {systemStatus.error || "The system encountered an error during initialization."}
            </p>

            {/* Error Log */}
            {initializationLog.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-700">Error Log:</h4>
                <div className="h-24 w-full border border-red-200 rounded p-2 bg-red-50 overflow-y-auto">
                  <div className="space-y-1">
                    {initializationLog.slice(-5).map((entry, index) => (
                      <div key={index} className="text-xs text-red-600 font-mono">
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleRetryInitialization} className="w-full bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Initialization
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Refresh Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Application
  return (
    <ErrorBoundary>
      {appMode === "admin" ? (
        <AdminDashboard onToggleChat={() => setAppMode("chat")} />
      ) : (
        <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
      )}
    </ErrorBoundary>
  )
}
