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
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState("initializing")

  useEffect(() => {
    // Simple initialization that should always work
    console.log("🚀 ZacAI Starting...")

    try {
      setSystemStatus("ready")
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm ZacAI. I'm running in basic mode while my advanced systems load.",
          sender: "ai",
          timestamp: Date.now(),
          confidence: 1.0,
        },
      ])
      console.log("✅ ZacAI Basic Mode Ready")
    } catch (error) {
      console.error("❌ Initialization Error:", error)
      setSystemStatus("error")
      setMessages([
        {
          id: "error",
          content: "⚠️ System Error: Please refresh the page.",
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
      // Basic response logic - ALWAYS works
      let response = ""
      let confidence = 0.8
      const lowerInput = input.toLowerCase()

      // Basic math
      if (/^\d+[+\-*/]\d+$/.test(input.replace(/\s/g, ""))) {
        try {
          const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
          response = `${input} = ${result}`
          confidence = 0.95
        } catch {
          response = "I couldn't calculate that. Please check your math expression."
          confidence = 0.3
        }
      }
      // Greetings
      else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response =
          "Hello! I'm ZacAI, your AI assistant. I can help with basic math, answer questions, and remember information about you."
        confidence = 0.9
      }
      // Name recognition
      else if (lowerInput.includes("my name is")) {
        const nameMatch = input.match(/my name is (\w+)/i)
        if (nameMatch) {
          const name = nameMatch[1]
          localStorage.setItem("zacai_user_name", name)
          response = `Nice to meet you, ${name}! I'll remember your name.`
          confidence = 0.95
        }
      }
      // Status check
      else if (lowerInput.includes("status") || lowerInput.includes("diagnostic")) {
        const userName = localStorage.getItem("zacai_user_name")
        response = `🔍 **System Status**\n\n**Core:** ✅ Running\n**Status:** ${systemStatus}\n**Messages:** ${messages.length}\n**User:** ${userName || "Unknown"}\n**Time:** ${new Date().toLocaleTimeString()}`
        confidence = 0.95
      }
      // Default response
      else {
        response = `I received: "${input}"\n\nI'm currently in basic mode. My advanced modules are being developed.`
        confidence = 0.6
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: Date.now(),
        confidence,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("❌ Processing Error:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "⚠️ Sorry, I encountered an error. Please try again.",
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
