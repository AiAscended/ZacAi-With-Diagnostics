"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { KnowledgeManagerV2 } from "@/lib/knowledge-manager-v2"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import { Brain, RefreshCw } from "lucide-react"

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
            <div className="flex items-center justify-between max-w\
