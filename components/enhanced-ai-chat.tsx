"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThumbsUp, ThumbsDown, Brain, Database, MessageSquare, Settings, BarChart3, BookOpen } from "lucide-react"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import ErrorBoundary from "./error-boundary"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

const EnhancedAIChat: React.FC = () => {
  const [aiSystem] = useState(() => new CognitiveAISystem())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>({
    totalMessages: 0,
    vocabularySize: 0,
    memoryEntries: 0,
    avgConfidence: 0,
    systemStatus: "initializing",
    mathFunctions: 0,
    totalLearned: 0,
    systemName: "ZacAI",
    systemVersion: "2.0.0",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      console.log("🚀 Initializing Enhanced AI Chat System...")

      // Initialize the AI system
      await aiSystem.initialize()

      // Load conversation history
      const history = aiSystem.getConversationHistory()
      setMessages(history)

      // Update stats
      updateStats()

      console.log("✅ Enhanced AI Chat System initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize Enhanced AI Chat System:", error)
      // Set fallback stats
      setStats((prev) => ({
        ...prev,
        systemStatus: "ready",
        systemName: "ZacAI",
        systemVersion: "2.0.0",
      }))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    try {
      const newStats = aiSystem.getStats()
      setStats(newStats)
      console.log("📊 Updated stats:", newStats)
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      console.log("🤖 Processing message:", userInput)

      // Process message with enhanced AI system
      const response = await aiSystem.processMessage(userInput)

      console.log("✅ AI Response:", response)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
      }

      setMessages((prev) => [...prev, aiMessage])
      updateStats()
    } catch (error) {
      console.error("❌ Error processing message:", error)

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.1,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    aiSystem.processFeedback(messageId, feedback)
    updateStats()
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-500"
    if (confidence > 0.7) return "bg-green-500"
    if (confidence > 0.4) return "bg-yellow-500"
    return "bg-red-500"
  }

  const renderWelcomeMessage = () => (
    <div className="text-center text-gray-500 mt-8">
      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium mb-2">
        Welcome to {stats.systemName} v{stats.systemVersion}!
      </p>
      <p className="mb-4">I'm an enhanced AI with learning capabilities and online knowledge access!</p>
      <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
        <div className="p-2 bg-blue-50 rounded">
          <strong>Try:</strong> "What's your name?"
        </div>
        <div className="p-2 bg-green-50 rounded">
          <strong>Ask:</strong> "What time is it?"
        </div>
        <div className="p-2 bg-purple-50 rounded">
          <strong>Math:</strong> "Calculate 25 × 4"
        </div>
        <div className="p-2 bg-orange-50 rounded">
          <strong>Learn:</strong> "Define quantum"
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="border-b bg-white px-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="memory" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Memory
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              <Card className="flex-1 m-4 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {stats.systemName} v{stats.systemVersion} - Enhanced AI with Learning
                    <Badge variant="outline" className="ml-auto">
                      {stats.systemStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 && renderWelcomeMessage()}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                          }`}
                        >
                          <div className="text-sm mb-1 whitespace-pre-wrap">{message.content}</div>

                          <div className="flex items-center justify-between text-xs opacity-70 mt-2">
                            <span>{formatTimestamp(message.timestamp)}</span>

                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2">
                                {message.confidence && (
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                                    <span>{Math.round(message.confidence * 100)}%</span>
                                  </div>
                                )}

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleFeedback(message.id, "positive")}
                                    className="hover:bg-green-100 p-1 rounded"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(message.id, "negative")}
                                    className="hover:bg-red-100 p-1 rounded"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[70%]">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            <span className="text-sm text-gray-500">{stats.systemName} is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Chat with ${stats.systemName}...`}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      Send
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    System Performance & Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                      <div className="text-xs text-gray-500">Total Messages</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.totalLearned}</div>
                      <div className="text-xs text-gray-500">Concepts Learned</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.vocabularySize}</div>
                      <div className="text-xs text-gray-500">Vocabulary Size</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgConfidence * 100)}%</div>
                      <div className="text-xs text-gray-500">Avg Confidence</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Learning Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Vocabulary:</strong> {stats.learnedVocabulary || 0}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Math:</strong> {stats.learnedMathematics || 0}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Science:</strong> {stats.learnedScience || 0}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Coding:</strong> {stats.learnedCoding || 0}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">System Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Name:</strong> {stats.systemName}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Version:</strong> {stats.systemVersion}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Status:</strong> {stats.systemStatus}
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <strong>Math Functions:</strong> {stats.mathFunctions}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Knowledge Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Learning Capabilities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Real-time word definitions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Mathematical calculations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span>Scientific concept research</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span>Coding assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Tesla/Vortex math patterns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                          <span>Date/time awareness</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">API Sources</h3>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Dictionary:</strong> Free Dictionary API + Wiktionary
                        </div>
                        <div>
                          <strong>Science:</strong> Wikipedia + NASA APIs
                        </div>
                        <div>
                          <strong>Math:</strong> MathJS + Local processing
                        </div>
                        <div>
                          <strong>Coding:</strong> GitHub + Stack Overflow + MDN
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memory" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Memory & Personal Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Memory System</h3>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Personal Information:</span>
                          <span>{stats.memoryEntries} entries</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversation History:</span>
                          <span>{stats.totalMessages} messages</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Learned Vocabulary:</span>
                          <span>{stats.learnedVocabulary || 0} words</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Privacy & Storage</h3>
                      <div className="text-sm space-y-1">
                        <div>• All data stored locally in your browser</div>
                        <div>• No personal information sent to external APIs</div>
                        <div>• Conversation history kept private</div>
                        <div>• You control data export and deletion</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">System Information</h3>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>AI Name:</strong> {stats.systemName}
                        </div>
                        <div>
                          <strong>Version:</strong> {stats.systemVersion}
                        </div>
                        <div>
                          <strong>Status:</strong> {stats.systemStatus}
                        </div>
                        <div>
                          <strong>Current Time:</strong> {stats.currentDateTime?.formatted?.full || "Loading..."}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Data Management</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const data = aiSystem.exportData()
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${stats.systemName}-data-${Date.now()}.json`
                            a.click()
                          }}
                          className="w-full"
                        >
                          Export All Data
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                              await aiSystem.clearAllData()
                              setMessages([])
                              updateStats()
                            }
                          }}
                          className="w-full"
                        >
                          Clear All Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default EnhancedAIChat
