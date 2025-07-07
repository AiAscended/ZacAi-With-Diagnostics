"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Settings, Loader2, User, Bot } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `🎉 **ZacAI System v2.0.8 Online!**

I'm your advanced AI assistant with modular intelligence capabilities:

• **Vocabulary & Definitions** - Word meanings, synonyms, etymology
• **Mathematics & Calculations** - Arithmetic, algebra, problem-solving  
• **Facts & Information** - General knowledge and explanations
• **Programming & Code** - JavaScript, React, web development
• **Philosophy & Ethics** - Deep thinking and moral reasoning
• **Personal Memory** - I remember what you tell me about yourself

**What would you like to explore today?**`,
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["core", "welcome"],
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingSteps])

  const simulateThinking = async (input: string) => {
    const steps = [
      "🔍 Analyzing your question...",
      "🧠 Determining relevant knowledge modules...",
      "📚 Searching knowledge base...",
      "🤔 Processing with AI reasoning...",
      "✨ Formulating comprehensive response...",
    ]

    setIsThinking(true)
    setThinkingSteps([])

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))
      setThinkingSteps((prev) => [...prev, steps[i]])
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    setIsThinking(false)
    setThinkingSteps([])
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
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // Show thinking process
      await simulateThinking(currentInput)

      // Process with system manager
      const response = await systemManager.processQuery(currentInput)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        reasoning: response.reasoning,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "❌ I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ZacAI Assistant</h1>
              <p className="text-sm text-gray-600">Advanced AI with Modular Intelligence</p>
            </div>
          </div>

          <Button onClick={onToggleAdmin} variant="outline" size="sm" className="btn-hover-effect bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.type === "user" ? "justify-end" : ""}`}>
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-3xl ${message.type === "user" ? "order-first" : ""}`}>
                <Card className={`${message.type === "user" ? "bg-blue-500 text-white" : "bg-white"} card-hover`}>
                  <CardContent className="p-4">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />

                    {message.type === "assistant" && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                        {message.confidence !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(message.confidence * 100)}% confidence
                          </Badge>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Sources: {message.sources.join(", ")}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking Animation */}
          {isThinking && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>

              <Card className="bg-white card-hover">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {thinkingSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm animate-slideIn">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        {step}
                      </div>
                    ))}
                    {thinkingSteps.length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="sticky bottom-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... (vocabulary, math, facts, coding, philosophy)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 btn-hover-effect"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
