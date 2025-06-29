"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ReasoningEngine } from "@/lib/reasoning-engine"

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

export default function MasterAIChat() {
  const [aiSystem] = useState(() => new ReasoningEngine())
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
    version: "3.0.0",
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
  const [loadingSteps, setLoadingSteps] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({})
  const [connectionStatus, setConnectionStatus] = useState<any>({})
  const initStartTime = useRef<number>(0)
  const [showDiagnostics, setShowDiagnostics] = useState(true)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  const initializeSystem = async () => {
    try {
      setError(null)
      console.log("🚀 Initializing Unified AI System...")

      await aiSystem.initialize()
      console.log("✅ Unified AI System initialized successfully")

      const stats = aiSystem.getSystemStats()
      console.log("🔍 System Stats:", stats)

      setSystemInfo(stats.identity || { name: "ZacAI", version: "3.0.0" })

      updateStats()
      loadKnowledgeData()

      const history = aiSystem.getConversationHistory()
      const formattedHistory = history.map((msg: any, index: number) => ({
        id: index.toString(),
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
      }))
      setMessages(formattedHistory)

      setIsInitializing(false)
      console.log("✅ Unified AI System fully operational!")
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
      const aiStats = aiSystem.getSystemStats()
      console.log("📊 Unified AI Stats:", aiStats)

      setStats({
        vocabulary: aiStats.vocabulary?.total || 0,
        mathematics: aiStats.mathematics?.total || 0,
        userInfo: aiStats.vocabulary?.learned || 0, // Using learned vocab as user info for now
        facts: aiStats.facts?.total || 0,
        conversations: aiStats.conversations || 0,
        totalEntries: aiStats.vocabulary?.total + aiStats.mathematics?.total + aiStats.facts?.total || 0,
        lastUpdated: Date.now(),
        version: "3.0.0",
        systemStatus: "Ready",
        avgConfidence: 0.85,
        breakdown: aiStats,
      })
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const loadKnowledgeData = () => {
    try {
      console.log("📚 Loading knowledge data from Unified AI system...")

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
      "💭 Generating comprehensive response...",
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

    const startTime = performance.now()

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
      const responseTime = performance.now() - startTime

      console.log(`✅ Response generated in ${responseTime.toFixed(2)}ms`)
      console.log(`🎯 Response confidence: ${(response.confidence * 100).toFixed(1)}%`)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        knowledgeUsed: response.knowledgeUsed || [],
        suggestions: generateSuggestions(userInput, response.content),
        thinking: [...thinkingSteps, ...(response.reasoning || [])],
        mathAnalysis: response.mathAnalysis,
        responseTime: responseTime,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update performance metrics
      setPerformanceMetrics((prev: any) => {
        const newAvg = prev.averageResponseTime === 0 ? responseTime : (prev.averageResponseTime + responseTime) / 2

        return {
          ...prev,
          averageResponseTime: newAvg,
          firstResponseTime: prev.firstResponseTime === 0 ? responseTime : prev.firstResponseTime,
        }
      })

      updateStats()
    } catch (error) {
      console.error("❌ Error processing message:", error)
      setError(`Failed to process message: ${error}`)
      setInput(userInput) // Restore input
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setCurrentThinking("")
    }
  }

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const suggestions: string[] = []

    if (aiResponse.includes("math") || aiResponse.includes("calculate") || aiResponse.includes("result")) {
      suggestions.push("Try another calculation", "What's 15 × 23?", "Calculate 25 + 17")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("learn")) {
      suggestions.push("What do you remember about me?", "Tell me what you've learned")
    }

    if (userInput.toLowerCase().includes("what") ||
