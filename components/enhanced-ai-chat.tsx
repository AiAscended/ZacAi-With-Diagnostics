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
import { QuantumCognitiveEngine } from "@/lib/quantum-cognitive-engine"
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
  Edit,
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
  const [aiSystem] = useState(() => new QuantumCognitiveEngine())
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
  const [activeDataView, setActiveDataView] = useState<string>("overview")
  const [knowledgeData, setKnowledgeData] = useState<any>({
    vocabulary: [],
    mathematics: [],
    userInfo: [],
    facts: [],
  })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItemForm, setNewItemForm] = useState<any>({})

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

      knowledgeManager.loadSessionFromLocalStorage()
      await knowledgeManager.loadFromIndexedDB()
      await knowledgeManager.loadSeedData()
      await aiSystem.initialize()

      const sysInfo = knowledgeManager.getSystemInfo()
      setSystemInfo(sysInfo)

      updateStats()
      loadKnowledgeData()

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

  const loadKnowledgeData = () => {
    try {
      const data = knowledgeManager.exportKnowledge()

      // Convert to human-readable format
      const processedData = {
        vocabulary: data.vocabulary
          ? data.vocabulary.map(([word, entry]: [string, any]) => ({
              word,
              definition: entry.definition || "No definition",
              partOfSpeech: entry.partOfSpeech || entry.part_of_speech || "unknown",
              examples: Array.isArray(entry.examples) ? entry.examples.join(", ") : "No examples",
              category: entry.category || "general",
            }))
          : [],

        mathematics: data.mathematics
          ? data.mathematics.map(([concept, entry]: [string, any]) => ({
              concept,
              formula: entry.formula || "No formula",
              category: entry.category || "general",
              examples: Array.isArray(entry.examples) ? entry.examples.join(", ") : "No examples",
              difficulty: entry.difficulty || 1,
            }))
          : [],

        userInfo: data.userInfo
          ? data.userInfo.map(([key, entry]: [string, any]) => ({
              key,
              value: typeof entry === "object" ? entry.value : entry,
              importance: typeof entry === "object" ? entry.importance : 0.5,
              timestamp: typeof entry === "object" ? new Date(entry.timestamp).toLocaleString() : "Unknown",
            }))
          : [],

        facts: data.facts
          ? data.facts.map(([topic, entry]: [string, any]) => ({
              topic,
              content: typeof entry === "object" ? entry.fact || entry.value : entry,
              source: typeof entry === "object" ? entry.source : "unknown",
              category: typeof entry === "object" ? entry.category : "general",
            }))
          : [],
      }

      setKnowledgeData(processedData)
    } catch (error) {
      console.error("Failed to load knowledge data:", error)
    }
  }

  const handleQuickLinkClick = (dataType: string) => {
    setActiveDataView(dataType)
    loadKnowledgeData()
  }

  const handleEditItem = (type: string, index: number) => {
    setEditingItem(`${type}-${index}`)
  }

  const handleSaveItem = async (type: string, index: number, updatedItem: any) => {
    try {
      // Update the item in the knowledge manager
      // This is a simplified version - you'd need to implement proper update methods
      loadKnowledgeData()
      setEditingItem(null)
      updateStats()
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  const handleAddNewItem = async (type: string) => {
    try {
      const newItem = newItemForm[type]
      if (!newItem) return

      // Add new item to knowledge manager
      // This is a simplified version - you'd need to implement proper add methods

      setNewItemForm({ ...newItemForm, [type]: {} })
      loadKnowledgeData()
      updateStats()
    } catch (error) {
      console.error("Failed to add new item:", error)
    }
  }

  const simulateThinking = async (userInput: string): Promise<string[]> => {
    const thinkingSteps = [
      "🧠 Analyzing input and extracting key information...",
      "🔗 Checking conversation context and personal memories...",
      "🎯 Determining response intent and approach...",
      "📚 Accessing relevant knowledge and facts...",
      "💭 Generating appropriate response...",
      "✨ Finalizing answer with confidence scoring...",
    ]

    const finalThinking: string[] = []

    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      finalThinking.push(thinkingSteps[i])
      await new Promise((resolve) => setTimeout(resolve, 300))
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

      const thinkingSteps = await simulateThinking(userInput)

      let response
      try {
        const personalInfo = knowledgeManager.exportKnowledge().userInfo || new Map()
        response = await aiSystem.processThought(userInput, [], new Map(Array.from(personalInfo.entries())))
      } catch (aiError) {
        console.error("AI processing failed:", aiError)
        response = {
          content: "I'm having trouble processing that message. Could you try rephrasing it?",
          confidence: 0.5,
          reasoning: ["Error occurred during processing"],
        }
      }

      try {
        await knowledgeManager.learnFromMessage(userInput, response.content)
      } catch (learningError) {
        console.warn("Learning failed:", learningError)
      }

      setIsThinking(false)
      setCurrentThinking("")

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
      loadKnowledgeData() // Refresh data after learning
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
      suggestions.push("Try another calculation", "What's 15 × 23?", "Calculate 25% of 80")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

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
          loadKnowledgeData()
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
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">{systemInfo.name || "ZacAI"} Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Knowledge Management & Training Pipeline</p>
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
                    <div className="text-xs text-gray-500">Math</div>
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
              {/* Data View */}
              {activeDataView === "vocabulary" && (
                <div className="space-y-4">
                  {/* Keep System Overview visible */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
                            </div>
                            <div className="text-sm text-green-600">Avg Confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Vocabulary Data
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => setActiveDataView("overview")}>
                            ✕
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {knowledgeData.vocabulary.map((item: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">{item.word}</h4>
                                      <Badge variant="outline">{item.partOfSpeech}</Badge>
                                      <Badge variant="secondary">{item.category}</Badge>
                                    </div>
                                    <p className="text-gray-700 mb-2">{item.definition}</p>
                                    {item.examples && (
                                      <p className="text-sm text-gray-500">
                                        <strong>Examples:</strong> {item.examples}
                                      </p>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditItem("vocabulary", index)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeDataView === "mathematics" && (
                <div className="space-y-4">
                  {/* Keep System Overview visible */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
                            </div>
                            <div className="text-sm text-green-600">Avg Confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Mathematics Data
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => setActiveDataView("overview")}>
                            ✕
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {knowledgeData.mathematics.map((item: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">{item.concept}</h4>
                                      <Badge variant="outline">Level {item.difficulty}</Badge>
                                      <Badge variant="secondary">{item.category}</Badge>
                                    </div>
                                    {item.formula && (
                                      <p className="text-gray-700 mb-2 font-mono bg-gray-100 p-2 rounded">
                                        {item.formula}
                                      </p>
                                    )}
                                    {item.examples && (
                                      <p className="text-sm text-gray-500">
                                        <strong>Examples:</strong> {item.examples}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditItem("mathematics", index)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeDataView === "userInfo" && (
                <div className="space-y-4">
                  {/* Keep System Overview visible */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
                            </div>
                            <div className="text-sm text-green-600">Avg Confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            User Information Data
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => setActiveDataView("overview")}>
                            ✕
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {knowledgeData.userInfo.map((item: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg capitalize">
                                        {item.key.replace(/_/g, " ")}
                                      </h4>
                                      <Badge variant="outline">{Math.round(item.importance * 100)}% important</Badge>
                                    </div>
                                    <p className="text-gray-700 mb-2">{item.value}</p>
                                    <p className="text-xs text-gray-500">Learned: {item.timestamp}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditItem("userInfo", index)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeDataView === "facts" && (
                <div className="space-y-4">
                  {/* Keep System Overview visible */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
                            </div>
                            <div className="text-sm text-green-600">Avg Confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Facts & Knowledge Data
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => setActiveDataView("overview")}>
                            ✕
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {knowledgeData.facts.map((item: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">{item.topic}</h4>
                                      <Badge variant="secondary">{item.category}</Badge>
                                      <Badge variant="outline">{item.source}</Badge>
                                    </div>
                                    <p className="text-gray-700">{item.content}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditItem("facts", index)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeDataView === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {stats.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "0%"}
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
                        <Settings className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={handleExport} className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>

                      <div>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                        <Button asChild className="w-full" variant="outline">
                          <label htmlFor="import-file" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Data
                          </label>
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          updateStats()
                          loadKnowledgeData()
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // CHAT UI REMAINS EXACTLY THE SAME
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
                    <p className="mb-4">
                      I can help with math, remember information about you, and have conversations!
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
                        onClick={() => setInput("My name is John")}
                        className="text-left justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My name is John
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("What can you do?")}
                        className="text-left justify-start"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        What can you do?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Tell me a fact")}
                        className="text-left justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Tell me a fact
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
                                    {knowledge}
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
                                    className="text-xs h-6 px-2"
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
                placeholder="Ask me anything - math, personal questions, or just chat!"
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

      {/* Sidebar - UNCHANGED */}
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
                      <span className="text-sm">All Systems Operational</span>
                    </div>
                    <div className="text-xs text-gray-500">Ready for conversations and learning</div>
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
                    <p className="mb-2">I can help with:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Mathematical calculations</li>
                      <li>• Remembering personal information</li>
                      <li>• General knowledge and facts</li>
                      <li>• Conversational interactions</li>
                      <li>• Learning from our conversations</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Available Cognitive Tools</div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-xs">Mathematical Toolkit</div>
                          <div className="text-xs text-gray-600">Times tables, calculations, expressions</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium text-xs">Vocabulary System</div>
                          <div className="text-xs text-gray-600">432 core English words</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                        <Cloud className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium text-xs">Web Knowledge Engine</div>
                          <div className="text-xs text-gray-600">Definitions and facts</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                        <Brain className="w-4 h-4 text-orange-600" />
                        <div>
                          <div className="font-medium text-xs">Thinking Pipeline</div>
                          <div className="text-xs text-gray-600">Smart tool selection</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                        <Database className="w-4 h-4 text-red-600" />
                        <div>
                          <div className="font-medium text-xs">Personal Memory</div>
                          <div className="text-xs text-gray-600">User information storage</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <div>
                          <div className="font-medium text-xs">Cognitive Router</div>
                          <div className="text-xs text-gray-600">Task routing optimization</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Quick Actions</div>
                    <div className="space-y-2 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("What do you remember about me?")}
                      >
                        Check Memory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("Calculate 15 * 23")}
                      >
                        Test Math
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        onClick={() => setInput("Tell me a random fact")}
                      >
                        Random Fact
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
                    AI Tools & Training
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

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Training Configuration</div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Learning Rate</label>
                        <Input type="range" min="0.1" max="1.0" step="0.1" defaultValue="0.5" className="text-sm" />
                        <div className="text-xs text-gray-500 mt-1">
                          Controls how quickly the AI learns from conversations
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">Confidence Threshold</label>
                        <Input type="range" min="0.5" max="1.0" step="0.05" defaultValue="0.8" className="text-sm" />
                        <div className="text-xs text-gray-500 mt-1">Minimum confidence level for responses</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Enable Thinking Display</label>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Auto-save Learning</label>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Mathematical Processing</label>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Personal Memory Storage</label>
                        <Switch defaultChecked />
                      </div>

                      <Button size="sm" className="w-full">
                        <Settings className="w-3 h-3 mr-1" />
                        Apply Configuration
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">System Management</div>
                    <div className="space-y-2 text-xs">
                      <Button onClick={handleRetrainModel} className="w-full" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retrain Model
                      </Button>
                      <Button onClick={handleOptimizeKnowledge} className="w-full" variant="outline" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Optimize Knowledge
                      </Button>
                      <div>
                        <input
                          type="file"
                          accept=".json,.csv,.txt"
                          onChange={handleBulkImport}
                          className="hidden"
                          id="bulk-import"
                        />
                        <Button asChild className="w-full" variant="outline" size="sm">
                          <label htmlFor="bulk-import" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Import
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Features</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Real-time learning</p>
                      <p>• Mathematical processing</p>
                      <p>• Personal memory storage</p>
                      <p>• Knowledge export/import</p>
                      <p>• Training configuration</p>
                      <p>• System optimization</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Privacy & Security</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• All data stored locally</p>
                      <p>• No external servers</p>
                      <p>• You control your data</p>
                      <p>• Export anytime</p>
                      <p>• Secure processing</p>
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
