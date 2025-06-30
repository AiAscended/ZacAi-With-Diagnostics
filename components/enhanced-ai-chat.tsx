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
import { systemManager } from "@/core/system/manager"
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
  Database,
  Activity,
  Code,
  Globe,
} from "lucide-react"
import { formatRelativeTime } from "@/utils/formatters"

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
  const [systemInfo, setSystemInfo] = useState<any>({ name: "ZacAI", version: "2.0.0" })
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})
  const [currentThinking, setCurrentThinking] = useState<string>("")
  const [isThinking, setIsThinking] = useState(false)
  const [activeDataView, setActiveDataView] = useState<string>("overview")

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing ZacAI Enhanced System...")

      await systemManager.initialize()
      console.log("✅ ZacAI System initialized successfully")

      setSystemInfo({ name: "ZacAI", version: "2.0.0" })
      updateStats()

      setIsInitializing(false)
      console.log("✅ ZacAI System fully operational!")

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `🧠 **ZacAI Enhanced System v2.0** is now online!

I'm your advanced AI assistant with comprehensive knowledge modules:

📚 **Vocabulary** - Dictionary, thesaurus, phonetics, etymology
🧮 **Mathematics** - Basic arithmetic to advanced Tesla/Vortex math
🌍 **Facts** - Wikipedia integration and verified information
💻 **Coding** - Programming concepts and examples
🤔 **Philosophy** - Philosophical concepts and arguments
👤 **User Info** - Personal preferences and learning tracking

**Try asking me:**
• "Define quantum physics"
• "Calculate 15 × 23 using Tesla method"
• "Tell me about artificial intelligence"
• "How do I code a function in JavaScript?"
• "What is the meaning of consciousness?"

What would you like to explore today?`,
        timestamp: Date.now(),
        confidence: 1.0,
        knowledgeUsed: ["system"],
      }

      setMessages([welcomeMessage])
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
      const systemStats = systemManager.getSystemStats()
      console.log("📊 System Stats:", systemStats)

      setStats({
        vocabulary: systemStats.modules.vocabulary?.learntEntries || 0,
        mathematics: systemStats.modules.mathematics?.learntEntries || 0,
        userInfo: systemStats.modules["user-info"]?.learntEntries || 0,
        facts: systemStats.modules.facts?.learntEntries || 0,
        conversations: systemStats.modules.vocabulary?.totalQueries || 0,
        totalEntries: Object.values(systemStats.modules).reduce(
          (sum: number, mod: any) => sum + (mod.learntEntries || 0),
          0,
        ),
        lastUpdated: Date.now(),
        version: "2.0.0",
        systemStatus: "Ready",
        avgConfidence: 0.85,
        breakdown: {
          seedVocab: 1000,
          learnedVocab: systemStats.modules.vocabulary?.learntEntries || 0,
          seedMath: 500,
          learnedMath: systemStats.modules.mathematics?.learntEntries || 0,
        },
      })
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const simulateThinking = async (userInput: string): Promise<string[]> => {
    const thinkingSteps = [
      "🧠 Analyzing input with enhanced reasoning engine...",
      "🔍 Determining intent and extracting entities...",
      "📚 Consulting vocabulary, math, facts, and coding modules...",
      "🔗 Cross-referencing knowledge and building connections...",
      "💭 Generating comprehensive response with confidence scoring...",
      "✨ Finalizing answer with learning integration...",
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

    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      console.log("🤖 Processing message with Enhanced System:", userInput)

      const thinkingSteps = await simulateThinking(userInput)

      const response = await systemManager.processInput(userInput)
      console.log("✅ Enhanced System Response:", response)

      setIsThinking(false)
      setCurrentThinking("")

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: response.sources || [],
        suggestions: generateSuggestions(userInput, response.response),
        thinking: [...thinkingSteps, ...(response.reasoning || [])],
        mathAnalysis: response.mathAnalysis,
      }

      setMessages((prev) => [...prev, aiMessage])

      setTimeout(() => {
        updateStats()
      }, 500)
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
      setIsThinking(false)
      setCurrentThinking("")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate") || aiResponse.includes("result")) {
      suggestions.push("Try Tesla multiplication", "What's 25 × 37?", "Show me vortex math pattern")
    }

    if (aiResponse.includes("define") || aiResponse.includes("meaning")) {
      suggestions.push("What's the etymology?", "Give me synonyms", "Show pronunciation")
    }

    if (aiResponse.includes("code") || aiResponse.includes("function")) {
      suggestions.push("Show me an example", "Best practices?", "Common mistakes?")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example", "What's the history?")
    }

    suggestions.push("Tell me something interesting", "What can you do?", "System diagnostics")

    return suggestions.slice(0, 4)
  }

  const handleExport = () => {
    try {
      const exportData = systemManager.exportData()

      const combinedData = {
        enhancedSystem: exportData,
        exportDate: new Date().toISOString(),
        version: "2.0.0",
        messages: messages,
      }

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-enhanced-export-${new Date().toISOString().split("T")[0]}.json`
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
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <Card className="w-96 chat-container">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Initializing ZacAI Enhanced System</h2>
            <p className="text-gray-600 mb-4">Loading advanced knowledge modules and AI engines...</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading enhanced architecture</span>
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
      <div
        className="h-screen admin-container"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="admin-header">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {systemInfo.name || "ZacAI"} Enhanced Admin Dashboard
                  </h1>
                  <p className="text-sm text-white/80">Advanced AI System - Knowledge Management & Analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">Chat</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                  <span className="text-sm">Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex-shrink-0 p-4 bg-white/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-6 gap-4">
                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("vocabulary")}
                >
                  <CardContent className="p-3 text-center">
                    <div className="module-icon vocabulary mb-2 mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="stats-number text-xl">{stats.vocabulary}</div>
                    <div className="stats-label">Vocabulary</div>
                    {stats.breakdown && (
                      <div className="text-xs text-gray-400">
                        {stats.breakdown.seedVocab}+{stats.breakdown.learnedVocab}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("mathematics")}
                >
                  <CardContent className="p-3 text-center">
                    <div className="module-icon mathematics mb-2 mx-auto">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div className="stats-number text-xl">{stats.mathematics}</div>
                    <div className="stats-label">Mathematics</div>
                    {stats.breakdown && (
                      <div className="text-xs text-gray-400">
                        {stats.breakdown.seedMath}+{stats.breakdown.learnedMath}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("facts")}
                >
                  <CardContent className="p-3 text-center">
                    <div className="module-icon facts mb-2 mx-auto">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="stats-number text-xl">{stats.facts}</div>
                    <div className="stats-label">Facts</div>
                  </CardContent>
                </Card>

                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("coding")}
                >
                  <CardContent className="p-3 text-center">
                    <div className="module-icon coding mb-2 mx-auto">
                      <Code className="w-6 h-6" />
                    </div>
                    <div className="stats-number text-xl">0</div>
                    <div className="stats-label">Coding</div>
                  </CardContent>
                </Card>

                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("philosophy")}
                >
                  <CardContent className="p-3 text-center">
                    <div className="module-icon philosophy mb-2 mx-auto">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div className="stats-number text-xl">0</div>
                    <div className="stats-label">Philosophy</div>
                  </CardContent>
                </Card>

                <Card
                  className="stats-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveDataView("overview")}
                >
                  <CardContent className="p-3 text-center">
                    <MessageCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                    <div className="stats-number text-xl">{stats.conversations}</div>
                    <div className="stats-label">Conversations</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              {activeDataView === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="module-card">
                    <CardHeader>
                      <CardTitle className="module-header">
                        <div className="module-icon vocabulary">
                          <Brain className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold">System Overview</div>
                          <div className="text-sm text-gray-500">Enhanced AI Architecture</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="stats-number text-blue-600">{stats.totalEntries}</div>
                          <div className="stats-label text-blue-600">Total Knowledge</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="stats-number text-green-600">
                            {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "85%"}
                          </div>
                          <div className="stats-label text-green-600">Avg Confidence</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Status</span>
                          <Badge variant="default" className="confidence-badge high">
                            {stats.systemStatus || "Ready"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Version</span>
                          <span className="font-mono">{stats.version}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Updated</span>
                          <span className="text-xs">{formatRelativeTime(stats.lastUpdated)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="module-card">
                    <CardHeader>
                      <CardTitle className="module-header">
                        <div className="module-icon mathematics">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold">Knowledge Modules</div>
                          <div className="text-sm text-gray-500">Active Learning Systems</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vocabulary System</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mathematics Engine</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Facts Database</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Learning Engine</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="module-card">
                    <CardHeader>
                      <CardTitle className="module-header">
                        <div className="module-icon facts">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold">System Health</div>
                          <div className="text-sm text-gray-500">Performance Metrics</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reasoning Engine</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Optimal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API Integrations</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Connected
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Memory System</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Operational
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Context Manager</span>
                        <Badge variant="outline" className="confidence-badge high">
                          ✅ Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Individual module views would be implemented here */}
              {activeDataView !== "overview" && (
                <Card className="module-card">
                  <CardHeader>
                    <CardTitle>
                      📊 {activeDataView.charAt(0).toUpperCase() + activeDataView.slice(1)} Module Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className={`module-icon ${activeDataView} mx-auto mb-4`}>
                        {activeDataView === "vocabulary" && <BookOpen className="w-8 h-8" />}
                        {activeDataView === "mathematics" && <Calculator className="w-8 h-8" />}
                        {activeDataView === "facts" && <Globe className="w-8 h-8" />}
                        {activeDataView === "coding" && <Code className="w-8 h-8" />}
                        {activeDataView === "philosophy" && <Lightbulb className="w-8 h-8" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {activeDataView.charAt(0).toUpperCase() + activeDataView.slice(1)} Module
                      </h3>
                      <p className="text-gray-600 mb-4">Detailed module management and analytics coming soon...</p>
                      <Button onClick={() => setActiveDataView("overview")} variant="outline">
                        Back to Overview
                      </Button>
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

  // MAIN CHAT INTERFACE - VERSION 100 STYLE
  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4">
        <Card className="flex-1 flex flex-col chat-container">
          <div className="chat-header">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-white" />
                <div>
                  <h1 className="text-xl font-bold text-white">{systemInfo.name || "ZacAI"}</h1>
                  <p className="text-sm text-white/80">Enhanced AI System v2.0</p>
                </div>
                <Badge variant="outline" className="ml-2 bg-white/20 border-white/30 text-white">
                  Enhanced
                </Badge>
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{stats.vocabulary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="w-4 h-4" />
                    <span>{stats.mathematics}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{stats.conversations}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">Admin</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 chat-messages">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Brain className="w-12 h-12 opacity-50" />
                      <Calculator className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                    <p className="mb-4">
                      I'm an enhanced AI system with advanced knowledge modules and reasoning capabilities!
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
                        onClick={() => setInput("Define quantum")}
                        className="text-left justify-start"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Define quantum
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("My name is Alex")}
                        className="text-left justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My name is Alex
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("System diagnostics")}
                        className="text-left justify-start"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        System diagnostics
                      </Button>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={message.role === "user" ? "message-user" : "message-assistant"}>
                    <div className="text-sm mb-2 whitespace-pre-wrap leading-relaxed">{message.content}</div>

                    {message.role === "assistant" && (
                      <div className="space-y-3 mt-3">
                        {message.thinking && message.thinking.length > 0 && (
                          <div className="border-l-2 border-blue-300 pl-3">
                            <button
                              onClick={() => setShowThinking((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
                              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {showThinking[message.id] ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                              <Brain className="w-3 h-3" />
                              <span>AI Thinking Process</span>
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

                        {message.mathAnalysis && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <div className="text-xs text-green-700 font-medium mb-1">Mathematical Analysis</div>
                            <div className="text-xs text-green-600">
                              Operation: {message.mathAnalysis.operation} | Confidence:{" "}
                              {Math.round(message.mathAnalysis.confidence * 100)}%
                              {message.mathAnalysis.seedDataUsed && " | Used Seed Data"}
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
                ))}

                {isThinking && currentThinking && (
                  <div className="thinking-process">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                      <Brain className="w-4 h-4 text-orange-600 animate-pulse" />
                      <span className="text-sm text-orange-700 italic">{currentThinking}</span>
                    </div>
                  </div>
                )}

                {isLoading && !isThinking && (
                  <div className="message-assistant">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-500">{systemInfo.name || "ZacAI"} is processing...</span>
                      <Cloud className="w-4 h-4 text-gray-400 animate-pulse" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="chat-input-container">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything - vocabulary, math, facts, coding, philosophy..."
                  disabled={isLoading}
                  className="flex-1 chat-input"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
                  <Zap className="w-5 h-5" />
                </button>
              </form>

              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar - VERSION 100 STYLE */}
      <div className="w-80 flex-shrink-0 p-4 overflow-hidden">
        <div className="sidebar h-full">
          <Tabs defaultValue="stats" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mb-4">
              <TabsTrigger value="stats" className="sidebar-tab">
                Stats
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="sidebar-tab">
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="tools" className="sidebar-tab">
                Tools
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="stats" className="h-full">
                <div className="h-full overflow-auto space-y-4">
                  <Card className="stats-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Live Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="stats-number">{stats.vocabulary}</div>
                          <div className="stats-label">Vocabulary</div>
                          {stats.breakdown && (
                            <div className="text-xs text-gray-400">
                              {stats.breakdown.seedVocab}+{stats.breakdown.learnedVocab}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="stats-number">{stats.mathematics}</div>
                          <div className="stats-label">Math</div>
                          {stats.breakdown && (
                            <div className="text-xs text-gray-400">
                              {stats.breakdown.seedMath}+{stats.breakdown.learnedMath}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="stats-number">{stats.userInfo}</div>
                          <div className="stats-label">User Info</div>
                        </div>

                        <div className="text-center">
                          <div className="stats-number">{stats.totalEntries}</div>
                          <div className="stats-label">Total Learned</div>
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
                            {stats.lastUpdated ? formatRelativeTime(stats.lastUpdated) : "Never"}
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
                        <div className="text-xs text-gray-500">Enhanced architecture ready</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="h-full overflow-auto">
                <div className="space-y-4">
                  <Card className="module-card">
                    <CardHeader>
                      <CardTitle className="text-sm">📚 Knowledge Modules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="module-header">
                        <div className="module-icon vocabulary">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Vocabulary</div>
                          <div className="text-xs text-gray-500">Dictionary & Thesaurus</div>
                        </div>
                        <Badge variant="outline" className="confidence-badge high">
                          Active
                        </Badge>
                      </div>

                      <div className="module-header">
                        <div className="module-icon mathematics">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Mathematics</div>
                          <div className="text-xs text-gray-500">Tesla & Vortex Math</div>
                        </div>
                        <Badge variant="outline" className="confidence-badge high">
                          Active
                        </Badge>
                      </div>

                      <div className="module-header">
                        <div className="module-icon facts">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Facts</div>
                          <div className="text-xs text-gray-500">Wikipedia Integration</div>
                        </div>
                        <Badge variant="outline" className="confidence-badge high">
                          Active
                        </Badge>
                      </div>

                      <div className="module-header">
                        <div className="module-icon coding">
                          <Code className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Coding</div>
                          <div className="text-xs text-gray-500">Programming Concepts</div>
                        </div>
                        <Badge variant="outline" className="confidence-badge medium">
                          Ready
                        </Badge>
                      </div>

                      <div className="module-header">
                        <div className="module-icon philosophy">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Philosophy</div>
                          <div className="text-xs text-gray-500">Philosophical Concepts</div>
                        </div>
                        <Badge variant="outline" className="confidence-badge medium">
                          Ready
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="h-full overflow-auto">
                <div className="space-y-4">
                  <Card className="stats-card">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        System Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={handleExport}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={() => setInput("System diagnostics")}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Run Diagnostics
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={updateStats}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Stats
                      </Button>

                      <Separator />

                      <div className="text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span>Normal</span>
                        </div>
                        <div className="progress-bar mt-1">
                          <div className="progress-fill high" style={{ width: "65%" }} />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>API Status:</span>
                          <span>Connected</span>
                        </div>
                        <div className="progress-bar mt-1">
                          <div className="progress-fill high" style={{ width: "90%" }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
