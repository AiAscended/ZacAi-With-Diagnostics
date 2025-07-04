"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  MessageSquare,
  Settings,
  Database,
  User,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Send,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { SimpleAISystem } from "@/lib/simple-ai-system"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  thinking?: string
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  learning: any
  cognitive: any
  uptime: number
  totalQueries: number
  averageResponseTime: number
}

export default function EnhancedAIChat() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSystem, setAiSystem] = useState<SimpleAISystem | null>(null)
  const [systemInitialized, setSystemInitialized] = useState(false)

  // UI state
  const [activeView, setActiveView] = useState<"chat" | "admin">("chat")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<SystemStats | null>(null)

  // Loading state
  const [loadingStage, setLoadingStage] = useState("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addLoadingStep = (step: string) => {
    setLoadingProgress((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Initializing ZacAI System...")
      setLoadingStage("core")

      // Initialize AI System
      addLoadingStep("🧠 Loading AI Core...")
      const system = new SimpleAISystem()
      await system.initialize()
      setAiSystem(system)

      addLoadingStep("📚 Loading Knowledge Modules...")
      setLoadingStage("modules")

      // Load vocabulary
      addLoadingStep("📖 Loading Vocabulary...")
      await system.loadSeedVocabulary()

      addLoadingStep("🔢 Loading Mathematics...")
      await system.loadSeedMathematics()

      addLoadingStep("🌍 Loading Facts...")
      await system.loadSeedFacts()

      addLoadingStep("💻 Loading Coding Knowledge...")
      await system.loadSeedCoding()

      addLoadingStep("🤔 Loading Philosophy...")
      await system.loadSeedPhilosophy()

      addLoadingStep("✅ System Ready!")
      setLoadingStage("ready")
      setSystemInitialized(true)

      // Load system stats
      loadSystemStats()

      // Welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: `🎉 **ZacAI System Online!**

I'm your advanced AI assistant with specialized knowledge in:
• 📖 **Vocabulary** - Definitions, etymology, usage
• 🔢 **Mathematics** - Calculations, formulas, concepts  
• 🌍 **Facts** - General knowledge and information
• 💻 **Coding** - Programming help and examples
• 🤔 **Philosophy** - Deep thinking and reasoning

I can learn from our conversations and remember what you tell me. What would you like to explore today?`,
        sender: "ai",
        timestamp: Date.now(),
        confidence: 1.0,
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")

      const errorMessage: Message = {
        id: "error",
        content: `⚠️ **System Error**

I encountered an error during initialization but I'm still operational in basic mode.

Available commands:
• Basic chat responses
• Simple calculations
• Help and information

Type "help" for assistance.`,
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0.5,
      }

      setMessages([errorMessage])
    }
  }

  const loadSystemStats = () => {
    if (!aiSystem) return

    const mockStats: SystemStats = {
      initialized: true,
      modules: {
        vocabulary: { totalQueries: 45, successRate: 0.92, learntEntries: 128 },
        mathematics: { totalQueries: 23, successRate: 0.95, learntEntries: 67 },
        facts: { totalQueries: 31, successRate: 0.88, learntEntries: 89 },
        coding: { totalQueries: 18, successRate: 0.91, learntEntries: 34 },
        philosophy: { totalQueries: 12, successRate: 0.87, learntEntries: 21 },
      },
      learning: { totalLearned: 339, confidenceAverage: 0.91 },
      cognitive: { processingSpeed: 245, memoryUsage: 0.67 },
      uptime: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      totalQueries: 129,
      averageResponseTime: 245,
    }

    setStats(mockStats)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let response = ""
      let confidence = 0.8
      let thinking = ""

      if (aiSystem && systemInitialized) {
        const result = await aiSystem.processMessage(input)
        response = result.response
        confidence = result.confidence
        thinking = result.thinking || ""
      } else {
        // Fallback responses
        const lowerInput = input.toLowerCase()
        thinking = `Processing "${input}" in basic mode...`

        if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
          response = "Hello! I'm ZacAI. My advanced systems are still loading, but I'm here to help!"
          confidence = 0.9
        } else if (/^\d+[\s]*[+\-*/][\s]*\d+$/.test(input.replace(/\s/g, ""))) {
          try {
            const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
            response = `${input} = ${result}`
            confidence = 0.95
          } catch {
            response = "I couldn't calculate that. Please check your expression."
            confidence = 0.3
          }
        } else {
          response = `I received: "${input}"\n\nI'm still initializing my advanced capabilities. Please wait for the system to fully load for better responses.`
          confidence = 0.6
        }
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: Date.now(),
        confidence,
        thinking,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Message processing error:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "⚠️ I encountered an error processing your message. Please try again.",
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Loading screen
  if (!systemInitialized && loadingStage !== "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <Brain className="h-6 w-6 animate-pulse text-blue-600" />
              Initializing ZacAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                {loadingStage}
              </Badge>
              <Progress value={loadingStage === "ready" ? 100 : loadingStage === "modules" ? 75 : 25} />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">System Loading:</h4>
              <ScrollArea className="h-32 w-full border rounded p-2 bg-white/50">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {step}
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

  // Main application
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 bg-white/95 backdrop-blur-lg border-r border-white/20 shadow-lg flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg gradient-text">ZacAI</h2>
                  <p className="text-xs text-gray-500">Advanced AI System</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2">
          <div className="space-y-1">
            <Button
              variant={activeView === "chat" ? "default" : "ghost"}
              className={`w-full ${sidebarCollapsed ? "px-2" : "justify-start"}`}
              onClick={() => setActiveView("chat")}
            >
              <MessageSquare className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Chat</span>}
            </Button>

            <Button
              variant={activeView === "admin" ? "default" : "ghost"}
              className={`w-full ${sidebarCollapsed ? "px-2" : "justify-start"}`}
              onClick={() => setActiveView("admin")}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Admin</span>}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Quick Actions</h3>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh System
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  <Download className="h-3 w-3 mr-2" />
                  Export Data
                </Button>
              </div>
            </>
          )}
        </div>

        {/* System Status */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Queries</span>
                <span className="font-mono">{stats?.totalQueries || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Response</span>
                <span className="font-mono">{stats?.averageResponseTime || 0}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeView === "chat" && (
          <>
            {/* Chat Header */}
            <div className="bg-white/95 backdrop-blur-lg border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-semibold">AI Chat</h1>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {systemInitialized ? "Ready" : "Loading"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{messages.length} messages</Badge>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white/95 backdrop-blur-lg border border-white/20 shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.confidence !== undefined && (
                          <div className="text-xs mt-2 opacity-70">
                            Confidence: {Math.round(message.confidence * 100)}%
                          </div>
                        )}
                        {message.thinking && (
                          <details className="mt-2">
                            <summary className="text-xs opacity-70 cursor-pointer">Thinking Process</summary>
                            <div className="text-xs mt-1 opacity-70 italic">{message.thinking}</div>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Chat Input */}
            <div className="bg-white/95 backdrop-blur-lg border-t border-white/20 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-white/50 border-white/20"
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-6">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "admin" && (
          <>
            {/* Admin Header */}
            <div className="bg-white/95 backdrop-blur-lg border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats?.totalQueries || 0} queries</Badge>
                  <Badge variant="secondary">{Math.round(stats?.averageResponseTime || 0)}ms avg</Badge>
                </div>
              </div>
            </div>

            {/* Admin Content */}
            <div className="flex-1 overflow-auto p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Queries</p>
                            <p className="text-2xl font-bold text-blue-600">{stats?.totalQueries || 0}</p>
                          </div>
                          <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Avg Response</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round(stats?.averageResponseTime || 0)}ms
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Modules</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {Object.keys(stats?.modules || {}).length}
                            </p>
                          </div>
                          <Database className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">System Health</p>
                            <p className="text-2xl font-bold text-emerald-600">98%</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Module Status */}
                  <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Module Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                          <div key={name} className="p-4 border rounded-lg bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium capitalize flex items-center gap-2">
                                {name === "vocabulary" && <BookOpen className="w-4 h-4 text-blue-600" />}
                                {name === "mathematics" && <Calculator className="w-4 h-4 text-green-600" />}
                                {name === "facts" && <Globe className="w-4 h-4 text-purple-600" />}
                                {name === "coding" && <Code className="w-4 h-4 text-cyan-600" />}
                                {name === "philosophy" && <Lightbulb className="w-4 h-4 text-orange-600" />}
                                {name}
                              </h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Queries:</span>
                                <span className="font-medium">{(moduleStats as any)?.totalQueries || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Success Rate:</span>
                                <span className="font-medium">
                                  {Math.round(((moduleStats as any)?.successRate || 0) * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Learnt Entries:</span>
                                <span className="font-medium">{(moduleStats as any)?.learntEntries || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="modules" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                      <Card key={name} className="bg-white/95 backdrop-blur-lg border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 capitalize">
                            {name === "vocabulary" && <BookOpen className="w-5 h-5 text-blue-600" />}
                            {name === "mathematics" && <Calculator className="w-5 h-5 text-green-600" />}
                            {name === "facts" && <Globe className="w-5 h-5 text-purple-600" />}
                            {name === "coding" && <Code className="w-5 h-5 text-cyan-600" />}
                            {name === "philosophy" && <Lightbulb className="w-5 h-5 text-orange-600" />}
                            {name} Module
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {(moduleStats as any)?.totalQueries || 0}
                              </div>
                              <div className="text-sm text-gray-600">Total Queries</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(((moduleStats as any)?.successRate || 0) * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Success Rate</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Learnt Entries:</span>
                              <span className="font-mono">{(moduleStats as any)?.learntEntries || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Avg Response Time:</span>
                              <span className="font-mono">245ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Last Update:</span>
                              <span className="font-mono">Just now</span>
                            </div>
                          </div>

                          <Progress
                            value={Math.round(((moduleStats as any)?.successRate || 0) * 100)}
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="memory" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Memory System
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">339</div>
                          <div className="text-sm text-gray-600">Total Memories</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">23</div>
                          <div className="text-sm text-gray-600">Personal Info</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">12</div>
                          <div className="text-sm text-gray-600">Conversations</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Recent Learning</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">
                            System is actively learning from conversations and building knowledge base...
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">Response Times</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Average:</span>
                              <span className="font-mono">245ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Fastest:</span>
                              <span className="font-mono">89ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Slowest:</span>
                              <span className="font-mono">1.2s</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">System Resources</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Memory Usage:</span>
                              <span className="font-mono">67%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>CPU Usage:</span>
                              <span className="font-mono">23%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cache Hit Rate:</span>
                              <span className="font-mono">91%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card className="bg-white/95 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        System Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-500">Enable detailed logging</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto Learning</Label>
                            <p className="text-sm text-gray-500">Automatically learn from interactions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Performance Monitoring</Label>
                            <p className="text-sm text-gray-500">Track system performance metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-4">
                        <Button variant="outline">Reset Settings</Button>
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
