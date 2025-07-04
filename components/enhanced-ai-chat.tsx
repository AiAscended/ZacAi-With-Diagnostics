"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, User, Bot, Settings } from "lucide-react"
import { SimpleAISystem } from "@/lib/simple-ai-system"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  confidence?: number
  reasoning?: string[]
}

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [aiSystem, setAiSystem] = useState<SimpleAISystem | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAI()
  }, [])

  const initializeAI = async () => {
    try {
      console.log("🚀 Initializing AI System...")
      setIsInitializing(true)

      const system = new SimpleAISystem()
      await system.initialize()

      setAiSystem(system)
      setIsInitializing(false)

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content:
          "Hello! I'm ZacAI, your AI assistant. I can help with math, vocabulary, and remember personal information. What's your name?",
        sender: "ai",
        timestamp: new Date(),
        confidence: 1.0,
      }
      setMessages([welcomeMessage])

      console.log("✅ AI System initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize AI system:", error)
      setIsInitializing(false)

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error during initialization. Please refresh the page to try again.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages([errorMessage])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !aiSystem || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiSystem.processMessage(input.trim())

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content || "I'm not sure how to respond to that.",
        sender: "ai",
        timestamp: new Date(),
        confidence: response.confidence,
        reasoning: response.reasoning,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your message. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h2 className="text-lg font-semibold mb-2">Initializing ZacAI</h2>
            <p className="text-sm text-muted-foreground text-center">
              Loading vocabulary, mathematics, and core systems...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            ZacAI Chat
            <Badge variant="secondary" className="ml-auto">
              v2.0.0
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="flex-shrink-0">
                      {message.sender === "user" ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || !aiSystem}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !aiSystem || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{aiSystem ? `System ready • ${messages.length} messages` : "System not ready"}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
