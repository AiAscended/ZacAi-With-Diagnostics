"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KnowledgeManagerV2 } from "@/lib/knowledge-manager-v2"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import {
  Brain,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Database,
  Lightbulb,
  Calculator,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Zap,
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
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">ZacAI Metrics Dashboard</h1>
                  <p className="text-gray-600">System performance and knowledge analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowMetrics(false)} variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Back to Chat
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.version}</div>
                      <div className="text-sm text-gray-600">Version</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.systemStatus === "ready" ? "Ready" : "Loading"}
                      </div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.avgConfidence?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Date(stats.lastUpdated).toLocaleTimeString()}
                      </div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Knowledge Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Vocabulary</span>
                        <span className="text-sm text-gray-600">{stats.vocabulary}</span>
                      </div>
                      <Progress value={(stats.vocabulary / Math.max(stats.totalEntries, 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Mathematics</span>
                        <span className="text-sm text-gray-600">{stats.mathematics}</span>
                      </div>
                      <Progress value={(stats.mathematics / Math.max(stats.totalEntries, 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">User Info</span>
                        <span className="text-sm text-gray-600">{stats.userInfo}</span>
                      </div>
                      <Progress value={(stats.userInfo / Math.max(stats.totalEntries, 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Facts</span>
                        <span className="text-sm text-gray-600">{stats.facts}</span>
                      </div>
                      <Progress value={(stats.facts / Math.max(stats.totalEntries, 1)) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Data Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Knowledge Data Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {["vocabulary", "mathematics", "userInfo", "facts"].map((type) => (
                      <Button
                        key={type}
                        variant={activeDataView === type ? "default" : "outline"}
                        onClick={() => fetchKnowledgeData(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>

                  {activeDataView && (
                    <ScrollArea className="h-64 border rounded-lg p-4">
                      <div className="space-y-2">
                        {knowledgeData[activeDataView]?.length > 0 ? (
                          knowledgeData[activeDataView].map((item: any, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">No {activeDataView} data available</div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Training & Data Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Training & Data Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Data Management</h3>
                      <div className="space-y-2">
                        <Button onClick={handleExport} variant="outline" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          Export Knowledge
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json,.csv,.txt"
                            onChange={handleBulkImport}
                            className="hidden"
                            id="bulk-import"
                          />
                          <Button asChild variant="outline" className="w-full justify-start">
                            <label htmlFor="bulk-import" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Import Data
                            </label>
                          </Button>
                        </div>
                        <Button onClick={handleClearData} variant="destructive" className="w-full justify-start">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear All Data
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Model Training</h3>
                      <div className="space-y-2">
                        <Button
                          onClick={handleRetrainModel}
                          disabled={isLoading}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Retrain Model
                        </Button>
                        <Button
                          onClick={handleOptimizeKnowledge}
                          disabled={isLoading}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Optimize Knowledge
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">System Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Entries:</span>
                          <span className="font-mono">{stats.totalEntries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversations:</span>
                          <span className="font-mono">{stats.conversations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span className="font-mono">
                            {((JSON.stringify(knowledgeData).length / 1024 / 1024) * 100).toFixed(2)} MB
                          </span>
                        </div>
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">ZacAI Enhanced Chat</h1>
              <p className="text-sm text-gray-600">Cognitive AI with Advanced Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              v{stats.version}
            </Badge>
            <Button onClick={() => setShowMetrics(true)} variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Metrics
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to ZacAI Enhanced Chat</h3>
                    <p className="text-gray-600 mb-4">
                      I'm an advanced AI with cognitive processing, mathematical abilities, and memory. Try asking me
                      something!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary">Math: 25 × 4</Badge>
                      <Badge variant="secondary">Memory: My name is John</Badge>
                      <Badge variant="secondary">Questions: What can you do?</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <Card className={`max-w-[80%] ${message.role === "user" ? "bg-blue-50" : "bg-white"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {message.role === "user" ? (
                            <User className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Brain className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold capitalize">{message.role}</span>
                            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                            {message.confidence && (
                              <Badge variant="outline" className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                                {Math.round(message.confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>

                          {/* Math Analysis */}
                          {message.mathAnalysis && message.mathAnalysis.isMatch && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-800">Mathematical Analysis</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <div>
                                  <strong>Operation:</strong> {message.mathAnalysis.operation}
                                </div>
                                <div>
                                  <strong>Numbers:</strong> {message.mathAnalysis.numbers.join(", ")}
                                </div>
                                <div>
                                  <strong>Result:</strong> {message.mathAnalysis.result}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Knowledge Used */}
                          {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {message.knowledgeUsed.map((knowledge, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {knowledge}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Thinking Process */}
                          {message.thinking && message.thinking.length > 0 && (
                            <div className="mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setShowThinking((prev) => ({
                                    ...prev,
                                    [message.id]: !prev[message.id],
                                  }))
                                }
                                className="text-xs p-1 h-auto"
                              >
                                <Lightbulb className="w-3 h-3 mr-1" />
                                {showThinking[message.id] ? "Hide" : "Show"} Thinking Process
                                {showThinking[message.id] ? (
                                  <ChevronUp className="w-3 h-3 ml-1" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                )}
                              </Button>
                              {showThinking[message.id] && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                                  {message.thinking.map((step, index) => (
                                    <div key={index} className="text-gray-700">
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => setInput(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Thinking Animation */}
              {isThinking && currentThinking && (
                <div className="flex justify-start">
                  <Card className="max-w-[80%] bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">ZacAI</span>
                            <Badge variant="outline" className="text-xs">
                              Thinking...
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 italic">{currentThinking}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 bg-white border-t">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (math, questions, or tell me about yourself)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send"}
              </Button>
            </form>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>📚 Vocabulary: {stats.vocabulary}</span>
                <span>🧮 Math: {stats.mathematics}</span>
                <span>👤 User Info: {stats.userInfo}</span>
                <span>💬 Messages: {stats.conversations}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Status: {stats.systemStatus || "Ready"}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
