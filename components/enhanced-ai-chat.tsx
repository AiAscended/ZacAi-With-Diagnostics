"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdminDashboard } from "@/ui/admin/dashboard"
import { Brain, Send, User, Bot, Settings } from "lucide-react"
import type { OptimizedLoader } from "@/core/system/optimized-loader"
import type { SafeModeSystem } from "@/core/system/safe-mode"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
}

interface EnhancedAIChatProps {
  loader: OptimizedLoader
  safeMode: SafeModeSystem
}

export function EnhancedAIChat({ loader, safeMode }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm ZacAI v2.0.8, now fully operational with production-grade architecture. How can I help you today?",
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["system"],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await systemManager.processQuery(input)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        reasoning: response.reasoning,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (showAdmin) {
    return <AdminDashboard onToggleChat={() => setShowAdmin(false)} loader={loader} safeMode={safeMode} />
  }

  const systemHealth = safeMode.getSystemHealth()
  const loadingSummary = loader.getLoadingSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] shadow-2xl border-0 flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <div>
                <div>ZacAI v2.0.8</div>
                <div className="text-sm font-normal text-blue-100">
                  Production Architecture • {loadingSummary.loaded}/{loadingSummary.total} modules
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge
                className={`${
                  systemHealth.overall === "healthy"
                    ? "bg-green-500"
                    : systemHealth.overall === "degraded"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                } text-white`}
              >
                {systemHealth.overall.toUpperCase()}
              </Badge>
              <Button
                onClick={() => setShowAdmin(true)}
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[75%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {/* Message metadata */}
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${
                          message.role === "user" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.confidence !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}% confidence
                          </Badge>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.sources.join(", ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white border shadow-sm p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">ZacAI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-white p-6 flex-shrink-0">
            <div className="flex gap-3 mb-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (try 'help', 'status', or '5 + 5')"
                className="flex-1 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput("help")} disabled={isLoading}>
                Help
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("status")} disabled={isLoading}>
                System Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("5 + 5")} disabled={isLoading}>
                Math Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("define artificial intelligence")}
                disabled={isLoading}
              >
                Define Word
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
