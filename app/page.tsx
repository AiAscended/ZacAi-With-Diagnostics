"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Send, User, Bot, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
}

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

// Simple Admin Dashboard Component (inline to avoid import issues)
function AdminDashboard({ onToggleChat }: { onToggleChat: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onToggleChat}>
                ← Back to Chat
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System management and monitoring</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">System Online</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <Bot className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">99.9%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">150ms</p>
                </div>
                <Settings className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">System initialized successfully</p>
                  <p className="text-sm text-gray-600">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">All modules loaded</p>
                  <p className="text-sm text-gray-600">3 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Admin dashboard accessed</p>
                  <p className="text-sm text-gray-600">Just now</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `🎉 ZacAI System Online!

I'm your AI assistant, ready to help with:

• Basic chat and responses
• Simple math calculations (5+5)
• Name recognition (my name is...)
• System status and help
• Admin dashboard (type "admin")

What would you like to do?`,
      sender: "ai",
      timestamp: Date.now(),
      confidence: 1.0,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [showAdmin, setShowAdmin] = useState(false)

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

      if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
        setShowAdmin(true)
        response = "🔧 Switching to Admin Dashboard..."
        confidence = 0.95
      } else if (lowerInput.includes("help")) {
        response = `🆘 ZacAI Help

Available Commands:
• help - Show this help message
• admin - Switch to admin dashboard
• my name is [name] - Tell me your name
• [math expression] - Calculate math (5+5, 10*2)
• hello/hi - Greetings
• status - System information

I'm ready to assist you!`
        confidence = 0.95
      } else if (/^\d+[\s]*[+\-*/][\s]*\d+$/.test(input.replace(/\s/g, ""))) {
        try {
          const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
          response = `🧮 ${input} = ${result}

Calculation completed successfully!`
          confidence = 0.95
        } catch {
          response = "❌ I couldn't calculate that. Please check your math expression."
          confidence = 0.3
        }
      } else if (lowerInput.includes("my name is")) {
        const nameMatch = input.match(/my name is (\w+)/i)
        if (nameMatch) {
          const name = nameMatch[1]
          if (typeof window !== "undefined") {
            localStorage.setItem("zacai_user_name", name)
          }
          response = `👋 Nice to meet you, ${name}! I'll remember your name for this session.`
          confidence = 0.95
        }
      } else if (lowerInput.includes("status")) {
        const userName = typeof window !== "undefined" ? localStorage.getItem("zacai_user_name") : null
        response = `📊 System Status

• Status: Online and operational
• User: ${userName || "Anonymous"}
• Session: Active
• Features: All systems functional

Everything is working perfectly!`
        confidence = 0.95
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        const userName = typeof window !== "undefined" ? localStorage.getItem("zacai_user_name") : null
        response = `👋 Hello${userName ? ` ${userName}` : ""}! I'm ZacAI, your AI assistant.

I'm ready to help you with various tasks. Type "help" to see what I can do!`
        confidence = 0.9
      } else {
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

  // Admin mode
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">ZacAI Admin Dashboard</h1>
              <Button onClick={() => setShowAdmin(false)}>Back to Chat</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold">System Status</h3>
                  <p className="text-green-600">Online</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Messages</h3>
                  <p>{messages.length}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main chat interface
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
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAdmin(true)}>
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
                      <div className="whitespace-pre-wrap">{message.content}</div>

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
              <Input
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
