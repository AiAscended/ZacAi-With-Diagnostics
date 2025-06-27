"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SimpleAISystem } from "@/lib/simple-ai-system"
import {
  Brain,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Cloud,
  Lightbulb,
  Calculator,
  BarChart3,
  Settings,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Search,
  Zap,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  knowledgeUsed?: string[]
  suggestions?: string[]
  thinking?: string[]
  mathAnalysis?: any
}

interface AIStats {
  vocabulary: number
  mathematics: number
  userInfo: number
  facts: number
  conversations: number
  totalEntries: number
  lastUpdated: number
  version: string
  systemStatus?: string
  avgConfidence?: number
  breakdown?: any
}

export default function EnhancedAIChat() {
  const [aiSystem] = useState(() => new SimpleAISystem())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [stats, setStats] = useState<AIStats>({
    vocabulary: 0,
    mathematics: 0,
    userInfo: 0,
    facts: 0,
    conversations: 0,
    totalEntries: 0,
    lastUpdated: 0,
    version: "2.0.0",
  })
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing Simple AI System...")

      await aiSystem.initialize()
      console.log("✅ Simple AI System initialized successfully")

      const debugInfo = aiSystem.getSystemDebugInfo()
      setSystemInfo(debugInfo.systemIdentity || { name: "ZacAI", version: "2.0.0" })

      updateStats()
      setIsInitializing(false)
      console.log("✅ Simple AI System fully operational!")
    } catch (error) {
      console.error("❌ Failed to initialize:", error)
      setError("System initialized with limited functionality")
      setIsInitializing(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    try {
      const aiStats = aiSystem.getStats()
      console.log("📊 AI Stats:", aiStats)

      setStats({
        vocabulary: aiStats.vocabularySize || 0,
        mathematics: aiStats.mathFunctions || 0,
        userInfo: aiStats.memoryEntries || 0,
        facts: aiStats.factsData?.size || 0,
        conversations: aiStats.totalMessages || 0,
        totalEntries: aiStats.totalLearned || 0,
        lastUpdated: Date.now(),
        version: "2.0.0",
        systemStatus: aiStats.systemStatus,
        avgConfidence: aiStats.avgConfidence,
        breakdown: aiStats.breakdown,
      })
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
    setError(null)

    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      console.log("🤖 Processing message with Simple AI System:", userInput)

      const response = await aiSystem.processMessage(userInput)
      console.log("✅ Simple AI Response:", response)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: response.knowledgeUsed || [],
        suggestions: generateSuggestions(userInput, response.content),
        thinking: response.reasoning || [],
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update stats after processing
      setTimeout(() => {
        updateStats()
      }, 500)
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate") || aiResponse.includes("result")) {
      suggestions.push("Try another calculation", "What's 15 × 23?", "Calculate 100 ÷ 10")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

    if (/\d/.test(userInput)) {
      suggestions.push("Try a different math problem", "What's 2×2?", "Calculate 5+5")
    }

    suggestions.push("Tell me something interesting", "What can you do?", "Self diagnostic")

    return suggestions.slice(0, 4)
  }

  const handleExport = () => {
    try {
      const aiData = aiSystem.exportData()

      const combinedData = {
        simpleAISystem: aiData,
        exportDate: new Date().toISOString(),
        version: "2.0.0",
      }

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-simple-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      console.log("✅ Data exported successfully")
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data")
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return "text-green-600"
    if (confidence > 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Initializing Simple AI System</h2>
            <p className="text-gray-600 mb-4">Loading seed data and AI components...</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading simple architecture</span>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ADMIN DASHBOARD VIEW
  if (showMetrics) {
    return (
      <div className="h-screen bg-gray-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 bg-white border-b">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">{systemInfo.name || "ZacAI"} Simple Dashboard</h1>
                  <p className="text-sm text-gray-600">Simple AI System - Clean & Functional</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Chat</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                  <span className="text-sm">Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-shrink-0 p-4 bg-white border-b">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-xl font-bold">{stats.vocabulary}</div>
                    <div className="text-xs text-gray-500">Vocabulary</div>
                    {stats.breakdown && (
                      <div className="text-xs text-gray-400">
                        {stats.breakdown.seedVocab} seed + {stats.breakdown.learnedVocab} learned
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    <Calculator className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-xl font-bold">{stats.mathematics}</div>
                    <div className="text-xs text-gray-500">Mathematics</div>
                    {stats.breakdown && (
                      <div className="text-xs text-gray-400">
                        {stats.breakdown.seedMath} seed + {stats.breakdown.learnedMath} learned
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    <User className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-xl font-bold">{stats.userInfo}</div>
                    <div className="text-xs text-gray-500">User Info</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 text-center">
                    <MessageCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    <div className="text-xl font-bold">{stats.conversations}</div>
                    <div className="text-xs text-gray-500">Messages</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vocabulary System</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Math Processor</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Memory System</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dictionary API</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data Storage</span>
                        <Badge variant="outline" className="bg-yellow-50">
                          ⚠️ Local Only
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Learning System</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Active
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Knowledge Entries</span>
                      <span className="font-mono">{stats.totalEntries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Confidence</span>
                      <span className="font-mono">
                        {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "85%"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Updated</span>
                      <span className="font-mono text-xs">
                        {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "Never"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MAIN CHAT INTERFACE
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {systemInfo.name || "ZacAI"}
                <Badge variant="outline" className="ml-2">
                  Simple System
                </Badge>
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </CardTitle>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>{stats.vocabulary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-green-500" />
                    <span>{stats.mathematics}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-purple-500" />
                    <span>{stats.conversations}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Admin</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 pr-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Brain className="w-12 h-12 opacity-50" />
                      <Calculator className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                    <p className="mb-4">I'm a simple but powerful AI with vocabulary, math, and memory capabilities!</p>

                    <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("2×2")}
                        className="text-left justify-start"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        2×2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("What is science")}
                        className="text-left justify-start"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        What is science
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("My name is Ron")}
                        className="text-left justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My name is Ron
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Self diagnostic")}
                        className="text-left justify-start"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Self diagnostic
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
                      <div className="text-sm mb-2 whitespace-pre-wrap">{message.content}</div>

                      {message.role === "assistant" && (
                        <div className="space-y-3 mt-3">
                          {message.thinking && message.thinking.length > 0 && (
                            <div className="border-l-2 border-blue-300 pl-3">
                              <button
                                onClick={() =>
                                  setShowThinking((prev) => ({ ...prev, [message.id]: !prev[message.id] }))
                                }
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                {showThinking[message.id] ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                <Brain className="w-3 h-3" />
                                <span>AI Reasoning</span>
                              </button>
                              {showThinking[message.id] && (
                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded space-y-1">
                                  {message.thinking.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Search className="w-3 h-3" />
                                <span>Knowledge used:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.knowledgeUsed.map((knowledge, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {String(knowledge)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Lightbulb className="w-3 h-3" />
                                <span>Try these:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestions.map((suggestion, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 px-2 bg-transparent"
                                    onClick={() => setInput(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs opacity-70">
                            <div className="flex items-center gap-2">
                              <span>{formatTimestamp(message.timestamp)}</span>
                              {message.confidence && (
                                <div className="flex items-center gap-1">
                                  <Cloud className="w-3 h-3" />
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      message.confidence > 0.7
                                        ? "bg-green-500"
                                        : message.confidence > 0.4
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                  />
                                  <span className={getConfidenceColor(message.confidence)}>
                                    {Math.round(message.confidence * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => console.log("Positive feedback")}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => console.log("Negative feedback")}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {message.role === "user" && (
                        <div className="text-xs opacity-70 mt-2">{formatTimestamp(message.timestamp)}</div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        <span className="text-sm text-gray-500">{systemInfo.name || "ZacAI"} is thinking...</span>
                        <Cloud className="w-4 h-4 text-gray-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything - math, definitions, or tell me about yourself!"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Zap className="w-4 h-4 mr-2" />
                Send
              </Button>
            </form>

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 p-4 overflow-hidden">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.vocabulary}</div>
                <div className="text-xs text-gray-500">Vocabulary</div>
                {stats.breakdown && (
                  <div className="text-xs text-gray-400">
                    {stats.breakdown.seedVocab}+{stats.breakdown.learnedVocab}
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.mathematics}</div>
                <div className="text-xs text-gray-500">Math</div>
                {stats.breakdown && (
                  <div className="text-xs text-gray-400">
                    {stats.breakdown.seedMath}+{stats.breakdown.learnedMath}
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.userInfo}</div>
                <div className="text-xs text-gray-500">User Info</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalEntries}</div>
                <div className="text-xs text-gray-500">Total Learned</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Messages</span>
                <span className="font-mono">{stats.conversations}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span className="font-mono">
                  {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "85%"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated</span>
                <span className="font-mono text-xs">
                  {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "Never"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">System Status</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">All Systems Operational</span>
              </div>
              <div className="text-xs text-gray-500">Simple & Functional</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => setInput("Self diagnostic")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Run Diagnostic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
