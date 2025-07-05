"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Settings } from "lucide-react"

// Simple Chat Component
function ChatWindow({ onToggleAdmin }: { onToggleAdmin: () => void }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "assistant" as const,
      content: "Hello! I'm ZacAI. How can I help you today?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simple AI response logic
    setTimeout(() => {
      let response = ""
      const lowerInput = input.toLowerCase()

      if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response = "Hello! Nice to meet you. How can I assist you today?"
      } else if (lowerInput.includes("help")) {
        response = "I can help you with basic questions, math, and general conversation. What would you like to know?"
      } else if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input)) {
        try {
          const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
          response = `${input} = ${result}`
        } catch {
          response = "I couldn't calculate that. Please check your math expression."
        }
      } else {
        response = `You said: "${input}". I'm here to help! Try asking me something or type "help" for more options.`
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">ZacAI Chat</h1>
              <p className="text-sm text-gray-600">Your AI Assistant</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
          <Button onClick={onToggleAdmin} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <Card className={`max-w-xs ${message.type === "user" ? "bg-blue-100" : "bg-white"}`}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

// Simple Admin Component
function AdminDashboard({ onToggleChat }: { onToggleChat: () => void }) {
  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">ZacAI Admin Dashboard</h1>
          <Button onClick={onToggleChat} variant="outline">
            Back to Chat
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
              <p className="text-sm text-gray-600 mt-2">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Total conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-gray-600">System availability</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className="bg-green-100 text-green-800">Running</Badge>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span>Production</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main App Component
export default function Home() {
  const [mode, setMode] = useState<"chat" | "admin">("chat")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple initialization
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Loading ZacAI</h2>
            <p className="text-gray-600">Initializing system...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "admin") {
    return <AdminDashboard onToggleChat={() => setMode("chat")} />
  }

  return <ChatWindow onToggleAdmin={() => setMode("admin")} />
}
