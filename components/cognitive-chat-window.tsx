"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Brain, Zap, Database, MessageSquare } from "lucide-react"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  reasoning?: string[]
}

export default function CognitiveChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSystem] = useState(() => new CognitiveAISystem())
  const [stats, setStats] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await aiSystem.initialize()
        updateStats()
      } catch (error) {
        console.error("Failed to initialize AI system:", error)
      }
    }
    initializeSystem()
  }, [aiSystem])

  const updateStats = () => {
    const currentStats = aiSystem.getStats()
    setStats(currentStats)
    console.log("📊 Stats update:", {
      mathFunctions: currentStats.mathFunctions,
      memoryEntries: currentStats.memoryEntries,
      personalInfo: currentStats.personalInfoData?.size || 0,
      facts: currentStats.factsData?.size || 0,
      memory: currentStats.memoryData?.size || 0,
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const response = await aiSystem.processMessage(input.trim())
      const responseTime = Date.now() - startTime

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        reasoning: response.reasoning,
      }

      setMessages((prev) => [...prev, assistantMessage])
      updateStats()

      console.log(`⚡ Response time: ${responseTime}ms`)
      console.log(`🎯 Confidence: ${response.confidence}`)
      if (response.reasoning) {
        console.log("🧠 Reasoning:", response.reasoning)
      }
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Cognitive AI Assistant</h1>
                <p className="text-sm text-gray-500">Advanced reasoning and memory</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>{stats.memoryEntries || 0} memories</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{stats.totalMessages || 0} messages</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">I'm ready to learn about you and help with various tasks.</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" && <Bot className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />}
                    {message.role === "user" && <User className="w-4 h-4 mt-0.5 text-blue-100 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      {message.confidence !== undefined && (
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(message.confidence * 100)}% confident
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="bg-white border-t px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="w-80 bg-white border-l">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Cognitive Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Memory Entries:</span>
                  <span className="font-medium">{stats.memoryEntries || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vocabulary:</span>
                  <span className="font-medium">{stats.vocabularySize || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Confidence:</span>
                  <span className="font-medium">{stats.avgConfidence || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.systemStatus || "Ready"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Math Functions:</span>
                  <span className="font-medium">{stats.mathFunctions || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
