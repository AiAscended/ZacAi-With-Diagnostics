"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  reasoning?: string[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState("loading")

  useEffect(() => {
    // Initialize the app - this should always work
    try {
      console.log("🚀 ZacAI App Starting...")
      setSystemStatus("ready")

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm ZacAI. I'm loading my core systems...",
          sender: "ai",
          timestamp: Date.now(),
          confidence: 1.0,
        },
      ])

      console.log("✅ ZacAI App Loaded Successfully")
    } catch (error) {
      console.error("❌ App Loading Error:", error)
      setSystemStatus("error")
      setMessages([
        {
          id: "error",
          content: "⚠️ System Error: App failed to load properly. Please refresh the page.",
          sender: "ai",
          timestamp: Date.now(),
          confidence: 0,
        },
      ])
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Basic response logic - this should always work
      let response = ""
      let confidence = 0.8
      let reasoning = ["Basic response"]

      const lowerInput = input.toLowerCase()

      if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response = "Hello! I'm ZacAI, your AI assistant. I can help with basic tasks."
        confidence = 0.9
        reasoning = ["Greeting detected"]
      } else if (lowerInput.includes("status") || lowerInput.includes("diagnostic")) {
        response = `🔍 **System Status**\n\n**Core App:** ✅ Running\n**Status:** ${systemStatus}\n**Messages:** ${messages.length}\n**Time:** ${new Date().toLocaleTimeString()}`
        confidence = 0.95
        reasoning = ["System diagnostic"]
      } else if (lowerInput.includes("name")) {
        response = "I'm ZacAI, your AI assistant. What's your name?"
        confidence = 0.9
        reasoning = ["Name inquiry"]
      } else {
        response = `I received your message: "${input}"\n\nI'm currently in basic mode. My advanced features are being loaded.`
        confidence = 0.7
        reasoning = ["Basic echo response"]
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: Date.now(),
        confidence,
        reasoning,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("❌ Message Processing Error:", error)

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "⚠️ Sorry, I encountered an error processing your message. Please try again.",
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <span>ZacAI Assistant</span>
              <Badge
                variant={systemStatus === "ready" ? "default" : systemStatus === "error" ? "destructive" : "secondary"}
              >
                {systemStatus}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.confidence !== undefined && (
                        <div className="text-xs mt-2 opacity-70">
                          Confidence: {Math.round(message.confidence * 100)}%
                          {message.reasoning && <div className="mt-1">Reasoning: {message.reasoning.join(", ")}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
