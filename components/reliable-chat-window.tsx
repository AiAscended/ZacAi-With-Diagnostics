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
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { VocabularySeeder } from "@/lib/vocabulary-seeder-safe"
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
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  suggestions?: string[]
  feedback?: "positive" | "negative" | null
}

interface AIStats {
  totalMessages: number
  vocabularySize: number
  memoryEntries: number
  avgConfidence: number
  systemStatus: "loading" | "ready" | "enhanced"
  mathFunctions: number
  seedProgress: number
  responseTime: number
}

interface Suggestion {
  text: string
  type: "question" | "topic" | "action"
}

export default function ReliableChatWindow() {
  const [aiSystem] = useState(() => new ReliableAISystem())
  const [vocabularySeeder] = useState(() => new VocabularySeeder())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [stats, setStats] = useState<AIStats>({
    totalMessages: 0,
    vocabularySize: 0,
    memoryEntries: 0,
    avgConfidence: 0,
    systemStatus: "loading",
    mathFunctions: 0,
    seedProgress: 0,
    responseTime: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSeeding, setIsSeeding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [selectedDataType, setSelectedDataType] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>(null)
  const [showDataModal, setShowDataModal] = useState(false)
  const [newEntry, setNewEntry] = useState("")
  const [newEntryValue, setNewEntryValue] = useState("")

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Update suggestions based on conversation context
    updateSuggestions()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)

      // Initialize with minimal setup - should be instant
      await aiSystem.initialize()

      // Load previous conversations
      const history = aiSystem.getConversationHistory()
      setMessages(history)

      // Update stats
      updateStats()

      // Generate initial suggestions
      updateSuggestions()

      console.log("✅ Reliable AI System initialized successfully!")
    } catch (error) {
      console.error("❌ Failed to initialize:", error)
      setError("Failed to initialize AI system")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    const newStats = aiSystem.getStats()
    const seedProgress = vocabularySeeder.getProgress()
    setStats({
      ...newStats,
      mathFunctions: aiSystem.getMathFunctionCount(),
      seedProgress: seedProgress,
    })
  }

  const updateSuggestions = () => {
    const contextSuggestions = aiSystem.generateSuggestions(messages)
    setSuggestions(contextSuggestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setError(null)

    const startTime = Date.now()

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Get AI response
      const response = await aiSystem.processMessage(userInput)
      const responseTime = Date.now() - startTime

      // Generate suggestions for this response
      const responseSuggestions = aiSystem.generateResponseSuggestions(userInput, response.content)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        suggestions: responseSuggestions,
        feedback: null,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update stats with response time
      aiSystem.updateResponseTime(responseTime)
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput) // Restore input
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text)
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))

    // Send feedback to AI system for learning
    aiSystem.processFeedback(messageId, feedback)
    updateStats()
  }

  const handleSeedVocabulary = async () => {
    if (isSeeding) return

    setIsSeeding(true)
    try {
      await vocabularySeeder.seedIncrementally(aiSystem, (progress) => {
        setStats((prev) => ({ ...prev, seedProgress: progress }))
      })
      updateStats()
    } catch (error) {
      console.error("Seeding failed:", error)
      setError("Failed to seed vocabulary")
    } finally {
      setIsSeeding(false)
    }
  }

  const exportData = () => {
    const data = aiSystem.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "loading":
        return "bg-yellow-500"
      case "ready":
        return "bg-blue-500"
      case "enhanced":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return "text-green-600"
    if (confidence > 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const handleDataClick = (dataType: string) => {
    setSelectedDataType(dataType)
    setShowDataModal(true)
    setEditingData(null)
    setNewEntry("")
    setNewEntryValue("")
  }

  const getDataForType = (dataType: string) => {
    switch (dataType) {
      case "vocabulary":
        return Array.from(aiSystem.getStats().vocabulary || []).map(([word, category]) => ({
          key: word,
          value: category,
          type: "vocabulary",
        }))
      case "memory":
        return Array.from(aiSystem.getStats().memory || []).map(([key, entry]) => ({
          key: key,
          value: typeof entry === "object" ? entry.value : entry,
          timestamp: typeof entry === "object" ? entry.timestamp : Date.now(),
          type: "memory",
        }))
      case "math":
        return Array.from(aiSystem.getStats().mathFunctions || []).map(([name, func]) => ({
          key: name,
          value: func.description || "Mathematical function",
          examples: func.examples || [],
          type: "math",
        }))
      case "conversations":
        return aiSystem
          .getConversationHistory()
          .slice(-20)
          .map((msg, idx) => ({
            key: `${msg.role}-${idx}`,
            value: msg.content.substring(0, 100) + (msg.content.length > 100 ? "..." : ""),
            timestamp: msg.timestamp,
            role: msg.role,
            type: "conversations",
          }))
      default:
        return []
    }
  }

  const handleEditEntry = (entry: any) => {
    setEditingData(entry)
    setNewEntry(entry.key)
    setNewEntryValue(entry.value)
  }

  const handleSaveEntry = async () => {
    if (!selectedDataType || !newEntry.trim()) return

    try {
      switch (selectedDataType) {
        case "vocabulary":
          await aiSystem.addVocabularyWord(newEntry.trim(), newEntryValue || "user-added")
          break
        case "memory":
          await aiSystem.addMemoryEntry(newEntry.trim(), newEntryValue || newEntry.trim())
          break
        case "math":
          // For math, we'll just add to vocabulary as a math term
          await aiSystem.addVocabularyWord(newEntry.trim(), "math-term")
          break
      }

      updateStats()
      setEditingData(null)
      setNewEntry("")
      setNewEntryValue("")
    } catch (error) {
      console.error("Failed to save entry:", error)
    }
  }

  const handleDeleteEntry = async (entry: any) => {
    if (!selectedDataType) return

    try {
      switch (selectedDataType) {
        case "vocabulary":
          await aiSystem.removeVocabularyWord(entry.key)
          break
        case "memory":
          await aiSystem.removeMemoryEntry(entry.key)
          break
      }

      updateStats()
    } catch (error) {
      console.error("Failed to delete entry:", error)
    }
  }

  const closeDataModal = () => {
    setShowDataModal(false)
    setSelectedDataType(null)
    setEditingData(null)
    setNewEntry("")
    setNewEntryValue("")
  }

  if (showMetrics) {
    return (
      <div className="h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">AI Metrics Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">Chat View</span>
                <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                <span className="text-sm">Metrics</span>
              </div>
            </div>
          </div>

          {/* Quick Stats - Make them clickable */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDataClick("conversations")}
            >
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <div className="text-sm text-gray-500">Total Messages</div>
                <div className="text-xs text-blue-600 mt-1">Click to view</div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDataClick("vocabulary")}
            >
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.vocabularySize}</div>
                <div className="text-sm text-gray-500">Vocabulary Size</div>
                <div className="text-xs text-green-600 mt-1">Click to view</div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDataClick("memory")}
            >
              <CardContent className="p-4 text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{stats.memoryEntries}</div>
                <div className="text-sm text-gray-500">User Info</div>
                <div className="text-xs text-purple-600 mt-1">Click to view</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDataClick("math")}>
              <CardContent className="p-4 text-center">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats.mathFunctions}</div>
                <div className="text-sm text-gray-500">Math Functions</div>
                <div className="text-xs text-orange-600 mt-1">Click to view</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(stats.systemStatus)}`} />
                      <span className="capitalize text-sm">{stats.systemStatus}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Confidence</span>
                    <span className={`text-sm font-mono ${getConfidenceColor(stats.avgConfidence)}`}>
                      {Math.round(stats.avgConfidence * 100)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-sm font-mono">{stats.responseTime}ms</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vocabulary Seeding</span>
                      <span>{Math.round(stats.seedProgress)}%</span>
                    </div>
                    <Progress value={stats.seedProgress} className="h-2" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">System Capabilities</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Conversational AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Memory System</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Learning Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Math Functions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vocabulary Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Vocabulary Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Vocabulary</span>
                    <span className="text-sm font-mono">{stats.vocabularySize} words</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seeding Progress</span>
                    <span className="text-sm font-mono">{Math.round(stats.seedProgress)}%</span>
                  </div>

                  <Progress value={stats.seedProgress} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button onClick={handleSeedVocabulary} disabled={isSeeding} className="w-full">
                    {isSeeding ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Seeding Vocabulary...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Seed More Vocabulary
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Adds vocabulary incrementally</p>
                    <p>• Includes mathematical functions</p>
                    <p>• Safe loading prevents crashes</p>
                    <p>• Background processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Memory System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Entries</span>
                    <span className="text-sm font-mono">{stats.memoryEntries}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversations Stored</span>
                    <span className="text-sm font-mono">{Math.floor(stats.totalMessages / 2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Memory Features</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Remembers user preferences</p>
                    <p>• Stores conversation context</p>
                    <p>• Learns from interactions</p>
                    <p>• Contextual responses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mathematical Functions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Mathematical Functions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Functions</span>
                    <span className="text-sm font-mono">{stats.mathFunctions}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Supported Operations</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>• Basic arithmetic</div>
                    <div>• Trigonometry</div>
                    <div>• Logarithms</div>
                    <div>• Statistics</div>
                    <div>• Algebra</div>
                    <div>• Calculus basics</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  <p>Try: "Calculate 2+2", "What's sin(30)?", "Square root of 16"</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Viewing/Editing Modal */}
          {showDataModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold capitalize">
                      {selectedDataType === "memory" ? "User Information" : selectedDataType} Data
                    </h2>
                    <Button variant="ghost" onClick={closeDataModal}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Add New Entry Form */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Add New Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder={
                          selectedDataType === "memory"
                            ? 'Memory key (e.g., "name", "job")'
                            : selectedDataType === "vocabulary"
                              ? "Word"
                              : selectedDataType === "math"
                                ? "Function name"
                                : "Entry"
                        }
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                      />
                      <Input
                        placeholder={
                          selectedDataType === "memory"
                            ? 'Value (e.g., "John", "Developer")'
                            : selectedDataType === "vocabulary"
                              ? "Category"
                              : selectedDataType === "math"
                                ? "Description"
                                : "Value"
                        }
                        value={newEntryValue}
                        onChange={(e) => setNewEntryValue(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveEntry} className="mt-3" disabled={!newEntry.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>

                  {/* Data List */}
                  <div className="space-y-3">
                    {getDataForType(selectedDataType || "").map((entry, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                        {editingData?.key === entry.key ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder="Key" />
                              <Input
                                value={newEntryValue}
                                onChange={(e) => setNewEntryValue(e.target.value)}
                                placeholder="Value"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEntry}>
                                <Check className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingData(null)}>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="font-medium text-sm">{entry.key}</div>
                                {entry.type === "memory" && entry.timestamp && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                  </div>
                                )}
                                {entry.type === "conversations" && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.role}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{entry.value}</div>
                              {entry.examples && entry.examples.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">Examples: {entry.examples.join(", ")}</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditEntry(entry)}
                                disabled={entry.type === "conversations"}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteEntry(entry)}
                                disabled={entry.type === "conversations" || entry.type === "math"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {getDataForType(selectedDataType || "").length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No {selectedDataType} data found</p>
                        <p className="text-sm">Add some entries using the form above</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Reliable Browser AI
                <Badge variant="outline" className="ml-2">
                  {stats.vocabularySize} words
                </Badge>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(stats.systemStatus)}`} />
              </CardTitle>

              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>{stats.totalMessages}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="w-4 h-4 text-purple-500" />
                    <span>{stats.memoryEntries}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-orange-500" />
                    <span>{stats.mathFunctions}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Metrics</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-12 h-12 opacity-50" />
                    <Cloud className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="text-lg font-medium mb-2">Welcome to Enhanced Browser AI!</p>
                  <p className="mb-4">I can chat, remember, calculate, and learn from you!</p>

                  {/* Initial Suggestions */}
                  <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Hello! How do you work?")}
                      className="text-left"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      How do you work?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Calculate 15 * 23")}
                      className="text-left"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate 15 × 23
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Remember: I'm a developer")}
                      className="text-left"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Test memory
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("What can you do?")}
                      className="text-left"
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
                                <span>{Math.round(message.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>

                          {/* Feedback Buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${message.feedback === "positive" ? "text-green-600" : ""}`}
                              onClick={() => handleFeedback(message.id, "positive")}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${message.feedback === "negative" ? "text-red-600" : ""}`}
                              onClick={() => handleFeedback(message.id, "negative")}
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
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                      <Cloud className="w-4 h-4 text-gray-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Context Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Suggested topics:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here... (try math, memory, or questions)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
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
      <div className="w-80 p-4">
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  System Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                    <div className="text-xs text-gray-500">Messages</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.vocabularySize}</div>
                    <div className="text-xs text-gray-500">Vocabulary</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.memoryEntries}</div>
                    <div className="text-xs text-gray-500">Memories</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.mathFunctions}</div>
                    <div className="text-xs text-gray-500">Math Funcs</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span className={getConfidenceColor(stats.avgConfidence)}>
                      {Math.round(stats.avgConfidence * 100)}%
                    </span>
                  </div>
                  <Progress value={stats.avgConfidence * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vocabulary Seeding</span>
                    <span>{Math.round(stats.seedProgress)}%</span>
                  </div>
                  <Progress value={stats.seedProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Memory System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">The AI remembers:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Previous conversations</li>
                    <li>• Topics you've discussed</li>
                    <li>• Your preferences</li>
                    <li>• Mathematical calculations</li>
                    <li>• Context from earlier messages</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Try These</div>
                  <div className="space-y-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setInput("Remember that I work as a developer")}
                    >
                      "Remember that I work as a developer"
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setInput("What did we talk about earlier?")}
                    >
                      "What did we talk about earlier?"
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setInput("Calculate the square root of 144")}
                    >
                      "Calculate the square root of 144"
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleSeedVocabulary} disabled={isSeeding} className="w-full" variant="outline">
                  {isSeeding ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seed Vocabulary
                    </>
                  )}
                </Button>

                <Button onClick={exportData} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Vocabulary seeding adds words safely</p>
                  <p>• Mathematical functions included</p>
                  <p>• Background processing prevents crashes</p>
                  <p>• Export saves all AI data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
