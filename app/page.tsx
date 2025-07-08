"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"

export default function HomePage() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: "user" | "ai" }>>([])
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { id: Date.now().toString(), text: input, sender: "user" as const }
    const aiResponse = { id: (Date.now() + 1).toString(), text: `You said: ${input}`, sender: "ai" as const }

    setMessages((prev) => [...prev, userMessage, aiResponse])
    setInput("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ZacAI v100
                </h1>
                <p className="text-sm text-gray-600">Your Personal AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">Chat with ZacAI</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-6">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome to ZacAI</h2>
                    <p className="text-gray-600 max-w-md">
                      Your personal AI assistant is ready to help with math calculations, general questions, and more.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline">"Hello"</Badge>
                        <Badge variant="outline">"5 + 5"</Badge>
                        <Badge variant="outline">"Help"</Badge>
                        <Badge variant="outline">"Status"</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                >
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
