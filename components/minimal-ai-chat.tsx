"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Calculator, MessageCircle } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export default function MinimalAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const processMessage = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Simple math processing
    const mathMatch = userMessage.match(/(\d+)\s*([+\-*/×÷])\s*(\d+)/)
    if (mathMatch) {
      const [, num1, operator, num2] = mathMatch
      const a = Number.parseFloat(num1)
      const b = Number.parseFloat(num2)
      let result = 0

      switch (operator) {
        case "+":
          result = a + b
          break
        case "-":
          result = a - b
          break
        case "*":
        case "×":
          result = a * b
          break
        case "/":
        case "÷":
          result = b !== 0 ? a / b : 0
          break
      }

      return `🧮 **Mathematical Calculation**\n\n**Problem:** ${a} ${operator} ${b} = **${result}**\n\nI calculated this using basic arithmetic operations!`
    }

    // Personal info detection
    if (lowerMessage.includes("my name is")) {
      const nameMatch = userMessage.match(/my name is (\w+)/i)
      const name = nameMatch ? nameMatch[1] : "there"
      return `Nice to meet you, ${name}! I'll remember that. I'm ZacAI, and I can help with math calculations and conversations.`
    }

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello! I'm ZacAI 🧠. I can help with:\n\n• Math calculations (try "2 + 2")\n• Remember personal information\n• Have conversations\n\nWhat would you like to explore?`
    }

    // Math requests
    if (lowerMessage.includes("math") || lowerMessage.includes("calculate")) {
      return `I can help with math! Try asking me something like:\n\n• "5 + 3"\n• "12 × 4"\n• "100 ÷ 5"\n• "15 - 7"\n\nWhat calculation would you like me to do?`
    }

    // Capabilities
    if (lowerMessage.includes("what can you do") || lowerMessage.includes("help")) {
      return `I'm ZacAI, and here's what I can do:\n\n🧮 **Mathematics**: Basic arithmetic (+, -, ×, ÷)\n👤 **Memory**: Remember information about you\n💬 **Chat**: Have conversations\n\nThis is a minimal version running in safe mode. Try asking me to calculate something or tell me your name!`
    }

    // Default response
    return `I understand you said: "${userMessage}"\n\nI'm running in minimal mode right now. I can help with:\n• Basic math (try "5 + 3")\n• Remembering your name\n• Simple conversations\n\nWhat would you like to try?`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate thinking time
    setTimeout(() => {
      const response = processMessage(userInput)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 500)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="h-screen bg-gray-50 p-4">
      <Card className="h-full max-w-4xl mx-auto flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            ZacAI - Minimal Mode
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </CardTitle>
          <p className="text-sm text-gray-600">Running in safe mode - Basic functionality only</p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="w-12 h-12 opacity-50" />
                  <Calculator className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-lg font-medium mb-2">Hello! I'm ZacAI 🧠</p>
                <p className="mb-4">I'm running in minimal mode. I can help with basic math and conversations!</p>

                <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("5 + 3")}
                    className="text-left justify-start"
                  >
                    <Calculator className="w-4 h-4 mr-2" />5 + 3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("My name is John")}
                    className="text-left justify-start"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    My name is John
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("What can you do?")}
                    className="text-left justify-start"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    What can you do?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("12 × 4")}
                    className="text-left justify-start"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    12 × 4
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <div className="text-sm mb-2 whitespace-pre-line">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">{formatTimestamp(message.timestamp)}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-500">ZacAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: '5 + 3' or 'My name is...' or 'What can you do?'"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
