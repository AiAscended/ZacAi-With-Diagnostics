"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { systemManager } from "@/core/system/manager"
import { formatDateTime, formatConfidence } from "@/utils/formatters"
import type { ChatMessage, SystemStats } from "@/types/global"
import { Send, Brain, Settings, BarChart3, User, Lightbulb } from "lucide-react"

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setIsLoading(true)
      await systemManager.initialize()
      setIsInitialized(true)
      updateStats()

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm ZacAI, your enhanced AI assistant. I can help with vocabulary, mathematics, coding, facts, philosophy, and remember personal information. What would you like to explore today?",
          timestamp: Date.now(),
          confidence: 1.0,
          sources: ["system"],
        },
      ])
    } catch (error) {
      console.error("Failed to initialize system:", error)
      setMessages([
        {
          id: "error",
          role: "assistant",
          content: "I encountered an error during initialization. Please refresh the page to try again.",
          timestamp: Date.now(),
          confidence: 0.1,
          sources: ["system-error"],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = () => {
    if (systemManager.isInitialized()) {
      setSystemStats(systemManager.getSystemStats())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isInitialized) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await systemManager.processInput(input.trim())

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        sources: response.sources,
        reasoning: response.reasoning,
        thinking: response.thinking,
      }

      setMessages((prev) => [...prev, assistantMessage])
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        confidence: 0.1,
        sources: ["system-error"],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const clearChat = () => {
    setMessages([
      {
        id: "cleared",
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: Date.now(),
        confidence: 1.0,
        sources: ["system"],
      },
    ])
  }

  const renderMessage = (message: ChatMessage) => (
    <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block max-w-[80%] p-3 rounded-lg ${
          message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900 border"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {message.role === "assistant" && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Confidence: {formatConfidence(message.confidence || 0)}</span>
              <span>{formatDateTime(message.timestamp)}</span>
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-1">
                <span className="font-medium">Sources: </span>
                {message.sources.map((source, idx) => (
                  <Badge key={idx} variant="secondary" className="mr-1 text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            )}

            {message.reasoning && message.reasoning.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer font-medium">Reasoning</summary>
                <ul className="mt-1 ml-4 list-disc">
                  {message.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-xs">
                      {reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderStats = () => {
    if (!systemStats) return <div>Loading stats...</div>

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{systemStats.initialized ? "✅ Online" : "❌ Offline"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Uptime</div>
                <div className="font-medium">{Math.floor(systemStats.uptime / 1000 / 60)} minutes</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Queries</div>
                <div className="font-medium">{systemStats.totalQueries}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg Response Time</div>
                <div className="font-medium">{Math.round(systemStats.averageResponseTime)}ms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(systemStats.modules).map(([name, stats]) => (
                <div key={name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="capitalize font-medium">{name}</span>
                    <span className="text-sm text-gray-500">{formatConfidence(stats.successRate)}</span>
                  </div>
                  <Progress value={stats.successRate * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stats.totalQueries} queries</span>
                    <span>{stats.learntEntries} learned</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            ZacAI Enhanced
          </h1>
          <p className="text-sm text-gray-500 mt-1">Advanced AI Assistant v2.0</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 px-4 pb-4">
            <TabsContent value="chat" className="mt-0 h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Chat Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={clearChat} variant="outline" className="w-full bg-transparent">
                    Clear Chat
                  </Button>

                  <Separator />

                  <div>
                    <div className="text-sm font-medium mb-2">Quick Actions</div>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setInput("Define consciousness")}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Define a word
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setInput("Calculate 123 + 456")}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Do math
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setInput("Tell me about quantum physics")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Learn facts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-0 h-full overflow-auto">
              {renderStats()}
            </TabsContent>

            <TabsContent value="settings" className="mt-0 h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Theme</label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Max Context Length</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded"
                        defaultValue={10}
                        min={5}
                        max={50}
                      />
                    </div>

                    <Button className="w-full">Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI Chat</h2>
              <p className="text-sm text-gray-500">{isInitialized ? "Ready to help" : "Initializing..."}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isInitialized ? "default" : "secondary"}>{isInitialized ? "Online" : "Offline"}</Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading || !isInitialized}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !isInitialized || !input.trim()} className="px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
