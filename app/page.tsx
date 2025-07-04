"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
import ChatWindow from "@/ui/chat/chat-window"
import AdminDashboardClean from "@/components/admin-dashboard-clean"

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])

  useEffect(() => {
    initializeSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    setLoadingProgress((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Starting ZacAI System...")
      await new Promise((resolve) => setTimeout(resolve, 300))

      addLoadingStep("✅ Core systems loaded")
      await new Promise((resolve) => setTimeout(resolve, 200))

      addLoadingStep("📦 Modules initialized")
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
              The system encountered an error during initialization. Please refresh the page to try again.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin mode - using the ACTUAL admin dashboard component
  if (appMode === "admin") {
    return <AdminDashboardClean onToggleChat={() => setAppMode("chat")} />
  }

  // Chat mode - using the ACTUAL chat window component
  return <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
}
