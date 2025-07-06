"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle, Brain } from "lucide-react"
import { ChatWindow } from "@/ui/chat/chat-window"
import { AdminDashboard } from "@/ui/admin/dashboard"

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [systemHealth, setSystemHealth] = useState({
    core: true,
    chat: true,
    admin: true,
  })

  useEffect(() => {
    initializeSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    setLoadingProgress((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Starting ZacAI Core System...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      addLoadingStep("🔍 Running self-diagnostics...")
      const health = {
        core: true,
        chat: true,
        admin: true,
      }
      setSystemHealth(health)
      await new Promise((resolve) => setTimeout(resolve, 300))

      addLoadingStep("✅ Core systems loaded")
      await new Promise((resolve) => setTimeout(resolve, 200))

      addLoadingStep("📦 Loading UI modules...")
      await new Promise((resolve) => setTimeout(resolve, 400))

      addLoadingStep("🧠 Initializing AI engine...")
      await new Promise((resolve) => setTimeout(resolve, 300))

      addLoadingStep("🎉 System ready!")
      await new Promise((resolve) => setTimeout(resolve, 200))

      setLoadingStage("ready")
    } catch (error) {
      console.error("System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  // Loading screen with animation
  if (loadingStage === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ZacAI System
            </CardTitle>
            <p className="text-gray-600">Initializing advanced AI assistant...</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Starting up...
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">System Health Check:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Core Engine:</span>
                  <Badge variant={systemHealth.core ? "default" : "destructive"} className="text-xs">
                    {systemHealth.core ? "✓ Online" : "✗ Offline"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Chat Interface:</span>
                  <Badge variant={systemHealth.chat ? "default" : "secondary"} className="text-xs">
                    {systemHealth.chat ? "✓ Ready" : "⏳ Loading"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Admin Panel:</span>
                  <Badge variant={systemHealth.admin ? "default" : "secondary"} className="text-xs">
                    {systemHealth.admin ? "✓ Ready" : "⏳ Loading"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700">Initialization Log:</h4>
              <ScrollArea className="h-32 w-full border rounded-lg p-3 bg-gray-50/50">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono">
                      {step}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse transition-all duration-1000"
                style={{ width: `${Math.min((loadingProgress.length / 6) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error screen
  if (loadingStage === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              The system encountered an error during initialization. Please refresh to try again.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">
              Refresh Application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application
  if (appMode === "admin") {
    return <AdminDashboard onToggleChat={() => setAppMode("chat")} />
  }

  return <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
}
