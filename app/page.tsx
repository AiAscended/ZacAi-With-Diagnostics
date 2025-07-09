"use client"

import { useState, useEffect } from "react"
import { SystemManager } from "@/core/system/SystemManager"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { DiagnosticChatWindow } from "@/components/diagnostic-chat-window"
import { CognitiveChatWindow } from "@/components/cognitive-chat-window"
import { ReliableChatWindow } from "@/components/reliable-chat-window"
import { ChatWindow } from "@/components/chat-window"
import { EnhancedChatWindow } from "@/components/enhanced-chat-window"
import { EnhancedChatWindowV2 } from "@/components/enhanced-chat-window-v2"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { AIDiagnosticPanel } from "@/components/ai-diagnostic-panel"
import { EnhancedAIChat } from "@/components/enhanced-ai-chat"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Cpu, Database, Settings, Activity, Zap, MessageSquare, BarChart3 } from "lucide-react"

export default function HomePage() {
  const [systemManager] = useState(() => new SystemManager())
  const [cognitiveAI] = useState(() => new CognitiveAISystem())
  const [reliableAI] = useState(() => new ReliableAISystem())
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeSystem, setActiveSystem] = useState<"system" | "cognitive" | "reliable">("cognitive")

  useEffect(() => {
    const initializeSystems = async () => {
      try {
        console.log("🚀 Initializing AI Systems...")

        // Initialize all systems
        await systemManager.initialize()
        await cognitiveAI.initialize()
        await reliableAI.initialize()

        setIsInitialized(true)
        console.log("✅ All AI Systems initialized successfully")
      } catch (error) {
        console.error("❌ Failed to initialize AI systems:", error)
        setIsInitialized(true) // Still show UI even if initialization fails
      }
    }

    initializeSystems()
  }, [systemManager, cognitiveAI, reliableAI])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 animate-pulse" />
              ZacAI Loading...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-600">Initializing AI systems...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">ZacAI</h1>
                  <p className="text-gray-600">Advanced AI Assistant with Multiple Cognitive Systems</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Online
                </Badge>
                <Badge variant="secondary">v2.0</Badge>
              </div>
            </div>
          </div>

          {/* System Selector */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  AI System Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={activeSystem === "system" ? "default" : "outline"}
                    onClick={() => setActiveSystem("system")}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Cpu className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">SystemManager</div>
                      <div className="text-xs opacity-70">Core modular system</div>
                    </div>
                  </Button>
                  <Button
                    variant={activeSystem === "cognitive" ? "default" : "outline"}
                    onClick={() => setActiveSystem("cognitive")}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Brain className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">CognitiveAI</div>
                      <div className="text-xs opacity-70">Enhanced with online sources</div>
                    </div>
                  </Button>
                  <Button
                    variant={activeSystem === "reliable" ? "default" : "outline"}
                    onClick={() => setActiveSystem("reliable")}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Zap className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">ReliableAI</div>
                      <div className="text-xs opacity-70">Stable with math processing</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat Interface -{" "}
                    {activeSystem === "system"
                      ? "SystemManager"
                      : activeSystem === "cognitive"
                        ? "CognitiveAI"
                        : "ReliableAI"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)]">
                  {activeSystem === "system" && <ChatWindow systemManager={systemManager} />}
                  {activeSystem === "cognitive" && <CognitiveChatWindow aiSystem={cognitiveAI} />}
                  {activeSystem === "reliable" && <ReliableChatWindow aiSystem={reliableAI} />}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Monitor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceMonitor />
                </CardContent>
              </Card>

              {/* AI Diagnostic Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    System Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIDiagnosticPanel aiSystem={activeSystem === "cognitive" ? cognitiveAI : reliableAI} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Tabs */}
          <div className="mt-6">
            <Tabs defaultValue="enhanced" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="enhanced">Enhanced Chat</TabsTrigger>
                <TabsTrigger value="enhanced-v2">Enhanced V2</TabsTrigger>
                <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                <TabsTrigger value="ai-enhanced">AI Enhanced</TabsTrigger>
              </TabsList>
              <TabsContent value="enhanced" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <EnhancedChatWindow />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="enhanced-v2" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <EnhancedChatWindowV2 />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="diagnostic" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <DiagnosticChatWindow />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai-enhanced" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <EnhancedAIChat />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
