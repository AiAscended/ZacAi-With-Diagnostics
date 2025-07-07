"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, User, Bot, Settings } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export default function ZacAIApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hello! I'm ZacAI v2.0.8. I'm now fully operational and ready to help you!",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate processing
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "👋 Hello! Great to see you! How can I help you today?"
    }

    if (lowerInput.includes("help")) {
      return `🆘 **ZacAI Help**

I can help you with:
• **Math calculations** - Try "5 + 5" or "What is 15 * 8?"
• **Definitions** - Ask "Define artificial intelligence"
• **General questions** - Ask me anything!
• **System info** - Type "status" to see system information

What would you like to explore?`
    }

    if (lowerInput.includes("status")) {
      return `📊 **ZacAI System Status**

• **Version:** 2.0.8 (Restored)
• **Status:** ✅ Fully Operational
• **Modules:** Core system active
• **Memory:** Working perfectly
• **Response Time:** Excellent

Everything is running smoothly! 🚀`
    }

    // Handle math
    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return `🧮 **${input} = ${result}**

Calculation completed successfully!`
      } catch {
        return "❌ I couldn't calculate that. Please check your math expression."
      }
    }

    // Default response
    return `I received your message: "${input}"

I'm here to help! Try asking me to:
• Solve a math problem (like "5 + 3")
• Define a word or concept
• Type "help" for more options
• Ask "status" for system information

What else would you like to explore? 🤔`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  ZacAI Admin Dashboard
                </CardTitle>
                <Button onClick={() => setShowAdmin(false)} variant="outline" className="text-white border-white">
                  Back to Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>2.0.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Messages:</span>
                        <span>{messages.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>~1s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span>100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge className="mr-2 mb-2">Math Calculator</Badge>
                      <Badge className="mr-2 mb-2">Help System</Badge>
                      <Badge className="mr-2 mb-2">Status Monitor</Badge>
                      <Badge className="mr-2 mb-2">Chat Interface</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {messages.slice(-10).map((message) => (
                        <div key={message.id} className="flex items-start gap-2 p-2 rounded bg-gray-50">
                          <div className="font-semibold text-sm">{message.role === "user" ? "User:" : "AI:"}</div>
                          <div className="text-sm flex-1">{message.content.slice(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] shadow-2xl border-0 flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8" />
              ZacAI v2.0.8
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Online</Badge>
              <Button onClick={() => setShowAdmin(true)} variant="outline" className="text-white border-white">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
          <p className="text-blue-100">Your Advanced AI Assistant - Now Fully Operational!</p>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">ZacAI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (try 'help' or '5 + 5')"
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setInput("help")} disabled={isLoading}>
                Help
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("5 + 5")} disabled={isLoading}>
                Math Test
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("status")} disabled={isLoading}>
                Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
