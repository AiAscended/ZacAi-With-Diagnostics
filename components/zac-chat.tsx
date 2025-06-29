"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZacAI } from "@/lib/zac-ai"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export function ZacChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [ai] = useState(() => new ZacAI())
  const [stats, setStats] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAI()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeAI = async () => {
    try {
      await ai.initialize()
      setStats(ai.getStats())

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "👋 Hello! I'm ZacAI, your simple and effective AI assistant. I can help with math calculations, word definitions, and I'll remember personal information about you. What's your name?",
        timestamp: Date.now(),
        confidence: 0.95,
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize AI:", error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await ai.processMessage(input)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
      }

      setMessages((prev) => [...prev, aiMessage])
      setStats(ai.getStats())
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.3,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <h1 className="text-2xl font-bold text-gray-900">ZacAI Chat</h1>
          <p className="text-gray-600">Simple, effective AI assistant</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.confidence && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(message.confidence * 100)}% confident
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500">ZacAI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="w-80 bg-white border-l p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Vocabulary:</span>
              <Badge>{stats.vocabularySize || 0} words</Badge>
            </div>
            <div className="flex justify-between">
              <span>Mathematics:</span>
              <Badge>{stats.mathFunctions || 0} concepts</Badge>
            </div>
            <div className="flex justify-between">
              <span>Personal Info:</span>
              <Badge>{stats.memoryEntries || 0} entries</Badge>
            </div>
            <div className="flex justify-between">
              <span>Messages:</span>
              <Badge>{messages.length} total</Badge>
            </div>
            {stats.breakdown && (
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">Breakdown:</div>
                <div className="text-xs space-y-1">
                  <div>Seed vocab: {stats.breakdown.seedVocab}</div>
                  <div>Learned vocab: {stats.breakdown.learnedVocab}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
