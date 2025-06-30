"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Brain, Lightbulb } from "lucide-react"
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

export default function ChatWindow() {
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
          "👋 Hello! I'm ZacAI, your advanced AI assistant. I can help you with vocabulary, mathematics, facts, and much more. What would you like to explore today?",
        timestamp: Date.now(),
        confidence: 1.0,
        sources: ["system"],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize system:", error)
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
      // Simulate thinking process
      const thinkingSteps = [
        "Analyzing your input...",
        "Determining intent and context...",
        "Selecting relevant knowledge modules...",
        "Processing with specialized engines...",
        "Synthesizing response...",
      ]

      for (let i = 0; i < thinkingSteps.length; i++) {
        setThinkingSteps((prev) => [...prev, thinkingSteps[i]])
        await new Promise((resolve) => setTimeout(resolve, 500))
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
        content: "I apologize, but I encountered an error processing your request. Please try again.",
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
    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 border"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{formatRelativeTime(message.timestamp)}</span>

          {message.role === "assistant" && (
            <div className="flex items-center gap-2">
              {message.confidence !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {formatConfidence(message.confidence)}
                </Badge>
              )}

              {message.sources && message.sources.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}
        </div>

        {message.reasoning && message.reasoning.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
              <Lightbulb className="inline w-3 h-3 mr-1" />
              View reasoning steps
            </summary>
            <div className="mt-1 text-xs opacity-80">
              {message.reasoning.map((step, index) => (
                <div key={index} className="ml-4">
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )

  const renderThinkingProcess = () => (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-lg p-4 bg-yellow-50 border border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Thinking...</span>
        </div>

        <div className="space-y-1">
          {thinkingSteps.map((step, index) => (
            <div key={index} className="text-xs text-yellow-700 flex items-center gap-2">
              <div className="w-1 h-1 bg-yellow-500 rounded-full" />
              {step}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="w-3 h-3 animate-spin text-yellow-600" />
            <span className="text-xs text-yellow-600">Processing...</span>
          </div>
        )}
      </div>
    </div>
  )

  if (!isInitialized) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Initializing ZacAI System...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          ZacAI Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          {messages.map(renderMessage)}
          {showThinking && renderThinkingProcess()}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
