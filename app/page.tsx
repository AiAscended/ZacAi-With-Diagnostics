"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle, Brain, CheckCircle } from "lucide-react"

// Simple, reliable components to avoid circular dependencies
interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
}

interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  confidence?: number
  duration?: number
}

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [systemHealth, setSystemHealth] = useState({
    core: false,
    chat: false,
    admin: false,
  })

  useEffect(() => {
    initializeSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLoadingProgress((prev) => [...prev, `${timestamp}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Starting ZacAI Core System...")

      // Simulate core system initialization
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSystemHealth((prev) => ({ ...prev, core: true }))
      addLoadingStep("✅ Core engine online")

      // Initialize chat system
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSystemHealth((prev) => ({ ...prev, chat: true }))
      addLoadingStep("💬 Chat interface ready")

      // Initialize admin system
      await new Promise((resolve) => setTimeout(resolve, 400))
      setSystemHealth((prev) => ({ ...prev, admin: true }))
      addLoadingStep("⚙️ Admin dashboard ready")

      addLoadingStep("🎉 All systems operational!")

      // Small delay before showing ready state
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoadingStage("ready")
    } catch (error) {
      console.error("System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  // Loading screen with enhanced animation
  if (loadingStage === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ZacAI System
            </CardTitle>
            <p className="text-gray-600 text-lg">Initializing advanced AI assistant...</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse px-4 py-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting up...
              </Badge>
            </div>

            {/* System Health Check */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-4 text-gray-700">System Health Check:</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Core Engine:</span>
                  <Badge variant={systemHealth.core ? "default" : "secondary"} className="text-xs">
                    {systemHealth.core ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chat Interface:</span>
                  <Badge variant={systemHealth.chat ? "default" : "secondary"} className="text-xs">
                    {systemHealth.chat ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admin Panel:</span>
                  <Badge variant={systemHealth.admin ? "default" : "secondary"} className="text-xs">
                    {systemHealth.admin ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Initialization Log */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Initialization Log:</h4>
              <ScrollArea className="h-40 w-full border rounded-lg p-3 bg-white/80">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.min((loadingProgress.length / 5) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((loadingProgress.length / 5) * 100, 100)}%` }}
                />
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
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              The system encountered an error during initialization. Please refresh to try again.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">
                Refresh Application
              </Button>
              <Button onClick={() => setLoadingStage("initializing")} variant="outline" className="w-full">
                Retry Initialization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application - render components directly to avoid import issues
  if (appMode === "admin") {
    return <AdminDashboard onToggleChat={() => setAppMode("chat")} />
  }

  return <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
}

// Inline ChatWindow component to avoid import issues
function ChatWindow({ onToggleAdmin }: { onToggleAdmin: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `🎉 **ZacAI System Online!**

I'm your advanced AI assistant, ready to help with:

• **Intelligent Conversations** - Natural dialogue and Q&A
• **Mathematical Calculations** - From basic arithmetic to complex equations  
• **Creative Tasks** - Writing, brainstorming, and problem-solving
• **Code Analysis** - Programming help and debugging
• **Research & Facts** - Information gathering and explanations
• **System Management** - Access admin panel for configuration

**What would you like to explore today?**`,
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["core", "welcome"],
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const simulateThinking = async (userInput: string) => {
    const thinkingSteps: Omit<ThinkingStep, "id">[] = [
      {
        type: "analysis",
        title: "Analyzing Input",
        description: "Breaking down the user's question and identifying key components...",
        status: "pending",
      },
      {
        type: "search",
        title: "Knowledge Retrieval",
        description: "Searching through knowledge base for relevant information...",
        status: "pending",
      },
      {
        type: "reasoning",
        title: "Processing Logic",
        description: "Applying reasoning and connecting concepts...",
        status: "pending",
      },
      {
        type: "synthesis",
        title: "Formulating Response",
        description: "Combining insights into a comprehensive answer...",
        status: "pending",
      },
      {
        type: "validation",
        title: "Quality Check",
        description: "Verifying accuracy and completeness of response...",
        status: "pending",
      },
    ]

    const steps = thinkingSteps.map((step, index) => ({
      ...step,
      id: `step-${index}`,
    }))

    setCurrentThinking(steps)
    setIsThinking(true)

    // Simulate thinking process
    for (let i = 0; i < steps.length; i++) {
      setCurrentThinking((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "processing" as const } : step)),
      )

      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300))

      setCurrentThinking((prev) =>
        prev.map((step, index) =>
          index === i
            ? {
                ...step,
                status: "completed" as const,
                duration: Math.floor(200 + Math.random() * 300),
                confidence: 0.8 + Math.random() * 0.2,
              }
            : step,
        ),
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    setIsThinking(false)

    return generateResponse(userInput)
  }

  const generateResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: `👋 **Hello there!** 

It's wonderful to meet you! I'm ZacAI, your advanced AI assistant.

**I can assist you with:**
• Answering questions and providing detailed explanations
• Mathematical calculations and problem-solving
• Creative writing and brainstorming sessions
• Code analysis and programming guidance
• Research and factual information
• General conversation and advice

What would you like to explore together today?`,
        confidence: 0.95,
        sources: ["greeting", "core"],
      }
    }

    if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
      setTimeout(() => onToggleAdmin(), 1000)
      return {
        response: `🔧 **Switching to Admin Dashboard...**

Redirecting you to the administrative interface where you can:
• Monitor system performance and statistics
• Configure AI behavior and settings
• Manage knowledge modules
• View detailed analytics
• Export/import system configurations

*Please wait while I transfer you to the admin panel...*`,
        confidence: 0.98,
        sources: ["admin", "navigation"],
      }
    }

    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return {
          response: `🧮 **Mathematical Calculation**

**Expression:** \`${input}\`
**Result:** \`${result}\`

✅ Calculation completed successfully!`,
          confidence: 0.97,
          sources: ["mathematics", "calculator"],
        }
      } catch {
        return {
          response: `❌ **Calculation Error**

I couldn't process that mathematical expression. Please try:
• Simple arithmetic: \`5 + 3\`, \`10 * 2\`, \`15 / 3\`
• Using parentheses for complex expressions: \`(5 + 3) * 2\`

**Example:** Try asking me "What is 25 + 17?"`,
          confidence: 0.3,
          sources: ["mathematics", "error"],
        }
      }
    }

    return {
      response: `🤔 **Interesting Question!**

You asked about: *"${input}"*

I'm processing your request and thinking through the best way to help you. To provide the most accurate and helpful response, could you:

• **Provide more context** - What specific aspect interests you most?
• **Clarify your goal** - Are you looking for an explanation, solution, or discussion?
• **Share details** - Any particular angle or use case you have in mind?

I'm here to help with detailed, thoughtful responses once I understand exactly what you're looking for!`,
      confidence: 0.65,
      sources: ["general", "clarification"],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const { response, confidence, sources } = await simulateThinking(input.trim())
      const totalTime = Date.now() - startTime

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: Date.now(),
        confidence,
        sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentThinking([])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }
      setMessages((prev) => [...prev, errorMessage])
      setCurrentThinking([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Assistant</h1>
                <p className="text-sm text-gray-600">Advanced AI Chat Interface • Version 208</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
            <Button
              onClick={onToggleAdmin}
              variant="outline"
              className="gap-2 bg-white/50 hover:bg-white/80 border-gray-200 shadow-sm"
            >
              <Brain className="w-4 h-4" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Card className="h-full flex flex-col shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Chat Session
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-6">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex gap-3 max-w-4xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                          }`}
                        >
                          {message.type === "user" ? "U" : "AI"}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${message.type === "user" ? "text-right" : "text-left"}`}>
                          <Card
                            className={`${
                              message.type === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600"
                                : "bg-white border-gray-200 shadow-sm"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                                {/* Message metadata */}
                                <div
                                  className={`flex items-center justify-between text-xs ${
                                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                  {message.confidence !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(message.confidence * 100)}%
                                    </Badge>
                                  )}
                                </div>

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                                    {message.sources.map((source, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Active Thinking Process */}
                {isThinking && currentThinking.length > 0 && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md">
                        AI
                      </div>
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Thinking...</span>
                            </div>
                            <div className="space-y-2">
                              {currentThinking.map((step) => (
                                <div key={step.id} className="flex items-center gap-3 text-xs">
                                  <div className="flex-shrink-0">
                                    {step.status === "completed" ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : step.status === "processing" ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                                    )}
                                  </div>
                                  <span
                                    className={`${
                                      step.status === "completed"
                                        ? "text-green-700"
                                        : step.status === "processing"
                                          ? "text-orange-700"
                                          : "text-gray-500"
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && !isThinking && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md">
                        AI
                      </div>
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                            <span className="text-sm text-gray-600">Processing your request...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... I can help with questions, math, coding, creative tasks, and more!"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Inline AdminDashboard component to avoid import issues
function AdminDashboard({ onToggleChat }: { onToggleChat: () => void }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-96 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading ZacAI Dashboard
            </h2>
            <p className="text-gray-600">Initializing system analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onToggleChat} className="gap-2">
                ← Back to Chat
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System management and monitoring • Version 208</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-3xl font-bold text-gray-900">127</p>
                  <p className="text-xs text-green-600 mt-1">↗ +12% from last hour</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">96%</p>
                  <p className="text-xs text-green-600 mt-1">↗ +2% improvement</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-3xl font-bold text-gray-900">1250ms</p>
                  <p className="text-xs text-orange-600 mt-1">↗ +50ms slower</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Modules</p>
                  <p className="text-3xl font-bold text-gray-900">4</p>
                  <p className="text-xs text-blue-600 mt-1">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Vocabulary", "Mathematics", "Facts", "Coding"].map((module) => (
                <div key={module} className="p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{module}</h3>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Time:</span>
                      <span className="font-medium">120ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
