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
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
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
  FileText,
  User,
  ChevronDown,
  ChevronUp,
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
}

export default function EnhancedAIChat() {
  const [knowledgeManager] = useState(() => new KnowledgeManagerV2())
  const [aiSystem] = useState(() => new CognitiveAISystem())
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
  const [currentThinking, setCurrentThinking] = useState<string>("")
  const [isThinking, setIsThinking] = useState(false)
  const [activeDataView, setActiveDataView] = useState<string | null>(null)
  const [knowledgeData, setKnowledgeData] = useState<any>({
    vocabulary: [],
    mathematics: [],
    userInfo: [],
    facts: [],
  })

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

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
    const aiStats = aiSystem.getStats()
    const knowledgeStats = knowledgeManager.getStats()

    setStats({
      vocabulary: aiStats.vocabularySize + (knowledgeStats.vocabulary || 0),
      mathematics: aiStats.mathFunctions + (knowledgeStats.mathematics || 0),
      userInfo: aiStats.memoryEntries + (knowledgeStats.userInfo || 0),
      facts: knowledgeStats.facts || 0,
      conversations: aiStats.totalMessages,
      totalEntries:
        aiStats.vocabularySize + aiStats.mathFunctions + aiStats.memoryEntries + (knowledgeStats.totalEntries || 0),
      lastUpdated: Date.now(),
      version: "2.0.0",
      systemStatus: aiStats.systemStatus,
      avgConfidence: aiStats.avgConfidence,
    })
  }

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        let data: any

        if (file.name.endsWith(".json")) {
          data = JSON.parse(content)
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parsing for vocabulary data
          const lines = content.split("\n")
          const headers = lines[0].split(",")
          data = { vocabulary: {} }

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",")
            if (values.length >= 2) {
              data.vocabulary[values[0]] = {
                definition: values[1],
                partOfSpeech: values[2] || "unknown",
                category: "imported",
              }
            }
          }
        } else if (file.name.endsWith(".txt")) {
          // Simple text parsing - each line as a vocabulary word
          const lines = content.split("\n").filter((line) => line.trim())
          data = { vocabulary: {} }

          lines.forEach((line) => {
            const word = line.trim()
            if (word) {
              data.vocabulary[word] = {
                definition: `Imported word: ${word}`,
                partOfSpeech: "unknown",
                category: "imported",
              }
            }
          })
        }

        if (data) {
          knowledgeManager.importKnowledge(data)
          updateStats()
          alert(`Successfully imported data from ${file.name}`)
        }
      } catch (error) {
        console.error("Import failed:", error)
        alert("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      try {
        // Clear knowledge manager data
        knowledgeManager.importKnowledge({
          vocabulary: [],
          mathematics: [],
          userInfo: [],
          facts: [],
          conversations: [],
        })

        // Clear AI system data
        await aiSystem.clearAllData()

        updateStats()
        setActiveDataView(null)
        alert("All data cleared successfully")
      } catch (error) {
        console.error("Failed to clear data:", error)
        alert("Failed to clear data")
      }
    }
  }

  const handleRetrainModel = async () => {
    try {
      setIsLoading(true)
      await aiSystem.retrainFromKnowledge()
      updateStats()
      alert("Model retrained successfully")
    } catch (error) {
      console.error("Retrain failed:", error)
      alert("Failed to retrain model")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimizeKnowledge = async () => {
    try {
      setIsLoading(true)
      await knowledgeManager.optimizeKnowledge()
      updateStats()
      alert("Knowledge optimized successfully")
    } catch (error) {
      console.error("Optimization failed:", error)
      alert("Failed to optimize knowledge")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKnowledgeData = async (type: string) => {
    try {
      const data = knowledgeManager.exportKnowledge()
      setKnowledgeData({
        vocabulary: data.vocabulary || [],
        mathematics: data.mathematics || [],
        userInfo: data.userInfo || [],
        facts: data.facts || [],
      })
      setActiveDataView(type)
    } catch (error) {
      console.error("Failed to fetch knowledge data:", error)
    }
  }

  // UPDATED: Cognitive thinking simulation instead of just math
  const simulateThinking = async (userInput: string): Promise<string[]> => {
    const thinkingSteps = [
      "🧠 Analyzing semantic components and extracting entities...",
      "🔗 Synthesizing context from conversation history and personal info...",
      "🎯 Inferring primary intent and classifying message type...",
      "📚 Activating relevant knowledge and personal memories...",
      "💭 Generating contextual response using cognitive processing...",
      "✨ Calculating confidence and finalizing response...",
    ]

    const finalThinking: string[] = []

    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      finalThinking.push(thinkingSteps[i])
      await new Promise((resolve) => setTimeout(resolve, 600))
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
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Search existing knowledge first with error handling
      let knowledgeResults: any[] = []
      let knowledgeUsed: string[] = []

      try {
        knowledgeResults = knowledgeManager.searchKnowledge(userInput)
        knowledgeUsed = knowledgeResults
          .filter((r) => r && r.data && (r.data.word || r.data.concept || r.data.key))
          .map((r) => `${r.type}: ${r.data.word || r.data.concept || r.data.key || "fact"}`)
          .slice(0, 3)
      } catch (knowledgeError) {
        console.warn("Knowledge search failed:", knowledgeError)
      }

      // Show cognitive thinking process
      const thinkingSteps = await simulateThinking(userInput)

      // Get AI response with error handling - NOW USING COGNITIVE SYSTEM
      let response
      try {
        response = await aiSystem.processMessage(userInput)
      } catch (aiError) {
        console.error("AI processing failed:", aiError)
        response = {
          content: "I'm having trouble processing that message. Could you try rephrasing it?",
          confidence: 0.5,
          reasoning: ["Error occurred during processing"],
        }
      }

      // Learn from this interaction with error handling
      try {
        await knowledgeManager.learnFromMessage(userInput, response.content)
      } catch (learningError) {
        console.warn("Learning failed:", learningError)
      }

      // Stop thinking animation
      setIsThinking(false)
      setCurrentThinking("")

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: knowledgeUsed,
        suggestions: generateSuggestions(userInput, response.content),
        thinking: [...thinkingSteps, ...(response.reasoning || [])],
        mathAnalysis: response.mathAnalysis,
      }

      setMessages((prev) => [...prev, aiMessage])
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput) // Restore input
      setIsThinking(false)
      setCurrentThinking("")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate") || aiResponse.includes("result")) {
      suggestions.push("Try another calculation", "What's 15 × 23?", "Calculate 25% of 80")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

    // Add math-specific suggestions if it was a math problem
    if (/\d/.test(userInput)) {
      suggestions.push("Try a different math problem", "What's 2x2?", "Calculate 5+5")
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
                  <p className="text-sm text-gray-600">
                    Version {stats.version} • {stats.systemStatus || "Ready"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleRetrainModel}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retrain
                </Button>
                <Button variant="outline" onClick={handleOptimizeKnowledge}>
                  <Settings className="w-4 h-4 mr-2" />
                  Optimize
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Clear All Data
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
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => fetchKnowledgeData("vocabulary")}
                >
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{stats.vocabulary}</div>
                    <div className="text-sm text-gray-500">Vocabulary</div>
                    <Progress value={(stats.vocabulary / 1000) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => fetchKnowledgeData("mathematics")}
                >
                  <CardContent className="p-4 text-center">
                    <Calculator className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{stats.mathematics}</div>
                    <div className="text-sm text-gray-500">Math Concepts</div>
                    <Progress value={(stats.mathematics / 100) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => fetchKnowledgeData("userInfo")}
                >
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{stats.userInfo}</div>
                    <div className="text-sm text-gray-500">User Info</div>
                    <Progress value={(stats.userInfo / 50) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => fetchKnowledgeData("facts")}
                >
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{stats.facts}</div>
                    <div className="text-sm text-gray-500">Facts</div>
                    <Progress value={(stats.facts / 200) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold">{stats.conversations}</div>
                    <div className="text-sm text-gray-500">Conversations</div>
                    <Progress value={Math.min((stats.conversations / 100) * 100, 100)} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* System Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Core System</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name</span>
                          <span className="font-mono">{systemInfo.name || "ZacAI"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Version</span>
                          <span className="font-mono">{stats.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <Badge variant={stats.systemStatus === "ready" ? "default" : "secondary"}>
                            {stats.systemStatus || "Ready"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence</span>
                          <span className="font-mono">
                            {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Knowledge Base</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Entries</span>
                          <span className="font-mono">{stats.totalEntries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Learning Rate</span>
                          <span className="font-mono">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage</span>
                          <span className="font-mono">IndexedDB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backup</span>
                          <span className="font-mono">LocalStorage</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Last Updated</span>
                          <span className="font-mono text-xs">{new Date(stats.lastUpdated).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Time</span>
                          <span className="font-mono">~500ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage</span>
                          <span className="font-mono">Optimized</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cache Status</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
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
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Vocabulary</span>
                          <span className="text-sm text-gray-500">{stats.vocabulary} words</span>
                        </div>
                        <Progress value={(stats.vocabulary / 1000) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Mathematics</span>
                          <span className="text-sm text-gray-500">{stats.mathematics} concepts</span>
                        </div>
                        <Progress value={(stats.mathematics / 100) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">User Information</span>
                          <span className="text-sm text-gray-500">{stats.userInfo} entries</span>
                        </div>
                        <Progress value={(stats.userInfo / 50) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Facts & Knowledge</span>
                          <span className="text-sm text-gray-500">{stats.facts} facts</span>
                        </div>
                        <Progress value={(stats.facts / 200) * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                        <div className="text-sm text-blue-600">Total Knowledge Entries</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{stats.conversations}</div>
                          <div className="text-xs text-green-600">Conversations</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold text-purple-600">
                            {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
                          </div>
                          <div className="text-xs text-purple-600">Avg Confidence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Data Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Knowledge Data Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="vocabulary" onClick={() => fetchKnowledgeData("vocabulary")}>
                        Vocabulary
                      </TabsTrigger>
                      <TabsTrigger value="mathematics" onClick={() => fetchKnowledgeData("mathematics")}>
                        Math
                      </TabsTrigger>
                      <TabsTrigger value="userInfo" onClick={() => fetchKnowledgeData("userInfo")}>
                        User Info
                      </TabsTrigger>
                      <TabsTrigger value="facts" onClick={() => fetchKnowledgeData("facts")}>
                        Facts
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-xl font-bold">{stats.vocabulary}</div>
                          <div className="text-sm text-gray-500">Vocabulary Words</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <Calculator className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="text-xl font-bold">{stats.mathematics}</div>
                          <div className="text-sm text-gray-500">Math Concepts</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <User className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-xl font-bold">{stats.userInfo}</div>
                          <div className="text-sm text-gray-500">Personal Data</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                          <div className="text-xl font-bold">{stats.facts}</div>
                          <div className="text-sm text-gray-500">Knowledge Facts</div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Data Views */}
                    {["vocabulary", "mathematics", "userInfo", "facts"].map((dataType) => (
                      <TabsContent key={dataType} value={dataType}>
                        <ScrollArea className="h-96">
                          <div className="space-y-2">
                            {knowledgeData[dataType]?.length > 0 ? (
                              knowledgeData[dataType].map((item: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 rounded border">
                                  <div className="font-mono text-sm">
                                    {Array.isArray(item) ? (
                                      <div>
                                        <strong>{item[0]}:</strong> {JSON.stringify(item[1], null, 2)}
                                      </div>
                                    ) : (
                                      <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                No {dataType} data available. Click "Load Data" to fetch.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Training & Data Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Training & Data Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Data Management</h4>
                      <div className="space-y-2">
                        <Button onClick={handleExport} className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export All Knowledge
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json,.csv,.txt"
                            onChange={handleBulkImport}
                            className="hidden"
                            id="bulk-import"
                          />
                          <Button asChild className="w-full" variant="outline">
                            <label htmlFor="bulk-import" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Bulk Import Data
                            </label>
                          </Button>
                        </div>
                        <Button onClick={handleOptimizeKnowledge} className="w-full" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Optimize Knowledge Base
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">AI Training</h4>
                      <div className="space-y-2">
                        <Button onClick={handleRetrainModel} className="w-full" variant="outline">
                          <Brain className="w-4 h-4 mr-2" />
                          Retrain AI Model
                        </Button>
                        <Button onClick={() => updateStats()} className="w-full" variant="outline">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Refresh Statistics
                        </Button>
                        <Button onClick={handleClearData} className="w-full" variant="destructive">
                          <Database className="w-4 h-4 mr-2" />
                          Clear All Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-semibold">System Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Knowledge Manager</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">Active & Learning</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Cognitive AI</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">Processing Ready</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium">Storage</span>
                        </div>
                        <div className="text-xs text-purple-600 mt-1">IndexedDB + Local</div>
                      </div>
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
                  Enhanced Math
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
                      <Calculator className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                    <p className="mb-4">
                      I have enhanced mathematical understanding! Try any math problem in any format.
                    </p>

                    {/* Initial Suggestions */}
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
                        onClick={() => setInput("2 times 2")}
                        className="text-left justify-start"
                      >
                        <Calculator className="w-4 h-4 mr-2" />2 times 2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("2 multiplied by 2")}
                        className="text-left justify-start"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />2 multiplied by 2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("what is 2 * 2?")}
                        className="text-left justify-start"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        what is 2 * 2?
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
                          {/* Thinking Process */}
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

                          {/* Math Analysis */}
                          {message.mathAnalysis && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <div className="text-xs text-green-700 font-medium mb-1">Mathematical Analysis</div>
                              <div className="text-xs text-green-600">
                                Operation: {message.mathAnalysis.operation} | Confidence:{" "}
                                {Math.round(message.mathAnalysis.confidence * 100)}%
                              </div>
                            </div>
                          )}

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
                                <span>Try these:</span>
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

                {/* Real-time Thinking Display */}
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

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try any math problem: 2x2, 2 times 2, multiply 2 by 2, what is 2*2?"
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
                    <div className="text-sm font-medium">Enhanced Math Engine</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Advanced Pattern Recognition</span>
                    </div>
                    <div className="text-xs text-gray-500">Understands 50+ mathematical expression formats</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Enhanced Math Knowledge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">I now understand math in many formats:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• "2x2", "2*2", "2×2"</li>
                      <li>• "2 times 2", "2 multiplied by 2"</li>
                      <li>• "multiply 2 by 2", "what is 2 times 2?"</li>
                      <li>• Multi-step problems</li>
                      <li>• Natural language expressions</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Thinking Process</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3 text-blue-500" />
                        <span>Real-time reasoning display</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-3 h-3 text-green-500" />
                        <span>Pattern matching analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-purple-500" />
                        <span>Mathematical confidence scoring</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Test These Formats</div>
                    <div className="space-y-2 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("2x2=")}
                      >
                        "2x2="
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("2 times by 2")}
                      >
                        "2 times by 2"
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("what is 5 multiplied by 3?")}
                      >
                        "what is 5 multiplied by 3?"
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
                    <div className="text-sm font-medium">Enhanced Features</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Real-time thinking display</p>
                      <p>• Advanced math pattern recognition</p>
                      <p>• Multi-format expression parsing</p>
                      <p>• Confidence-based responses</p>
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
