"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  MessageSquare,
  Database,
  Activity,
  Download,
  Settings,
  Lightbulb,
  Calculator,
  BookOpen,
  User,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react"
import { ReasoningEngine } from "@/lib/reasoning-engine"
import type { ChatMessage, ThoughtNode, SystemStats } from "@/lib/types"

interface MasterAIChatProps {
  className?: string
}

export default function MasterAIChat({ className = "" }: MasterAIChatProps) {
  // Core State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // System State
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"good" | "slow" | "offline">("good")
  const [systemStatus, setSystemStatus] = useState("initializing")

  // UI State
  const [activeTab, setActiveTab] = useState("chat")
  const [showThinking, setShowThinking] = useState(true)
  const [currentThinking, setCurrentThinking] = useState<ThoughtNode[]>([])

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reasoningEngineRef = useRef<ReasoningEngine | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize the reasoning engine
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        console.log("🚀 Initializing Master AI Chat...")
        setSystemStatus("initializing")

        const engine = new ReasoningEngine()
        await engine.initialize()

        reasoningEngineRef.current = engine
        setSystemStats(engine.getSystemStats())
        setSystemStatus("ready")
        setIsInitializing(false)

        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `🧠 **ZacAI Master Reasoning Engine Ready!**\n\nI'm your advanced AI assistant with:\n• 🧮 Tesla/Vortex Mathematics\n• 📚 Dynamic Vocabulary Learning\n• 🧠 Neural Network Processing\n• 💭 Iterative Thinking\n• 🔧 System Diagnostics\n\nTry asking me to calculate something, define a word, or run a system diagnostic!`,
          timestamp: Date.now(),
          confidence: 1.0,
        }

        setMessages([welcomeMessage])
        console.log("✅ Master AI Chat initialized successfully!")
      } catch (error) {
        console.error("❌ Failed to initialize Master AI Chat:", error)
        setSystemStatus("error")
        setIsInitializing(false)

        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "❌ **Initialization Error**\n\nI encountered an error during startup. Some features may not work correctly. Please refresh the page to try again.",
          timestamp: Date.now(),
          confidence: 0.3,
        }

        setMessages([errorMessage])
      }
    }

    initializeEngine()
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentThinking])

  // Update system stats periodically
  useEffect(() => {
    const updateStats = () => {
      if (reasoningEngineRef.current && systemStatus === "ready") {
        setSystemStats(reasoningEngineRef.current.getSystemStats())
      }
    }

    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [systemStatus])

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !reasoningEngineRef.current) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentThinking([])

    try {
      const response = await reasoningEngineRef.current.processMessage(input.trim())

      // Update thinking display
      setCurrentThinking(response.thinking || [])

      // Update connection status
      setConnectionStatus(response.connectionStatus as "good" | "slow" | "offline")
      setSystemStatus(response.systemStatus)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: response.knowledgeUsed,
        thinking: response.reasoning,
        mathAnalysis: response.mathAnalysis,
        responseTime: response.processingTime,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update system stats
      setSystemStats(reasoningEngineRef.current.getSystemStats())
    } catch (error) {
      console.error("❌ Error processing message:", error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.3,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle system diagnostic
  const runDiagnostic = async () => {
    if (!reasoningEngineRef.current) return

    setIsLoading(true)
    try {
      const response = await reasoningEngineRef.current.processMessage("system diagnostic")

      const diagnosticMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
      }

      setMessages((prev) => [...prev, diagnosticMessage])
      setSystemStats(reasoningEngineRef.current.getSystemStats())
    } catch (error) {
      console.error("❌ Diagnostic failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Export system data
  const exportData = () => {
    if (!reasoningEngineRef.current) return

    try {
      const data = reasoningEngineRef.current.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("❌ Export failed:", error)
    }
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([])
    setCurrentThinking([])
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // Get connection status icon
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "good":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "slow":
        return <Wifi className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  // Get system status color
  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case "ready":
        return "text-green-500"
      case "initializing":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  if (isInitializing) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 animate-pulse" />
              Initializing ZacAI...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground">Loading neural networks and knowledge base...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen max-w-6xl mx-auto p-4 ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-xl">ZacAI Master Reasoning Engine</CardTitle>
                <p className="text-sm text-muted-foreground">Advanced AI with Neural Learning & Tesla Mathematics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <Badge variant={systemStatus === "ready" ? "default" : "secondary"}>
                <span className={getSystemStatusColor()}>{systemStatus}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex gap-4">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="thinking" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Thinking
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversation</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowThinking(!showThinking)}>
                        <Lightbulb className="h-4 w-4 mr-1" />
                        {showThinking ? "Hide" : "Show"} Thinking
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearConversation}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                              <Clock className="h-3 w-3" />
                              {formatTime(message.timestamp)}
                              {message.confidence && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                                </>
                              )}
                              {message.responseTime && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <span>{message.responseTime.toFixed(0)}ms</span>
                                </>
                              )}
                            </div>
                            {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {message.knowledgeUsed.slice(0, 3).map((knowledge, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {knowledge}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Current Thinking Display */}
                      {isLoading && showThinking && currentThinking.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">Thinking Process</span>
                          </div>
                          <div className="space-y-1">
                            {currentThinking.slice(-5).map((thought) => (
                              <div key={thought.id} className="text-xs text-muted-foreground">
                                {thought.emoji} {thought.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              <span className="text-sm">Processing...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything... Try math, definitions, or 'system diagnostic'"
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Thinking Tab */}
            <TabsContent value="thinking" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Cognitive Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {currentThinking.length > 0 ? (
                      <div className="space-y-2">
                        {currentThinking.map((thought) => (
                          <div key={thought.id} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                            <span className="text-lg">{thought.emoji}</span>
                            <div className="flex-1">
                              <div className="text-sm">{thought.content}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {thought.type} • {Math.round(thought.confidence * 100)}% confidence
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active thinking process</p>
                        <p className="text-sm">Send a message to see my reasoning</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Knowledge Tab */}
            <TabsContent value="knowledge" className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Vocabulary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Words:</span>
                          <Badge>{systemStats.vocabulary.total}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Learned:</span>
                          <Badge variant="secondary">{systemStats.vocabulary.learned}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Seed:</span>
                          <Badge variant="outline">{systemStats.vocabulary.seed}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Mathematics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Concepts:</span>
                          <Badge>{systemStats.mathematics.total}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Calculations:</span>
                          <Badge variant="secondary">{systemStats.mathematics.calculations}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Functions:</span>
                          <Badge variant="outline">{systemStats.mathematics.functions}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Memory Entries:</span>
                          <Badge>{systemStats.memoryEntries}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversations:</span>
                          <Badge variant="secondary">{systemStats.conversations}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Facts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Facts:</span>
                          <Badge>{systemStats.facts.total}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Verified:</span>
                          <Badge variant="secondary">{systemStats.facts.verified}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="flex-1">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {systemStatus === "ready" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : systemStatus === "error" ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className={`font-medium ${getSystemStatusColor()}`}>
                          {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Avg Confidence:</span>
                          <span>{systemStats ? Math.round(systemStats.avgConfidence * 100) : 0}%</span>
                        </div>
                        <Progress value={systemStats ? systemStats.avgConfidence * 100 : 0} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getConnectionIcon()}
                        Connection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm font-medium">
                        {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={runDiagnostic} disabled={isLoading}>
                        <Activity className="h-4 w-4 mr-2" />
                        Run Diagnostic
                      </Button>
                      <Button variant="outline" onClick={exportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" onClick={clearConversation}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Clear Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {systemStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        System Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Vocabulary</div>
                          <div className="text-2xl font-bold text-blue-500">{systemStats.vocabularySize}</div>
                        </div>
                        <div>
                          <div className="font-medium">Math Functions</div>
                          <div className="text-2xl font-bold text-green-500">{systemStats.mathFunctions}</div>
                        </div>
                        <div>
                          <div className="font-medium">Conversations</div>
                          <div className="text-2xl font-bold text-purple-500">{systemStats.conversations}</div>
                        </div>
                        <div>
                          <div className="font-medium">Memory Entries</div>
                          <div className="text-2xl font-bold text-orange-500">{systemStats.memoryEntries}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
