"use client"

import { Separator } from "@/components/ui/separator"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdminDashboardClean } from "@/components/admin-dashboard-clean"
import { Brain, Send, Settings, MessageSquare, User, Bot, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import type { OptimizedLoader } from "@/core/system/optimized-loader"
import type { SafeModeSystem } from "@/core/system/safe-mode"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  sources?: string[]
  processingTime?: number
}

interface EnhancedAIChatProps {
  loader: OptimizedLoader
  safeMode: SafeModeSystem
}

export function EnhancedAIChat({ loader, safeMode }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [systemStats, setSystemStats] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content: `👋 **Welcome to ZacAI v2.0.8+**

I'm your personal AI assistant, ready to help with:
• **Math calculations** - Try "5 + 5" or "What is 15 * 8?"
• **General questions** - Ask me about anything
• **System help** - Type "help" for more options

What would you like to explore today?`,
      sender: "ai",
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["system"],
    }

    setMessages([welcomeMessage])

    // Load system stats
    loadSystemStats()

    // Focus input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadSystemStats = () => {
    try {
      const stats = systemManager.getSystemStats()
      setSystemStats(stats)
    } catch (error) {
      console.error("Failed to load system stats:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await systemManager.processQuery(input.trim())

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: result.response,
        sender: "ai",
        timestamp: Date.now(),
        confidence: result.confidence,
        sources: result.sources,
        processingTime: result.processingTime,
      }

      setMessages((prev) => [...prev, aiMessage])
      loadSystemStats()
    } catch (error) {
      console.error("Error processing query:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "❌ I encountered an error processing your request. Please try again.",
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-100 text-gray-700"
    if (confidence >= 0.8) return "bg-green-100 text-green-700"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  const getSystemHealthIcon = () => {
    const health = safeMode.getSystemHealth()
    if (!health) return <AlertTriangle className="w-4 h-4 text-yellow-500" />

    switch (health.overall) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  if (showAdmin) {
    return <AdminDashboardClean onToggleChat={() => setShowAdmin(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ZacAI v2.0.8+
                </h1>
                <p className="text-sm text-gray-600">Your Personal AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* System Health */}
              <div className="flex items-center gap-2">
                {getSystemHealthIcon()}
                <span className="text-sm text-gray-600">{safeMode.getSystemHealth()?.overall || "Unknown"}</span>
              </div>

              {/* Stats */}
              {systemStats && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {systemStats.totalQueries} queries
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {Math.round(systemStats.averageResponseTime)}ms avg
                  </Badge>
                </div>
              )}

              {/* Admin Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Chat with ZacAI
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {/* Message metadata */}
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>

                        {message.confidence !== undefined && (
                          <Badge variant="secondary" className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}

                        {message.processingTime && <span>{message.processingTime}ms</span>}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">ZacAI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
