"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Brain, Send, Settings, MessageSquare, User, Bot, Clock } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  sources?: string[]
}

export function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content: `👋 **Welcome to ZacAI v100**

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

  const processQuery = async (input: string): Promise<any> => {
    const lowerInput = input.toLowerCase()

    // Handle greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: "👋 Hello! I'm ZacAI, your AI assistant. How can I help you today?",
        confidence: 0.9,
        sources: ["core"],
      }
    }

    // Handle help
    if (lowerInput.includes("help")) {
      return {
        response: `🆘 **ZacAI Help**

Available Commands:
• **Math calculations** - "5 + 5" or "What is 15 * 8?"
• **General questions** - Ask me about anything
• **System status** - "status" or "how are you?"

What would you like to try?`,
        confidence: 0.95,
        sources: ["core"],
      }
    }

    // Handle status
    if (lowerInput.includes("status") || lowerInput.includes("how are you")) {
      return {
        response: `🟢 **System Status: Operational**

• Version: ZacAI v100
• Status: All systems running normally
• Response time: Fast
• Memory: Available

I'm ready to help! What can I do for you?`,
        confidence: 0.95,
        sources: ["system"],
      }
    }

    // Handle math calculations
    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return {
          response: `🧮 **${input} = ${result}**

Calculation completed successfully!`,
          confidence: 0.95,
          sources: ["mathematics"],
        }
      } catch {
        return {
          response: "❌ I couldn't calculate that. Please check your math expression.",
          confidence: 0.3,
          sources: ["error"],
        }
      }
    }

    // Default response
    return {
      response: `I received your message: "${input}"

I'm here to help! Try asking me to:
• Solve a math problem  
• Type "help" for more options
• Ask "status" to check system health

What else would you like to explore?`,
      confidence: 0.6,
      sources: ["core"],
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
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await processQuery(input.trim())

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: result.response,
        sender: "ai",
        timestamp: Date.now(),
        confidence: result.confidence,
        sources: result.sources,
      }

      setMessages((prev) => [...prev, aiMessage])
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

  if (showAdmin) {
    return <AdminDashboard onToggleChat={() => setShowAdmin(false)} messages={messages} />
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
                  ZacAI v100
                </h1>
                <p className="text-sm text-gray-600">Your Personal AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Online
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {messages.filter((m) => m.sender === "user").length} queries
              </Badge>
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
