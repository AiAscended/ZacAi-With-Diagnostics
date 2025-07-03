"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { systemManager } from "@/core/system/manager"
import { Send, Bot, User, Brain, Settings, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  processingTime?: number
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load system status
    const stats = systemManager.getSystemStats()
    setSystemStatus(stats)

    // Load chat history
    const chatLog = systemManager.getChatLog()
    const formattedMessages: Message[] = chatLog.flatMap((entry: any) => [
      {
        id: `${entry.id}-user`,
        type: "user" as const,
        content: entry.input,
        timestamp: entry.timestamp,
      },
      {
        id: `${entry.id}-assistant`,
        type: "assistant" as const,
        content: entry.response,
        timestamp: entry.timestamp,
        confidence: entry.confidence,
        sources: entry.sources,
        processingTime: entry.processingTime,
      },
    ])

    setMessages(formattedMessages)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const response = await systemManager.processQuery(userMessage.content)
      const processingTime = Date.now() - startTime

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        processingTime,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing query:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "vocabulary":
        return "📚"
      case "mathematics":
        return "🔢"
      case "facts":
        return "🌍"
      case "coding":
        return "💻"
      case "philosophy":
        return "💭"
      case "user-info":
        return "👤"
      default:
        return "🤖"
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Assistant</h1>
              <p className="text-sm text-gray-600">Enhanced AI with modular intelligence</p>
            </div>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              {systemStatus?.initialized ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-gray-600">
              <p>{systemStatus?.totalQueries || 0} queries processed</p>
              <p>{Math.round((systemStatus?.successRate || 0) * 100)}% success rate</p>
            </div>
            <Button variant="outline" size="sm" onClick={onToggleAdmin}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to ZacAI</h3>
                  <p className="text-gray-600 mb-4">
                    I'm your enhanced AI assistant with specialized modules for vocabulary, mathematics, facts, coding,
                    and philosophy.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">📚 Dictionary Lookups</Badge>
                    <Badge variant="outline">🔢 Tesla Mathematics</Badge>
                    <Badge variant="outline">🌍 Wikipedia Facts</Badge>
                    <Badge variant="outline">💻 Next.js Coding</Badge>
                    <Badge variant="outline">💭 Philosophy</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <Card className={`${message.type === "user" ? "bg-blue-50 border-blue-200" : "bg-white"}`}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatTimestamp(message.timestamp)}</span>

                          {message.type === "assistant" && (
                            <div className="flex items-center gap-2">
                              {message.processingTime && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {message.processingTime}ms
                                </Badge>
                              )}

                              {message.confidence !== undefined && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getConfidenceColor(message.confidence)}`}
                                >
                                  {message.confidence >= 0.8 ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {Math.round(message.confidence * 100)}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {message.sources && message.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                            {message.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <span className="mr-1">{getSourceIcon(source)}</span>
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing your request...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about vocabulary, mathematics, facts, coding, or philosophy..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
