"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KnowledgeManagerV2 } from "@/lib/knowledge-manager-v2"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import {
  Brain,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Database,
  Cloud,
  Lightbulb,
  Calculator,
  BarChart3,
  Settings,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Upload,
  Search,
  Zap,
  Globe,
  FileText,
  User,
  Cpu,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  knowledgeUsed?: string[]
  suggestions?: string[]
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
}

export default function EnhancedAIChat() {
  const [knowledgeManager] = useState(() => new KnowledgeManagerV2())
  const [aiSystem] = useState(() => new ReliableAISystem())
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

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing Enhanced AI System...")

      // Load session data first
      knowledgeManager.loadSessionFromLocalStorage()

      // Load knowledge from IndexedDB
      await knowledgeManager.loadFromIndexedDB()

      // Load seed data
      await knowledgeManager.loadSeedData()

      // Initialize AI system
      await aiSystem.initialize()

      // Get system information
      const sysInfo = knowledgeManager.getSystemInfo()
      setSystemInfo(sysInfo)

      // Update stats
      updateStats()

      // Load conversation history
      const history = aiSystem.getConversationHistory()
      setMessages(history)

      setIsInitializing(false)
      console.log("✅ Enhanced AI System initialized successfully!")
    } catch (error) {
      console.error("❌ Failed to initialize:", error)
      setError("Failed to initialize AI system")
      setIsInitializing(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    const knowledgeStats = knowledgeManager.getStats()
    const aiStats = aiSystem.getStats()

    setStats({
      ...knowledgeStats,
      systemStatus: aiStats.systemStatus,
      avgConfidence: aiStats.avgConfidence,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Search existing knowledge first
      const knowledgeResults = knowledgeManager.searchKnowledge(userInput)
      const knowledgeUsed = knowledgeResults
        .map((r) => `${r.type}: ${r.data.word || r.data.concept || r.data.key || "fact"}`)
        .slice(0, 3)

      // Get AI response
      const response = await aiSystem.processMessage(userInput)

      // Learn from this interaction
      await knowledgeManager.learnFromMessage(userInput, response.content)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: knowledgeUsed,
        suggestions: generateSuggestions(userInput, response.content),
      }

      setMessages((prev) => [...prev, aiMessage])
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput) // Restore input
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate")) {
      suggestions.push("Try another calculation", "What's 15 × 23?")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

    suggestions.push("Tell me something interesting", "What can you do?")

    return suggestions.slice(0, 4)
  }

  const handleExport = () => {
    const data = knowledgeManager.exportKnowledge()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zacai-knowledge-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          knowledgeManager.importKnowledge(data)
          updateStats()
          alert("Knowledge imported successfully!")
        } catch (error) {
          alert("Failed to import knowledge. Please check the file format.")
        }
      }
      reader.readAsText(file)
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
            <h2 className="text-xl font-bold mb-2">Initializing ZacAI</h2>
            <p className="text-gray-600 mb-4">Loading knowledge base and preparing systems...</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading seed data</span>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showMetrics) {
    return (
      <div className="h-screen bg-gray-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 bg-white border-b">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">{systemInfo.name || "ZacAI"} Metrics Dashboard</h1>
                  <p className="text-sm text-gray-600">Version {stats.version}</p>
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
                  <span className="text-sm">Metrics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{stats.vocabulary}</div>
                    <div className="text-sm text-gray-500">Vocabulary</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calculator className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{stats.mathematics}</div>
                    <div className="text-sm text-gray-500">Math Concepts</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{stats.userInfo}</div>
                    <div className="text-sm text-gray-500">User Info</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{stats.facts}</div>
                    <div className="text-sm text-gray-500">Facts</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold">{stats.conversations}</div>
                    <div className="text-sm text-gray-500">Conversations</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Name</span>
                        <span className="text-sm font-mono">{systemInfo.name || "ZacAI"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Version</span>
                        <span className="text-sm font-mono">{stats.version}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Entries</span>
                        <span className="text-sm font-mono">{stats.totalEntries}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Updated</span>
                        <span className="text-sm font-mono">{new Date(stats.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Mission</h4>
                      <p className="text-xs text-gray-600">
                        {systemInfo.mission || "Continuously learn and improve through interactions"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Capabilities</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {(systemInfo.capabilities || []).slice(0, 6).map((cap: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Knowledge Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Knowledge Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vocabulary</span>
                          <span>{stats.vocabulary}</span>
                        </div>
                        <Progress value={(stats.vocabulary / stats.totalEntries) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Mathematics</span>
                          <span>{stats.mathematics}</span>
                        </div>
                        <Progress value={(stats.mathematics / stats.totalEntries) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Facts</span>
                          <span>{stats.facts}</span>
                        </div>
                        <Progress value={(stats.facts / stats.totalEntries) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>User Information</span>
                          <span>{stats.userInfo}</span>
                        </div>
                        <Progress value={(stats.userInfo / stats.totalEntries) * 100} className="h-2" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Learning Sources</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>• Seed vocabulary and mathematics</p>
                        <p>• User conversations and interactions</p>
                        <p>• Online dictionary and encyclopedia APIs</p>
                        <p>• Real-time knowledge extraction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                  {stats.totalEntries} entries
                </Badge>
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </CardTitle>

              <div className="flex items-center gap-4">
                {/* Quick Stats */}
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
                  <span className="text-sm">Metrics</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 pr-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Brain className="w-12 h-12 opacity-50" />
                      <Cloud className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                    <p className="mb-4">
                      {systemInfo.purpose || "I can chat, learn, calculate, and remember our conversations!"}
                    </p>

                    {/* Initial Suggestions */}
                    <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Hello! How do you work?")}
                        className="text-left justify-start"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        How do you work?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Calculate 15 * 23")}
                        className="text-left justify-start"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate 15 × 23
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Remember: I'm a developer")}
                        className="text-left justify-start"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Test memory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("What can you do?")}
                        className="text-left justify-start"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Your capabilities
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
                      <div className="text-sm mb-2">{message.content}</div>

                      {/* AI Response Features */}
                      {message.role === "assistant" && (
                        <div className="space-y-3 mt-3">
                          {/* Knowledge Used */}
                          {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Search className="w-3 h-3" />
                                <span>Knowledge used:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.knowledgeUsed.map((knowledge, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {knowledge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Lightbulb className="w-3 h-3" />
                                <span>Suggestions:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestions.map((suggestion, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={() => setInput(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Feedback and Stats */}
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

                            {/* Feedback Buttons */}
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

                      {/* User Message Timestamp */}
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

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here... I can learn, calculate, and remember!"
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
        <Tabs defaultValue="stats" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="stats" className="h-full">
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
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.mathematics}</div>
                      <div className="text-xs text-gray-500">Math</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.userInfo}</div>
                      <div className="text-xs text-gray-500">User Info</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.facts}</div>
                      <div className="text-xs text-gray-500">Facts</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Knowledge</span>
                      <span className="font-mono">{stats.totalEntries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversations</span>
                      <span className="font-mono">{stats.conversations}</span>
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
                      <span className="text-sm">Online & Learning</span>
                    </div>
                    <div className="text-xs text-gray-500">Ready to learn from every interaction</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">I continuously learn:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• New vocabulary from conversations</li>
                      <li>• Mathematical concepts and formulas</li>
                      <li>• Your personal preferences</li>
                      <li>• Facts from online sources</li>
                      <li>• Context from our discussions</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Learning Sources</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span>Wikipedia & Wiktionary APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-green-500" />
                        <span>Dictionary APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3 h-3 text-purple-500" />
                        <span>Conversation Analysis</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Try These</div>
                    <div className="space-y-2 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("Remember that I love programming")}
                      >
                        "Remember that I love programming"
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("What's the square root of 144?")}
                      >
                        "What's the square root of 144?"
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("Tell me about artificial intelligence")}
                      >
                        "Tell me about artificial intelligence"
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    AI Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExport} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Knowledge
                  </Button>

                  <div>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                    <Button asChild className="w-full" variant="outline">
                      <label htmlFor="import-file" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Knowledge
                      </label>
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Data Storage</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• All your data stays in your browser</p>
                      <p>• Knowledge saved to IndexedDB</p>
                      <p>• Sessions stored locally</p>
                      <p>• Export anytime for backup</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Privacy</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• No data sent to servers</p>
                      <p>• You control all information</p>
                      <p>• Learning happens locally</p>
                      <p>• Export/import as needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
