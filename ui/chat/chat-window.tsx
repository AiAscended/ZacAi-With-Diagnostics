"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Brain, Settings, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

// Import sub-components with fallbacks
let MessageComponent: any = null
let InputForm: any = null
let ThinkingDisplay: any = null
let Suggestions: any = null

try {
  MessageComponent = require("./message").default
} catch {
  console.warn("Message component not found, using fallback")
}

try {
  InputForm = require("./input-form").default
} catch {
  console.warn("InputForm component not found, using fallback")
}

try {
  ThinkingDisplay = require("./thinking-display").default
} catch {
  console.warn("ThinkingDisplay component not found, using fallback")
}

try {
  Suggestions = require("./suggestions").default
} catch {
  console.warn("Suggestions component not found, using fallback")
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  processingTime?: number
  thinkingSteps?: any[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `🎉 ZacAI System Online!

I'm your AI assistant, ready to help with:

• Basic chat and responses
• Simple math calculations (5+5)
• Name recognition (my name is...)
• System status and help
• Admin dashboard (type "admin")

What would you like to do?`,
      timestamp: Date.now(),
      confidence: 1.0,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState<any[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>({
    initialized: true,
    totalQueries: 0,
    successRate: 1.0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinkingSteps])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
    setIsThinking(true)
    setCurrentThinkingSteps([])

    try {
      const startTime = Date.now()
      let response = ""
      let confidence = 0.8
      const lowerInput = input.toLowerCase()

      // Simple AI logic
      if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
        response = "🔧 Switching to Admin Dashboard..."
        confidence = 0.95
        setTimeout(() => onToggleAdmin(), 1000)
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

      const processingTime = Date.now() - startTime

      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response,
          timestamp: Date.now(),
          confidence,
          sources: ["core"],
          processingTime,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsThinking(false)
        setCurrentThinkingSteps([])
        setSystemStatus((prev: any) => ({
          ...prev,
          totalQueries: prev.totalQueries + 1,
        }))
      }, 1000)
    } catch (error) {
      console.error("Error processing query:", error)

      setTimeout(() => {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: Date.now(),
          confidence: 0,
          sources: ["error"],
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsThinking(false)
        setCurrentThinkingSteps([])
      }, 500)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Assistant</h1>
              <p className="text-sm text-gray-600">Enhanced AI with modular intelligence</p>
            </div>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              {systemStatus?.initialized ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-gray-600">
              <p>{systemStatus?.totalQueries || 0} queries processed</p>
              <p>{Math.round((systemStatus?.successRate || 0) * 100)}% success rate</p>
            </div>
            <Button variant="outline" size="sm" onClick={onToggleAdmin}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <Card className={`${message.type === "user" ? "bg-blue-50 border-blue-200" : "bg-white"}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatTimestamp(message.timestamp)}</span>

                            {message.type === "assistant" && (
                              <div className="flex items-center gap-2">
                                {message.processingTime && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {message.processingTime}ms
                                  </Badge>
                                )}

                                {message.confidence !== undefined && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getConfidenceColor(message.confidence)}`}
                                  >
                                    {message.confidence >= 0.8 ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {Math.round(message.confidence * 100)}%
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {message.sources && message.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                              {message.sources.map((source, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <span className="mr-1">🤖</span>
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
            ))}

            {isLoading && !isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing your request...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: 'Hi, I'm Ron' or 'define algorithm' or '2+2*3' or 'what is quantum physics?'"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
