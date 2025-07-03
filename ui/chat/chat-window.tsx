"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { systemManager } from "@/core/system/manager"
import {
  Brain,
  MessageCircle,
  Send,
  Settings,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Calculator,
  BookOpen,
  Globe,
  User,
  Loader2,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
  thinking?: string[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing ZacAI System...")

      await systemManager.initialize()
      console.log("✅ ZacAI System initialized successfully")

      setIsInitializing(false)

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `🧠 **ZacAI Enhanced System v2.0** is now online!

I'm your advanced AI assistant with comprehensive knowledge modules:

📚 **Vocabulary** - Dictionary definitions and word analysis
🧮 **Mathematics** - Basic arithmetic to Tesla/Vortex mathematics  
🌍 **Facts** - Wikipedia integration and verified information
💻 **Coding** - Programming concepts and Next.js examples
🤔 **Philosophy** - Philosophical concepts and discussions
👤 **User Memory** - Personal preferences and conversation history

**Try asking me:**
• "Define quantum physics"
• "Calculate 15 × 23"
• "Tell me about artificial intelligence"
• "How do I create a React component?"
• "What is consciousness?"
• "My name is [your name]"

What would you like to explore today?`,
        timestamp: Date.now(),
        confidence: 1.0,
        sources: ["system"],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("❌ Failed to initialize:", error)
      setError("System initialization failed. Some features may be limited.")
      setIsInitializing(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      console.log("🤖 Processing message:", userInput)

      const response = await systemManager.processInput(userInput)
      console.log("✅ System Response:", response)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources || [],
        reasoning: response.reasoning || [],
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return "text-green-600"
    if (confidence > 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Initializing ZacAI System</h2>
            <p className="text-gray-600 mb-4">Loading knowledge modules and AI engines...</p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Enhanced System</h1>
              <p className="text-sm text-gray-600">Advanced AI Assistant v2.0</p>
            </div>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              Online
            </Badge>
          </div>

          <Button variant="outline" size="sm" onClick={onToggleAdmin}>
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Brain className="w-16 h-16 text-blue-600 opacity-50" />
                  <Calculator className="w-12 h-12 text-green-600 opacity-30" />
                  <BookOpen className="w-12 h-12 text-purple-600 opacity-30" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello! I'm ZacAI 🧠</h2>
                <p className="text-gray-600 mb-8">I'm an enhanced AI system with advanced knowledge modules!</p>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("2+2=")}
                    className="text-left justify-start"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    2+2=
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Define quantum")}
                    className="text-left justify-start"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Define quantum
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("My name is Alex")}
                    className="text-left justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    My name is Alex
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Tell me about AI")}
                    className="text-left justify-start"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Tell me about AI
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                  {message.role === "assistant" && (
                    <div className="space-y-3 mt-4">
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe className="w-3 h-3" />
                            <span>Knowledge sources:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.confidence && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span className={getConfidenceColor(message.confidence)}>
                                {Math.round(message.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            onClick={() => console.log("Positive feedback")}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            onClick={() => console.log("Negative feedback")}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="text-xs opacity-70 mt-2">{formatTimestamp(message.timestamp)}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">ZacAI is thinking...</span>
                    <MessageCircle className="w-4 h-4 text-gray-400 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything - vocabulary, math, facts, coding, philosophy..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm max-w-4xl mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
