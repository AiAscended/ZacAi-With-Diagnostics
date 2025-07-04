"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"

// Core imports with fallbacks
let ChatWindow: any = null
let AdminDashboard: any = null

try {
  ChatWindow = require("@/ui/chat/chat-window").default
} catch {
  console.warn("ChatWindow not found, using fallback")
}

try {
  AdminDashboard = require("@/ui/admin/dashboard").default
} catch {
  console.warn("AdminDashboard not found, using fallback")
}

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

// Fallback Chat Component
function FallbackChat({ onToggleAdmin }: { onToggleAdmin: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ZacAI Chat (Fallback Mode)
            <Button onClick={onToggleAdmin}>Admin</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chat system loading... Core is stable.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Fallback Admin Component
function FallbackAdmin({ onToggleChat }: { onToggleChat: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ZacAI Admin (Fallback Mode)
            <Button onClick={onToggleChat}>Back to Chat</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Admin system loading... Core is stable.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [systemHealth, setSystemHealth] = useState({
    core: true,
    chat: false,
    admin: false,
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
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Core self-diagnostic
      addLoadingStep("🔍 Running self-diagnostics...")
      const health = {
        core: true,
        chat: !!ChatWindow,
        admin: !!AdminDashboard,
      }
      setSystemHealth(health)

      addLoadingStep("✅ Core systems loaded")
      await new Promise((resolve) => setTimeout(resolve, 200))

      addLoadingStep("📦 Loading modules...")
      await new Promise((resolve) => setTimeout(resolve, 100))

      addLoadingStep("🎉 System ready!")
      setLoadingStage("ready")
    } catch (error) {
      console.error("System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  // Loading screen
  if (loadingStage === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Initializing ZacAI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stage:</span>
                <Badge variant="secondary">Starting up...</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">System Health:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Core:</span>
                    <Badge variant={systemHealth.core ? "default" : "destructive"}>
                      {systemHealth.core ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Chat:</span>
                    <Badge variant={systemHealth.chat ? "default" : "secondary"}>
                      {systemHealth.chat ? "✓" : "Fallback"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Admin:</span>
                    <Badge variant={systemHealth.admin ? "default" : "secondary"}>
                      {systemHealth.admin ? "✓" : "Fallback"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Loading Progress:</h4>
                <ScrollArea className="h-32 w-full border rounded p-2 bg-gray-50">
                  <div className="space-y-1">
                    {loadingProgress.map((step, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {step}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
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
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              The system encountered an error during initialization. Core is stable, using fallback mode.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin mode - with fallback
  if (appMode === "admin") {
    if (AdminDashboard) {
      return <AdminDashboard onToggleChat={() => setAppMode("chat")} />
    } else {
      return <FallbackAdmin onToggleChat={() => setAppMode("chat")} />
    }
  }

  // Chat mode - with fallback
  if (ChatWindow) {
    return <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
  } else {
    return <FallbackChat onToggleAdmin={() => setAppMode("admin")} />
  }
}
