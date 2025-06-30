"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Brain, Lightbulb, Settings, User } from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { formatRelativeTime, formatConfidence } from "@/utils/formatters"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
}

interface ChatWindowProps {
  onToggleAdmin?: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      await systemManager.initialize()
      setIsInitialized(true)

      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content:
          "👋 Hello! I'm ZacAI, your advanced AI assistant. I can help you with vocabulary, mathematics (including Tesla/Vortex math), facts, coding, philosophy, and much more. What would you like to explore today?",
        timestamp: Date.now(),
        confidence: 1.0,
        sources: ["system"],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize system:", error)

      const errorMessage: Message = {
        id: "error",
        role: "assistant",
        content:
          "⚠️ System initialization failed. Some features may not work properly. Please refresh the page to try again.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["system"],
      }

      setMessages([errorMessage])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isInitialized) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setShowThinking(true)
    setThinkingSteps([])

    try {
      // Simulate thinking process with realistic steps
      const thinkingStepsArray = [
        "🔍 Analyzing your input for intent and context...",
        "🧠 Determining which knowledge modules to consult...",
        "⚡ Processing with vocabulary, math, facts, and other engines...",
        "🔗 Cross-referencing information and building connections...",
        "✨ Synthesizing the best response with confidence scoring...",
      ]

      for (let i = 0; i < thinkingStepsArray.length; i++) {
        setThinkingSteps((prev) => [...prev, thinkingStepsArray[i]])
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      const response = await systemManager.processInput(userMessage.content)

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
      console.error("Error processing input:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: Date.now(),
        confidence: 0,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setShowThinking(false)
      setThinkingSteps([])
    }
  }

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          message.role === "user"
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-white text-gray-900 border border-gray-200 shadow-sm"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

        <div className="flex items-center justify-between mt-3 text-xs opacity-70">
          <span>{formatRelativeTime(message.timestamp)}</span>

          {message.role === "assistant" && (
            <div className="flex items-center gap-2">
              {message.confidence !== undefined && (
                <Badge
                  variant={
                    message.confidence > 0.7 ? "default" : message.confidence > 0.4 ? "secondary" : "destructive"
                  }
                  className="text-xs px-2 py-1"
                >
                  {formatConfidence(message.confidence)}
                </Badge>
              )}

              {message.sources && message.sources.length > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}
        </div>

        {message.reasoning && message.reasoning.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100 flex items-center gap-1">
              <Lightbulb className="inline w-3 h-3" />
              View reasoning steps
            </summary>
            <div className="mt-2 text-xs opacity-80 space-y-1">
              {message.reasoning.map((step, index) => (
                <div key={index} className="ml-4 flex items-start gap-2">
                  <span className="text-blue-500 font-mono">{index + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )

  const renderThinkingProcess = () => (
    <div className="flex justify-start mb-6">
      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-yellow-50 border border-yellow-200">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-yellow-600 animate-pulse" />
          <span className="text-sm font-medium text-yellow-800">ZacAI is thinking...</span>
        </div>

        <div className="space-y-2">
          {thinkingSteps.map((step, index) => (
            <div key={index} className="text-xs text-yellow-700 flex items-center gap-2 animate-fade-in">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              {step}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-yellow-200">
            <Loader2 className="w-3 h-3 animate-spin text-yellow-600" />
            <span className="text-xs text-yellow-600">Processing your request...</span>
          </div>
        )}
      </div>
    </div>
  )

  if (!isInitialized && messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardContent>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing ZacAI System</h3>
              <p className="text-sm text-gray-600">Loading knowledge modules and AI engines...</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>This may take a few moments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-blue-600" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ZacAI
              </span>
              <div className="text-xs text-gray-500 font-normal">Advanced AI Assistant</div>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {isInitialized ? "Online" : "Initializing"}
            </Badge>
            {onToggleAdmin && (
              <Button variant="ghost" size="sm" onClick={onToggleAdmin} className="text-gray-500 hover:text-gray-700">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-1">
            {messages.map(renderMessage)}
            {showThinking && renderThinkingProcess()}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about vocabulary, math, facts, coding, philosophy..."
                disabled={isLoading}
                className="pr-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !isInitialized}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Powered by modular AI architecture</span>
            <span>{messages.filter((m) => m.role === "user").length} messages sent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
