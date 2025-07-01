"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  ChevronDown,
  ChevronUp,
  Calculator,
  BookOpen,
  Globe,
  User,
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
  const [currentThinking, setCurrentThinking] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

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

📚 **Vocabulary** - Dictionary, definitions, etymology
🧮 **Mathematics** - Basic arithmetic to Tesla/Vortex math  
🌍 **Facts** - Wikipedia integration and verified information
💻 **Coding** - Programming concepts and examples
🤔 **Philosophy** - Philosophical concepts and arguments
👤 **User Info** - Personal preferences and learning tracking

**Try asking me:**
• "Define quantum physics"
• "Calculate 15 × 23"
• "Tell me about artificial intelligence"
• "How do I code a function?"
• "What is consciousness?"

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

  const simulateThinking = async (userInput: string): Promise<string[]> => {
    const thinkingSteps = [
      "🧠 Analyzing input with reasoning engine...",
      "🔍 Determining intent and extracting entities...",
      "📚 Consulting knowledge modules...",
      "🔗 Cross-referencing information...",
      "💭 Generating response with confidence scoring...",
      "✨ Finalizing answer...",
    ]

    const finalThinking: string[] = []

    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      finalThinking.push(thinkingSteps[i])
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    return finalThinking
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setIsThinking(true)
    setCurrentThinking("")
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

      const thinkingSteps = await simulateThinking(userInput)

      const response = await systemManager.processInput(userInput)
      console.log("✅ System Response:", response)

      setIsThinking(false)
      setCurrentThinking("")

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources || [],
        reasoning: response.reasoning || [],
        thinking: thinkingSteps,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
      setIsThinking(false)
      setCurrentThinking("")
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
      <div className="h-full flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Initializing ZacAI System</h2>
            <p className="text-gray-600 mb-4">Loading knowledge modules and AI engines...</p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded mb-2"></div>
              <div className="h-2 bg-blue-300 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <CardTitle className="text-lg">ZacAI Enhanced System</CardTitle>
              <p className="text-sm text-white/80">Advanced AI Assistant v2.0</p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              Enhanced
            </Badge>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>

          <Button variant="ghost" size="sm" onClick={onToggleAdmin} className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="w-12 h-12 opacity-50" />
                  <Calculator className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-lg font-medium mb-2">Hello! I'm ZacAI 🧠</p>
                <p className="mb-4">I'm an enhanced AI system with advanced knowledge modules!</p>

                <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
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
                    onClick={() => setInput("System diagnostics")}
                    className="text-left justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    System diagnostics
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                  {message.role === "assistant" && (
                    <div className="space-y-3 mt-3">
                      {message.thinking && message.thinking.length > 0 && (
                        <div className="border-l-2 border-blue-300 pl-3">
                          <button
                            onClick={() => setShowThinking((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
                          >
                            {showThinking[message.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            <Brain className="w-3 h-3" />
                            <span>AI Thinking Process</span>
                          </button>
                          {showThinking[message.id] && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded space-y-1">
                              {message.thinking.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

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

                      <div className="flex items-center justify-between text-xs opacity-70">
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
                            className="h-6 w-6 p-0"
                            onClick={() => console.log("Positive feedback")}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
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

            {isThinking && currentThinking && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                    <Brain className="w-4 h-4 text-orange-600 animate-pulse" />
                    <span className="text-sm text-orange-700 italic">{currentThinking}</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-500">ZacAI is processing...</span>
                    <MessageCircle className="w-4 h-4 text-gray-400 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-3">
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

        {error && <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      </div>
    </Card>
  )
}
