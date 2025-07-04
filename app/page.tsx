"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, XCircle, Send, User, Bot, Settings } from "lucide-react"
import AdminDashboardV2 from "@/components/admin-dashboard-v2"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
}

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

export default function Home() {
  // Core state
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // System state
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

      // Simulate system initialization
      await new Promise((resolve) => setTimeout(resolve, 500))
      addLoadingStep("✅ Core systems loaded")

      await new Promise((resolve) => setTimeout(resolve, 300))
      addLoadingStep("📦 Modules initialized")

      await new Promise((resolve) => setTimeout(resolve, 200))
      addLoadingStep("🎉 System ready!")

      setLoadingStage("ready")

      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: `🎉 **ZacAI System Online!**

I'm your AI assistant, ready to help with:

**Available Commands:**
• Basic chat and responses
• Simple math calculations (5+5)
• Name recognition (my name is...)
• System status and help
• Admin dashboard (type "admin")

What would you like to do?`,
        sender: "ai",
        timestamp: Date.now(),
        confidence: 1.0,
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("❌ System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

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
      const lowerInput = input.toLowerCase()

      // Admin mode
      if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
        setAppMode("admin")
        response = "🔧 Switching to Admin Dashboard..."
        confidence = 0.95
      }
      // Help
      else if (lowerInput.includes("help")) {
        response = `🆘 **ZacAI Help**

**Available Commands:**
• **help** - Show this help message
• **admin** - Switch to admin dashboard
• **my name is [name]** - Tell me your name
• **[math expression]** - Calculate math (5+5, 10*2)
• **hello/hi** - Greetings
• **status** - System information

I'm ready to assist you!`
        confidence = 0.95
      }
      // Basic math
      else if (/^\d+[\s]*[+\-*/][\s]*\d+$/.test(input.replace(/\s/g, ""))) {
        try {
          const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
          response = `🧮 **${input} = ${result}**

Calculation completed successfully!`
          confidence = 0.95
        } catch {
          response = "❌ I couldn't calculate that. Please check your math expression."
          confidence = 0.3
        }
      }
      // Name recognition
      else if (lowerInput.includes("my name is")) {
        const nameMatch = input.match(/my name is (\w+)/i)
        if (nameMatch) {
          const name = nameMatch[1]
          localStorage.setItem("zacai_user_name", name)
          response = `👋 Nice to meet you, ${name}! I'll remember your name for this session.`
          confidence = 0.95
        }
      }
      // Status
      else if (lowerInput.includes("status")) {
        const userName = localStorage.getItem("zacai_user_name")
        response = `📊 **System Status**

• **Status**: Online and operational
• **User**: ${userName || "Anonymous"}
• **Session**: Active
• **Features**: All systems functional

Everything is working perfectly!`
        confidence = 0.95
      }
      // Greetings
      else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        const userName = localStorage.getItem("zacai_user_name")
        response = `👋 Hello${userName ? ` ${userName}` : ""}! I'm ZacAI, your AI assistant.

I'm ready to help you with various tasks. Type "help" to see what I can do!`
        confidence = 0.9
      }
      // Default response
      else {
        response = `I received your message: "${input}"

I'm here to help! Type "help" to see available commands, or just chat with me naturally.`
        confidence = 0.6
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: Date.now(),
        confidence,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("❌ Message processing error:", error)

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

  const getStatusIcon = () => {
    switch (loadingStage) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
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

  // Error state
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

  // Admin mode
  if (appMode === "admin") {
    return <AdminDashboardV2 onToggleChat={() => setAppMode("chat")} />
  }

  // Chat mode - Main interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ZacAI</h1>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAppMode("admin")}>
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.content.split("\n").map((line, index) => (
                          <div key={index}>
                            {line.startsWith("**") && line.endsWith("**") ? (
                              <strong>{line.slice(2, -2)}</strong>
                            ) : line.startsWith("• ") ? (
                              <div className="ml-4">• {line.slice(2)}</div>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.confidence && <span>Confidence: {Math.round(message.confidence * 100)}%</span>}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="lg" className="px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Try: "help", "admin", "5+5", "my name is John", or just chat naturally
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
