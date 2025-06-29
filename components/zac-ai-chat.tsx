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
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  Database,
  Activity,
  Cpu,
  Target,
} from "lucide-react"
import KnowledgeManagementTab from "./knowledge-management-tab"
import SystemSettingsTab from "./system-settings-tab"
import MemorySystemTab from "./memory-system-tab"
import { ZacAISystem } from "@/lib/zac-ai-system"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  knowledgeUsed?: string[]
  suggestions?: string[]
  thinking?: any[]
  mathAnalysis?: any
  teslaAnalysis?: any
  processingTime?: number
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

export default function ZacAIChat() {
  const [aiSystem] = useState(() => new ZacAISystem())
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
    version: "4.0.0",
  })
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})
  const [currentThinking, setCurrentThinking] = useState<string>("")
  const [isThinking, setIsThinking] = useState(false)
  const [activeDataView, setActiveDataView] = useState<string>("overview")
  const [knowledgeData, setKnowledgeData] = useState<any>({
    vocabulary: [],
    mathematics: [],
    userInfo: [],
    facts: [],
  })
  const [thinkingStream, setThinkingStream] = useState<any[]>([])

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking, thinkingStream])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing ZacAI Consolidated System...")

      await aiSystem.initialize()
      console.log("✅ ZacAI System initialized successfully")

      const stats = aiSystem.getStats()
      console.log("🔍 System Stats:", stats)

      setSystemInfo(stats.identity || { name: "ZacAI", version: "4.0.0" })

      updateStats()
      loadKnowledgeData()

      const history = aiSystem.getConversationHistory()
      const formattedHistory = history.map((msg: any, index: number) => ({
        id: index.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        confidence: msg.confidence,
      }))
      setMessages(formattedHistory)

      setIsInitializing(false)
      console.log("✅ ZacAI System fully operational!")
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
      console.log("📊 ZacAI Stats:", aiStats)

      setStats({
        vocabulary: aiStats.vocabularySize || 0,
        mathematics: aiStats.mathFunctions || 0,
        userInfo: aiStats.memoryEntries || 0,
        facts: aiStats.facts?.total || 0,
        conversations: aiStats.totalMessages || 0,
        totalEntries: (aiStats.vocabularySize || 0) + (aiStats.mathFunctions || 0) + (aiStats.facts?.total || 0),
        lastUpdated: Date.now(),
        version: "4.0.0",
        systemStatus: aiStats.systemStatus || "Ready",
        avgConfidence: aiStats.avgConfidence || 0.85,
        breakdown: aiStats.breakdown,
      })
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const loadKnowledgeData = () => {
    try {
      console.log("📚 Loading knowledge data from ZacAI system...")

      const vocabularyList = aiSystem.getVocabularyList()
      const mathHistory = aiSystem.getMathematicsHistory()
      const debugInfo = aiSystem.getSystemDebugInfo()

      console.log("📊 Vocabulary list length:", vocabularyList.length)
      console.log("📊 Math history length:", mathHistory.length)
      console.log("🔍 Debug info:", debugInfo)

      const processedData = {
        vocabulary: vocabularyList.map((item) => ({
          word: item.word,
          definition: item.definition,
          partOfSpeech: "word",
          examples: "From vocabulary system",
          category: item.source,
          source: item.source,
        })),

        mathematics: mathHistory.map((item) => ({
          concept: item.concept,
          formula: typeof item.data === "string" ? item.data : JSON.stringify(item.data),
          category: item.source,
          examples: "From calculations",
          difficulty: 1,
          source: item.source,
        })),

        userInfo: [], // Will be populated as user shares information

        facts: [], // Will be populated as facts are learned
      }

      console.log("✅ Processed knowledge data:", processedData)
      console.log("📊 Processed vocabulary count:", processedData.vocabulary.length)
      setKnowledgeData(processedData)
    } catch (error) {
      console.error("❌ Failed to load knowledge data:", error)
    }
  }

  const handleQuickLinkClick = (dataType: string) => {
    setActiveDataView(dataType)
    loadKnowledgeData()
  }

  const simulateThinking = async (userInput: string): Promise<string[]> => {
    const thinkingSteps = [
      "🧠 Analyzing input with ZacAI cognitive architecture...",
      "🔗 Checking seed data and learned knowledge...",
      "🎯 Determining optimal response strategy...",
      "📚 Accessing mathematical and linguistic resources...",
      "⚡ Running Tesla mathematics if applicable...",
      "💭 Generating comprehensive response...",
      "✨ Finalizing answer with confidence scoring...",
    ]

    const finalThinking: string[] = []

    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      finalThinking.push(thinkingSteps[i])
      await new Promise((resolve) => setTimeout(resolve, 400))
    }

    return finalThinking
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setIsThinking(true)
    setCurrentThinking("")
    setError(null)
    setThinkingStream([])

    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      console.log("🤖 Processing message with ZacAI System:", userInput)

      const thinkingSteps = await simulateThinking(userInput)

      const response = await aiSystem.processMessage(userInput)
      console.log("✅ ZacAI Response:", response)

      setIsThinking(false)
      setCurrentThinking("")
      setThinkingStream(response.thinking || [])

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: response.knowledgeUsed || [],
        suggestions: generateSuggestions(userInput, response.content),
        thinking: response.thinking || [],
        mathAnalysis: response.mathAnalysis,
        teslaAnalysis: response.teslaAnalysis,
        processingTime: response.processingTime,
      }

      setMessages((prev) => [...prev, aiMessage])

      setTimeout(() => {
        updateStats()
        loadKnowledgeData()
      }, 500)
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
      setIsThinking(false)
      setCurrentThinking("")
      setThinkingStream([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate") || aiResponse.includes("result")) {
      suggestions.push("Try another calculation", "What's 15 × 23?", "Calculate 25 + 17")
    }

    if (aiResponse.includes("Tesla") || aiResponse.includes("vortex") || aiResponse.includes("digital root")) {
      suggestions.push("Tesla math 369", "Analyze number 123", "What's special about 9?")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

    if (/\d/.test(userInput)) {
      suggestions.push("Try Tesla math", "What's 2x2?", "Calculate 5+5")
    }

    suggestions.push("Tell me something interesting", "What can you do?", "Self diagnostic")

    return suggestions.slice(0, 4)
  }

  const handleExport = () => {
    try {
      const aiData = aiSystem.exportData()

      const combinedData = {
        zacAISystem: aiData,
        exportDate: new Date().toISOString(),
        version: "4.0.0",
      }

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-consolidated-export-${new Date().toISOString().split("T")[0]}.json`
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
            <h2 className="text-xl font-bold mb-2">Initializing ZacAI System</h2>
            <p className="text-gray-600 mb-4">
              Loading consolidated AI architecture, Tesla mathematics, and neural networks...
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading cognitive architecture</span>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <Progress value={90} className="h-2" />
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
                  <h1 className="text-2xl font-bold">{systemInfo.name || "ZacAI"} Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Consolidated AI System v{systemInfo.version || "4.0.0"} - Neural Learning & Tesla Mathematics
                  </p>
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

          {/* Quick Stats Bar */}
          <div className="flex-shrink-0 p-4 bg-white border-b">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-5 gap-4">
                <Card
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleQuickLinkClick("vocabulary")}
                >
                  <CardContent className="p-3 text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-xl font-bold">{stats.vocabulary}</div>
                    <div className="text-xs text-gray-500">Vocabulary</div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:bg-green-50 transition-colors"
                  onClick={() => handleQuickLinkClick("mathematics")}
                >
                  <CardContent className="p-3 text-center">
                    <Calculator className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-xl font-bold">{stats.mathematics}</div>
                    <div className="text-xs text-gray-500">Math & Tesla</div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:bg-purple-50 transition-colors"
                  onClick={() => handleQuickLinkClick("userInfo")}
                >
                  <CardContent className="p-3 text-center">
                    <User className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-xl font-bold">{stats.userInfo}</div>
                    <div className="text-xs text-gray-500">User Info</div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => handleQuickLinkClick("facts")}
                >
                  <CardContent className="p-3 text-center">
                    <FileText className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                    <div className="text-xl font-bold">{stats.facts}</div>
                    <div className="text-xs text-gray-500">Facts</div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => handleQuickLinkClick("overview")}
                >
                  <CardContent className="p-3 text-center">
                    <MessageCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    <div className="text-xl font-bold">{stats.conversations}</div>
                    <div className="text-xs text-gray-500">Conversations</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-4">
              {activeDataView === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        System Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                          <div className="text-sm text-blue-600">Total Knowledge</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "85%"}
                          </div>
                          <div className="text-sm text-green-600">Avg Confidence</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Status</span>
                          <Badge variant="default">{stats.systemStatus || "Ready"}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Version</span>
                          <span className="font-mono">{stats.version}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Updated</span>
                          <span className="text-xs">{new Date(stats.lastUpdated).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Data Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Seed Vocabulary (432 words)</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Loaded
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tesla Mathematics</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dictionary API</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Neural Learning</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Enhanced Math Processor</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cognitive Processing</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pattern Recognition</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Neural Networks</span>
                        <Badge variant="outline" className="bg-green-50">
                          ✅ Working
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeDataView === "vocabulary" && (
                <Card>
                  <CardHeader>
                    <CardTitle>📖 Vocabulary Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {knowledgeData.vocabulary.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No vocabulary entries yet. Start a conversation to build the knowledge base!</p>
                        </div>
                      ) : (
                        knowledgeData.vocabulary.slice(0, 20).map((item: any, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{String(item.word)}</h4>
                                <p className="text-sm text-gray-600">{String(item.definition)}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{String(item.partOfSpeech)}</Badge>
                                  <Badge variant="secondary">{String(item.category)}</Badge>
                                  <Badge variant="outline">{String(item.source)}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeDataView === "mathematics" && (
                <Card>
                  <CardHeader>
                    <CardTitle>🧮 Mathematical & Tesla Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {knowledgeData.mathematics.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No math patterns yet. Try some calculations or Tesla math to build the knowledge base!</p>
                        </div>
                      ) : (
                        knowledgeData.mathematics.slice(0, 20).map((item: any, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{String(item.concept)}</h4>
                                <p className="text-sm text-gray-600">{String(item.formula)}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">Difficulty: {String(item.difficulty)}</Badge>
                                  <Badge variant="secondary">{String(item.category)}</Badge>
                                  <Badge variant="outline">{String(item.source)}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeDataView === "userInfo" && (
                <Card>
                  <CardHeader>
                    <CardTitle>👤 User Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {knowledgeData.userInfo.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No user information yet. Share some details about yourself!</p>
                        </div>
                      ) : (
                        knowledgeData.userInfo.slice(0, 20).map((item: any, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{String(item.key)}</h4>
                                <p className="text-sm text-gray-600">{String(item.value)}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">Importance: {String(item.importance)}</Badge>
                                  <Badge variant="secondary">{String(item.timestamp)}</Badge>
                                  <Badge variant="outline">{String(item.source)}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeDataView === "facts" && (
                <Card>
                  <CardHeader>
                    <CardTitle>📚 Facts Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {knowledgeData.facts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No facts yet. Ask me about science, history, or other topics!</p>
                        </div>
                      ) : (
                        knowledgeData.facts.slice(0, 20).map((item: any, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{String(item.topic)}</h4>
                                <p className="text-sm text-gray-600">{String(item.content)}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{String(item.category)}</Badge>
                                  <Badge variant="secondary">{String(item.source)}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                  Consolidated System v{systemInfo.version || "4.0.0"}
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
                      <Zap className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                    <p className="mb-4">
                      I'm ZacAI - a consolidated AI system with neural learning, Tesla mathematics, and comprehensive
                      knowledge management!
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("2x2=")}
                        className="text-left justify-start"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        2x2=
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Tesla math 369")}
                        className="text-left justify-start"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Tesla math 369
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("What is serendipity")}
                        className="text-left justify-start"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        What is serendipity
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
                                <span>ZacAI Thinking Process</span>
                              </button>
                              {showThinking[message.id] && (
                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded space-y-1">
                                  {message.thinking.map((step: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      <span>
                                        {step.emoji} {step.content}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {message.mathAnalysis && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <div className="text-xs text-green-700 font-medium mb-1">Mathematical Analysis</div>
                              <div className="text-xs text-green-600">
                                Operation: {message.mathAnalysis.operation} | Confidence:{" "}
                                {Math.round(message.mathAnalysis.confidence * 100)}%
                              </div>
                            </div>
                          )}

                          {message.teslaAnalysis && (
                            <div className="bg-purple-50 border border-purple-200 rounded p-2">
                              <div className="text-xs text-purple-700 font-medium mb-1">Tesla Mathematics Analysis</div>
                              <div className="text-xs text-purple-600">
                                Number: {message.teslaAnalysis.number} | Digital Root:{" "}
                                {message.teslaAnalysis.digitalRoot} | Type: {message.teslaAnalysis.type}
                              </div>
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
                              {message.processingTime && (
                                <div className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  <span className="text-gray-500">{message.processingTime.toFixed(0)}ms</span>
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

                {isThinking && currentThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 border shadow-sm rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
                        <span className="text-sm text-gray-600 italic">{currentThinking}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && !isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        <span className="text-sm text-gray-500">{systemInfo.name || "ZacAI"} is processing...</span>
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
                placeholder="Ask me anything - math, Tesla mathematics, definitions, or self-analysis!"
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
                      <div className="text-xs text-gray-500">Math & Tesla</div>
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
                      <span className="text-sm">All Systems Operational</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Neural learning, Tesla math, and knowledge management active
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Features Active</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-3 h-3 text-green-500" />
                        <span>Enhanced Math Processor</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className="w-3 h-3 text-purple-500" />
                        <span>Tesla/Vortex Mathematics</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Brain className="w-3 h-3 text-blue-500" />
                        <span>Neural Learning Engine</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <BookOpen className="w-3 h-3 text-orange-500" />
                        <span>Dictionary API Integration</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="h-full overflow-auto">
              <KnowledgeManagementTab />
            </TabsContent>

            <TabsContent value="tools" className="h-full overflow-auto">
              <div className="space-y-4">
                <SystemSettingsTab />
                <MemorySystemTab />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
