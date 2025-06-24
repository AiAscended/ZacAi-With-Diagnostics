"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import { VocabularySeeder } from "@/lib/vocabulary-seeder-safe"
import {
  Brain,
  BookOpen,
  MessageCircle,
  Database,
  Lightbulb,
  Calculator,
  BarChart3,
  Settings,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Check,
  X,
  Zap,
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

export default function CognitiveChatWindow() {
  const [aiSystem] = useState(() => new CognitiveAISystem())
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
    updateSuggestions()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)
      await aiSystem.initialize()

      const history = aiSystem.getConversationHistory()
      setMessages(history)

      updateStats()
      updateSuggestions()

      console.log("✅ Cognitive AI System initialized successfully!")
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

    console.log("📊 Stats update:", {
      mathFunctions: newStats.mathFunctions,
      memoryEntries: newStats.memoryEntries,
      personalInfo: newStats.personalInfoData?.size,
      facts: newStats.factsData?.size,
      memory: newStats.memoryData?.size,
    })

    setStats({
      totalMessages: newStats.totalMessages,
      vocabularySize: newStats.vocabularySize,
      memoryEntries: newStats.memoryEntries,
      avgConfidence: newStats.avgConfidence,
      systemStatus: newStats.systemStatus,
      mathFunctions: newStats.mathFunctions,
      seedProgress: seedProgress,
      responseTime: newStats.responseTime,
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
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Use cognitive processing
      const response = await aiSystem.processMessage(userInput)
      const responseTime = Date.now() - startTime

      const responseSuggestions = aiSystem.generateResponseSuggestions(userInput, response.content)

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

      aiSystem.updateResponseTime(responseTime)
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text)
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
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
    a.download = `cognitive-ai-data-${new Date().toISOString().split("T")[0]}.json`
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
    const currentStats = aiSystem.getStats()

    switch (dataType) {
      case "vocabulary":
        if (currentStats.vocabularyData && currentStats.vocabularyData instanceof Map) {
          return Array.from(currentStats.vocabularyData.entries()).map(([word, category]) => ({
            key: word,
            value: category,
            type: "vocabulary",
          }))
        }
        return []

      case "memory":
        const allUserData: any[] = []

        // Add personal info
        if (currentStats.personalInfoData && currentStats.personalInfoData instanceof Map) {
          Array.from(currentStats.personalInfoData.entries()).forEach(([key, entry]) => {
            allUserData.push({
              key: key,
              value: typeof entry === "object" ? entry.value : entry,
              timestamp: typeof entry === "object" ? entry.timestamp : Date.now(),
              type: "personal_info",
              source: typeof entry === "object" ? entry.source : "unknown",
            })
          })
        }

        // Add memory entries
        if (currentStats.memoryData && currentStats.memoryData instanceof Map) {
          Array.from(currentStats.memoryData.entries()).forEach(([key, entry]) => {
            allUserData.push({
              key: key,
              value: typeof entry === "object" ? entry.value : entry,
              timestamp: typeof entry === "object" ? entry.timestamp : Date.now(),
              type: "memory",
              source: "conversation",
            })
          })
        }

        // Add facts
        if (currentStats.factsData && currentStats.factsData instanceof Map) {
          Array.from(currentStats.factsData.entries()).forEach(([key, entry]) => {
            allUserData.push({
              key: key,
              value: typeof entry === "object" ? entry.value : entry,
              timestamp: typeof entry === "object" ? entry.timestamp : Date.now(),
              type: "fact",
              source: typeof entry === "object" ? entry.source : "system",
            })
          })
        }

        return allUserData

      case "math":
        if (currentStats.mathFunctionsData && currentStats.mathFunctionsData instanceof Map) {
          return Array.from(currentStats.mathFunctionsData.entries()).map(([name, func]) => ({
            key: name,
            value: func.description || "Mathematical function",
            examples: func.examples || [],
            type: "math",
          }))
        }
        return []

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
              <h1 className="text-2xl font-bold">Cognitive AI Metrics Dashboard</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Zap className="w-3 h-3 mr-1" />
                Cognitive Engine
              </Badge>
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

          {/* Quick Stats */}
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
                <div className="text-sm text-gray-500">User Info & Facts</div>
                <div className="text-xs text-purple-600 mt-1">Click to view all</div>
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

          {/* Data Modal */}
          {showDataModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold capitalize">
                      {selectedDataType === "memory" ? "All User Information & Facts" : selectedDataType} Data
                    </h2>
                    <Button variant="ghost" onClick={closeDataModal}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Data List */}
                  <div className="space-y-3">
                    {getDataForType(selectedDataType || "").map((entry, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-sm">{entry.key}</div>
                              <Badge variant="secondary" className="text-xs">
                                {entry.type}
                              </Badge>
                              {entry.source && (
                                <Badge variant="outline" className="text-xs">
                                  {entry.source}
                                </Badge>
                              )}
                              {entry.timestamp && (
                                <div className="text-xs text-gray-500">
                                  {new Date(entry.timestamp).toLocaleDateString()}
                                </div>
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
                              disabled={entry.type === "conversations" || entry.type === "fact"}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEntry(entry)}
                              disabled={
                                entry.type === "conversations" || entry.type === "math" || entry.type === "fact"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {getDataForType(selectedDataType || "").length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <div>No {selectedDataType} data available</div>
                      </div>
                    )}
                  </div>

                  {/* Add New Entry */}
                  {selectedDataType && ["vocabulary", "memory"].includes(selectedDataType) && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-3">
                        {editingData ? "Edit Entry" : `Add New ${selectedDataType} Entry`}
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder={`Enter ${selectedDataType} key...`}
                          value={newEntry}
                          onChange={(e) => setNewEntry(e.target.value)}
                        />
                        <Input
                          placeholder={`Enter ${selectedDataType} value...`}
                          value={newEntryValue}
                          onChange={(e) => setNewEntryValue(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEntry} disabled={!newEntry.trim()}>
                            <Check className="w-4 h-4 mr-2" />
                            {editingData ? "Update" : "Add"}
                          </Button>
                          {editingData && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingData(null)
                                setNewEntry("")
                                setNewEntryValue("")
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Cognitive System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor(stats.systemStatus)}`} />
                  <div className="text-sm font-medium capitalize">{stats.systemStatus}</div>
                  <div className="text-xs text-gray-500">System Status</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                    {Math.round(stats.avgConfidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Avg Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.responseTime}ms</div>
                  <div className="text-xs text-gray-500">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(stats.seedProgress)}%</div>
                  <div className="text-xs text-gray-500">Seed Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSeedVocabulary} disabled={isSeeding} variant="outline">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSeeding ? "animate-spin" : ""}`} />
                  {isSeeding ? "Seeding..." : "Seed Vocabulary"}
                </Button>
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await aiSystem.clearAllData()
                      setMessages([])
                      updateStats()
                    } catch (error) {
                      console.error("Failed to clear data:", error)
                    }
                  }}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Chat Interface - REVERT TO ORIGINAL LAYOUT
  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Stats Panel */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="font-semibold">Cognitive AI System</h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Enhanced
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(stats.systemStatus)}`} />
            <span className="text-sm text-gray-600 capitalize">{stats.systemStatus}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 space-y-3">
          <div
            className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleDataClick("conversations")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Messages</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.totalMessages}</span>
            </div>
          </div>

          <div
            className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleDataClick("vocabulary")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Vocabulary</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.vocabularySize}</span>
            </div>
          </div>

          <div
            className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => handleDataClick("memory")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">User Info</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.memoryEntries}</span>
            </div>
          </div>

          <div
            className="p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => handleDataClick("math")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Math Functions</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{stats.mathFunctions}</span>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="p-4 border-t">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            System Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence</span>
              <span className={`font-medium ${getConfidenceColor(stats.avgConfidence)}`}>
                {Math.round(stats.avgConfidence * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="font-medium">{stats.responseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seed Progress</span>
              <span className="font-medium">{Math.round(stats.seedProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t mt-auto">
          <div className="space-y-2">
            <Button onClick={handleSeedVocabulary} disabled={isSeeding} variant="outline" size="sm" className="w-full">
              <RefreshCw className={`w-4 h-4 mr-2 ${isSeeding ? "animate-spin" : ""}`} />
              {isSeeding ? "Seeding..." : "Seed Vocabulary"}
            </Button>
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button onClick={() => setShowMetrics(!showMetrics)} variant="outline" size="sm" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-1" />
                Metrics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Cognitive AI Chat</h1>
              <p className="text-sm text-gray-500">
                Enhanced with cognitive processing • {stats.memoryEntries} user info items stored
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Cognitive Engine Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Cognitive AI</h2>
              <p className="text-gray-500 mb-6">
                I'm powered by an advanced cognitive processing engine. Try telling me about yourself!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-medium">Smart Reasoning</div>
                  <div className="text-sm text-gray-500">Advanced thought processing</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Memory System</div>
                  <div className="text-sm text-gray-500">Remembers personal details</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <Calculator className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Math Processing</div>
                  <div className="text-sm text-gray-500">Advanced calculations</div>
                </Card>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user" ? "bg-purple-600 text-white" : "bg-white border shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === "assistant" && <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.confidence !== undefined && (
                        <span
                          className={
                            message.role === "user" ? "text-purple-200" : getConfidenceColor(message.confidence)
                          }
                        >
                          {Math.round(message.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>

                    {/* Response suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Feedback buttons */}
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`p-1 ${message.feedback === "positive" ? "text-green-600" : "text-gray-400"}`}
                          onClick={() => handleFeedback(message.id, "positive")}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`p-1 ${message.feedback === "negative" ? "text-red-600" : "text-gray-400"}`}
                          onClick={() => handleFeedback(message.id, "negative")}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">Processing with cognitive engine...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-4 py-2 bg-white border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-2">Suggestions:</span>
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything... I'll use cognitive processing to understand and respond intelligently."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Keep the existing data modal exactly as it was */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold capitalize">
                  {selectedDataType === "memory" ? "All User Information & Facts" : selectedDataType} Data
                </h2>
                <Button variant="ghost" onClick={closeDataModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Data List */}
              <div className="space-y-3">
                {getDataForType(selectedDataType || "").map((entry, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-sm">{entry.key}</div>
                          <Badge variant="secondary" className="text-xs">
                            {entry.type}
                          </Badge>
                          {entry.source && (
                            <Badge variant="outline" className="text-xs">
                              {entry.source}
                            </Badge>
                          )}
                          {entry.timestamp && (
                            <div className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
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
                          disabled={entry.type === "conversations" || entry.type === "fact"}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEntry(entry)}
                          disabled={entry.type === "conversations" || entry.type === "math" || entry.type === "fact"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {getDataForType(selectedDataType || "").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div>No {selectedDataType} data available</div>
                  </div>
                )}
              </div>

              {/* Add New Entry */}
              {selectedDataType && ["vocabulary", "memory"].includes(selectedDataType) && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">
                    {editingData ? "Edit Entry" : `Add New ${selectedDataType} Entry`}
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder={`Enter ${selectedDataType} key...`}
                      value={newEntry}
                      onChange={(e) => setNewEntry(e.target.value)}
                    />
                    <Input
                      placeholder={`Enter ${selectedDataType} value...`}
                      value={newEntryValue}
                      onChange={(e) => setNewEntryValue(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEntry} disabled={!newEntry.trim()}>
                        <Check className="w-4 h-4 mr-2" />
                        {editingData ? "Update" : "Add"}
                      </Button>
                      {editingData && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingData(null)
                            setNewEntry("")
                            setNewEntryValue("")
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
