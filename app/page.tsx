"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Zap, Activity } from "lucide-react"
import { optimizedSystemManager } from "@/core/system/optimized-manager"
import { performanceMonitor } from "@/core/performance/monitor"
import AdminDashboardV2 from "@/components/admin-dashboard-v2"
import EnhancedAIChat from "@/components/enhanced-ai-chat"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  processingTime?: number
}

type LoadingStage = "initializing" | "critical" | "high-priority" | "background" | "ready" | "error"
type AppMode = "chat" | "admin"

export default function Home() {
  // Core state
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [systemReady, setSystemReady] = useState(false)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [showPerformance, setShowPerformance] = useState(false)

  useEffect(() => {
    initializeOptimizedSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    setLoadingProgress((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${step}`])
  }

  const initializeOptimizedSystem = async () => {
    try {
      addLoadingStep("🚀 Starting Optimized ZacAI System...")
      setLoadingStage("initializing")

      // Start performance monitoring
      performanceMonitor.startTimer("app-initialization")

      addLoadingStep("⚡ Loading critical systems...")
      setLoadingStage("critical")

      // Initialize optimized system manager
      await optimizedSystemManager.initialize()

      addLoadingStep("📦 High priority modules loaded")
      setLoadingStage("high-priority")

      addLoadingStep("🔄 Background loading started")
      setLoadingStage("background")

      // Small delay to show background loading
      await new Promise((resolve) => setTimeout(resolve, 500))

      addLoadingStep("✅ System ready - Optimized for performance!")
      setLoadingStage("ready")
      setSystemReady(true)

      const totalTime = performanceMonitor.endTimer("app-initialization")
      addLoadingStep(`⏱️ Total initialization: ${totalTime.toFixed(2)}ms`)

      // Update performance data
      setPerformanceData(performanceMonitor.getMetrics())
    } catch (error) {
      console.error("❌ Optimized system initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  const getStatusIcon = () => {
    switch (loadingStage) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (loadingStage) {
      case "ready":
        return "default"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case "critical":
        return "Loading essential systems..."
      case "high-priority":
        return "Loading core modules..."
      case "background":
        return "Optimizing performance..."
      case "ready":
        return "System optimized and ready!"
      case "error":
        return "System error detected"
      default:
        return "Initializing..."
    }
  }

  // Enhanced loading screen with performance metrics
  if (!systemReady && loadingStage !== "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">ZacAI Optimized</div>
                <div className="text-sm text-gray-500">Performance-first initialization</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant={getStatusColor()}>{loadingStage}</Badge>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-lg font-medium text-gray-700 mb-2">{getLoadingMessage()}</div>
              {performanceData && (
                <div className="text-sm text-gray-500">
                  Memory: {performanceData.memoryUsage.used}MB | Modules:{" "}
                  {Object.keys(performanceData.moduleInitTimes).length}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Loading Progress:</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPerformance(!showPerformance)}>
                  <Activity className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-32 w-full border rounded-lg p-3 bg-gray-50">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono">
                      {step}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {showPerformance && performanceData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Performance Metrics:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Load Time: {performanceData.totalLoadTime.toFixed(0)}ms</div>
                  <div>Memory: {performanceData.memoryUsage.used}MB</div>
                  <div>Modules: {Object.keys(performanceData.moduleInitTimes).length}</div>
                  <div>Requests: {performanceData.networkRequests.count}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state with performance data
  if (loadingStage === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              The system encountered an error during initialization. Performance data is available for debugging.
            </p>
            <Button onClick={() => setShowPerformance(!showPerformance)} variant="outline" className="w-full">
              {showPerformance ? "Hide" : "Show"} Performance Report
            </Button>
            {showPerformance && (
              <ScrollArea className="h-40 mt-4 p-2 bg-gray-50 rounded text-xs font-mono">
                <pre>{optimizedSystemManager.getPerformanceReport()}</pre>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin mode
  if (appMode === "admin") {
    return <AdminDashboardV2 onToggleChat={() => setAppMode("chat")} />
  }

  // Chat mode - use the enhanced chat component
  return <EnhancedAIChat />
}
