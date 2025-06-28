"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Send,
  Brain,
  Database,
  Activity,
  Settings,
  Download,
  Trash2,
  RefreshCw,
  BookOpen,
  Calculator,
  User,
  MessageSquare,
} from "lucide-react"
import { CognitiveProcessor } from "@/lib/cognitive-processor"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  reasoning?: string[]
  knowledgeUsed?: string[]
  mathAnalysis?: any
  processingTime?: number
}

interface SystemStats {
  totalMessages: number
  vocabularySize: number
  mathFunctions: number
  memoryEntries: number
  totalLearned: number
  systemStatus: string
  avgConfidence: number
  breakdown: {
    seedVocab: number
    learnedVocab: number
    seedMath: number
    calculatedMath: number
    seedFacts: number
    learnedFacts: number
    seedCoding: number
    learnedCoding: number
  }
  vocabularyData: Map<string, any>
  mathFunctionsData: Map<string, any>
  personalInfoData: Map<string, any>
  codingData: Map<string, any>
  performanceStats: any
}

export default function EnhancedAIChat() {
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initializationProgress, setInitializationProgress] = useState(0)
  const [systemStatus, setSystemStatus] = useState("Initializing...")

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiSystemRef = useRef<CognitiveProcessor | null>(null)

  // Initialize AI system
  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      console.log("🚀 Starting Enhanced AI Chat initialization...")
      setSystemStatus("Creating cognitive processor...")
      setInitializationProgress(10)

      // Create AI system
      aiSystemRef.current = new CognitiveProcessor()

      setSystemStatus("Initializing cognitive systems...")
      setInitializationProgress(30)

      // Initialize the system
      await aiSystemRef.current.initialize()

      setSystemStatus("Loading conversation history...")
      setInitializationProgress(70)

      // Load conversation history
      const history = aiSystemRef.current.getConversationHistory()
      const formattedHistory = history.map((msg) => ({
        ...msg,
        reasoning: [],
        knowledgeUsed: [],
        processingTime: 0,
      }))
      setMessages(formattedHistory)

      setSystemStatus("Updating system statistics...")
      setInitializationProgress(90)

      // Update stats
      await updateStats()

      setSystemStatus("Ready!")
      setInitializationProgress(100)
      setIsInitialized(true)

      console.log("✅ Enhanced AI Chat initialized successfully!")
    } catch (error) {
      console.error("❌ Failed to initialize Enhanced AI Chat:", error)
      setSystemStatus(`Error: ${error}`)
    }
  }

  const updateStats = async () => {
    try {
      if (aiSystemRef.current) {
        const stats = aiSystemRef.current.getStats()
        setSystemStats(stats)
        console.log("📊 Stats updated:", stats)
      }
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !aiSystemRef.current || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("🧠 Processing message with cognitive processor...")
      const response = await aiSystemRef.current.processMessage(userMessage.content)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        reasoning: response.reasoning,
        knowledgeUsed: response.knowledgeUsed,
        mathAnalysis: response.mathAnalysis,
        processingTime: response.processingTime,
      }

      setMessages((prev) => [...prev, aiMessage])
      await updateStats()
    } catch (error) {
      console.error("❌ Error processing message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I encountered an error: ${error}. Please try again.`,
        timestamp: Date.now(),
        confidence: 0.1,
        reasoning: [`Error: ${error}`],
        knowledgeUsed: [],
        processingTime: 0,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    if (aiSystemRef.current) {
      // Clear conversation history in the AI system
      updateStats()
    }
  }

  const exportData = () => {
    if (!aiSystemRef.current) return

    try {
      const data = aiSystemRef.current.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cognitive-processor-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const refreshSystem = async () => {
    setIsLoading(true)
    try {
      await updateStats()
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show initialization screen
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Cognitive Processor</CardTitle>
            <p className="text-gray-600">Initializing advanced AI systems...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{systemStatus}</span>
                <span className="text-gray-800 font-medium">{initializationProgress}%</span>
              </div>
              <Progress value={initializationProgress} className="h-2" />
            </div>
            <div className="text-xs text-gray-500 text-center">
              Loading neural networks, knowledge bases, and cognitive systems...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Cognitive Processor</h1>
                <p className="text-sm text-gray-600">Advanced AI with neural learning & Tesla mathematics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={systemStats?.systemStatus === "ready" ? "default" : "secondary"}>
                {systemStats?.systemStatus || "Unknown"}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshSystem} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearConversation}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Cognitive Processor</h3>
                <p className="text-gray-600 mb-4">
                  I'm an advanced AI with neural learning, Tesla mathematics, and comprehensive knowledge management.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-sm">
                  <div className="p-2 bg-gray-100 rounded">
                    <Calculator className="h-4 w-4 inline mr-1" />
                    Math & Tesla patterns
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Dictionary lookups
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <Brain className="h-4 w-4 inline mr-1" />
                    Neural learning
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <User className="h-4 w-4 inline mr-1" />
                    Personal memory
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.role === "assistant" && (
                        <div className="p-1 bg-blue-100 rounded">
                          <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>

                        {message.role === "assistant" && (
                          <div className="mt-3 space-y-2">
                            {message.confidence !== undefined && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>Confidence:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${message.confidence * 100}%` }}
                                  />
                                </div>
                                <span>{Math.round(message.confidence * 100)}%</span>
                              </div>
                            )}

                            {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {message.knowledgeUsed.map((knowledge, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {knowledge}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {message.processingTime !== undefined && (
                              <div className="text-xs text-gray-400">
                                Processed in {message.processingTime.toFixed(1)}ms
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <Brain className="h-4 w-4 text-blue-600 animate-pulse" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... I can do math, define words, remember personal info, and more!"
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-hidden">
        <Tabs defaultValue="stats" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="stats" className="h-full p-4 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">System Overview</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-800">Messages</div>
                      <div className="text-blue-600">{systemStats?.totalMessages || 0}</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Vocabulary</div>
                      <div className="text-green-600">{systemStats?.vocabularySize || 0}</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="font-medium text-purple-800">Math</div>
                      <div className="text-purple-600">{systemStats?.mathFunctions || 0}</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Memory</div>
                      <div className="text-orange-600">{systemStats?.memoryEntries || 0}</div>
                    </div>
                  </div>
                </div>

                {systemStats?.breakdown && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Knowledge Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Seed Vocabulary:</span>
                        <span className="font-medium">{systemStats.breakdown.seedVocab}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Learned Vocabulary:</span>
                        <span className="font-medium text-green-600">{systemStats.breakdown.learnedVocab}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seed Math:</span>
                        <span className="font-medium">{systemStats.breakdown.seedMath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calculated Math:</span>
                        <span className="font-medium text-blue-600">{systemStats.breakdown.calculatedMath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Facts:</span>
                        <span className="font-medium">
                          {systemStats.breakdown.seedFacts + systemStats.breakdown.learnedFacts}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coding:</span>
                        <span className="font-medium">
                          {systemStats.breakdown.seedCoding + systemStats.breakdown.learnedCoding}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {systemStats?.avgConfidence !== undefined && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Confidence:</span>
                        <span className="font-medium">{Math.round(systemStats.avgConfidence * 100)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${systemStats.avgConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="h-full p-4 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Recent Vocabulary</h3>
                  <ScrollArea className="h-32">
                    <div className="space-y-1 text-sm">
                      {systemStats?.vocabularyData &&
                        Array.from(systemStats.vocabularyData.entries())
                          .slice(-10)
                          .map(([word, entry]) => (
                            <div key={word} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium">{word}</div>
                              <div className="text-gray-600 text-xs truncate">{entry.definition}</div>
                            </div>
                          ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Recent Math</h3>
                  <ScrollArea className="h-32">
                    <div className="space-y-1 text-sm">
                      {systemStats?.mathFunctionsData &&
                        Array.from(systemStats.mathFunctionsData.entries())
                          .slice(-10)
                          .map(([concept, entry]) => (
                            <div key={concept} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium text-xs">{entry.type}</div>
                              <div className="text-gray-600 text-xs truncate">{entry.formula}</div>
                            </div>
                          ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Personal Info</h3>
                  <ScrollArea className="h-24">
                    <div className="space-y-1 text-sm">
                      {systemStats?.personalInfoData &&
                        Array.from(systemStats.personalInfoData.entries()).map(([key, entry]) => (
                          <div key={key} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium text-xs">{entry.key}</div>
                            <div className="text-gray-600 text-xs">{entry.value}</div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-full p-4 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">System Debug</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={systemStats?.systemStatus === "ready" ? "default" : "secondary"}>
                        {systemStats?.systemStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Learned:</span>
                      <span className="font-medium text-green-600">{systemStats?.totalLearned || 0}</span>
                    </div>
                  </div>
                </div>

                {systemStats?.performanceStats && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Operations:</span>
                        <span>{systemStats.performanceStats.totalOperations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response:</span>
                        <span>{systemStats.performanceStats.avgResponseTime}ms</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={refreshSystem} className="w-full bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh System
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData} className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearConversation} className="w-full bg-transparent">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
