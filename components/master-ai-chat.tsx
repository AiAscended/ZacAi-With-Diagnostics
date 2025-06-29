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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert" // Added Alert components
import {
  Brain,
  BookOpen,
  TrendingUp,
  Cloud,
  Lightbulb,
  Calculator,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Download,
  Search,
  Zap,
  User,
  ChevronDown,
  ChevronUp,
  Database,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react" // Added CheckCircle for diagnostic steps
import { ReasoningEngine } from "@/lib/reasoning-engine"
import { setKnowledgeData } from "@/lib/knowledge-data" // Declare the variable before using it

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
  responseTime?: number // Added for performance tracking
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
  vocabularySize?: number // From DiagnosticAISystem
  mathFunctions?: number // From DiagnosticAISystem
  memoryEntries?: number // From DiagnosticAISystem
  seedProgress?: number // For overall seeding progress
}

export default function MasterAIChat() {
  const [aiSystem] = useState(() => new ReasoningEngine())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true) // Default to true for diagnostics
  const [stats, setStats] = useState<AIStats>({
    vocabulary: 0,
    mathematics: 0,
    userInfo: 0,
    facts: 0,
    conversations: 0,
    totalEntries: 0,
    lastUpdated: 0,
    version: "3.0.0",
    vocabularySize: 0,
    mathFunctions: 0,
    memoryEntries: 0,
    seedProgress: 0,
  })
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})
  const [currentThinking, setCurrentThinking] = useState<string>("")
  const [isThinking, setIsThinking] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({
    initializationTime: 0,
    firstResponseTime: 0,
    averageResponseTime: 0,
    memoryUsage: 0, // Placeholder, actual memory usage is hard to get in browser
  })
  const [connectionStatus, setConnectionStatus] = useState<"good" | "slow" | "offline" | "checking">("checking")
  const initStartTime = useRef<number>(0)

  useEffect(() => {
    runInitializationSequence()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking, loadingSteps])

  const runInitializationSequence = async () => {
    initStartTime.current = performance.now()
    const initialSteps = [
      { name: "System Startup", status: "pending", details: "Initializing core AI modules..." },
      { name: "Memory Check", status: "pending", details: "Verifying memory integrity..." },
      { name: "LocalStorage Access", status: "pending", details: "Checking browser storage..." },
      { name: "Basic Vocabulary Load", status: "pending", details: "Loading essential words..." },
      { name: "Math Functions Load", status: "pending", details: "Loading mathematical capabilities..." },
      { name: "Conversation History", status: "pending", details: "Retrieving past interactions..." },
      { name: "Memory System Ready", status: "pending", details: "Activating long-term memory..." },
      { name: "Final Setup", status: "pending", details: "Completing system configurations..." },
    ]
    setLoadingSteps(initialSteps)
    setConnectionStatus("checking")
    setError(null)

    const currentSteps = [...initialSteps]

    const updateStep = (index: number, status: string, details?: string, errorMsg?: string, duration?: number) => {
      currentSteps[index] = {
        ...currentSteps[index],
        status,
        details: details || currentSteps[index].details,
        error: errorMsg,
        duration,
      }
      setLoadingSteps([...currentSteps])
    }

    const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 100))

    // Simulate connection check
    await simulateDelay(200)
    setConnectionStatus("good") // Assume good connection for now

    try {
      // Step 0: System Startup
      let stepStartTime = performance.now()
      updateStep(0, "loading", "Starting core AI modules...")
      await simulateDelay(300)
      await aiSystem.initializeCoreModules()
      updateStep(0, "completed", "Core modules initialized.", undefined, performance.now() - stepStartTime)

      // Step 1: Memory Check
      stepStartTime = performance.now()
      updateStep(1, "loading", "Verifying memory integrity...")
      await simulateDelay(200)
      await aiSystem.checkMemoryIntegrity()
      updateStep(1, "completed", "Memory integrity verified.", undefined, performance.now() - stepStartTime)

      // Step 2: LocalStorage Access
      stepStartTime = performance.now()
      updateStep(2, "loading", "Checking browser storage access...")
      await simulateDelay(150)
      await aiSystem.checkLocalStorageAccess()
      updateStep(2, "completed", "Browser storage accessible.", undefined, performance.now() - stepStartTime)

      // Step 3: Basic Vocabulary Load
      stepStartTime = performance.now()
      updateStep(3, "loading", "Loading essential vocabulary...")
      await simulateDelay(400)
      await aiSystem.loadVocabulary()
      updateStep(
        3,
        "completed",
        `Loaded ${aiSystem.getSystemStats().vocabularySize} words.`,
        undefined,
        performance.now() - stepStartTime,
      )

      // Step 4: Math Functions Load
      stepStartTime = performance.now()
      updateStep(4, "loading", "Loading mathematical capabilities...")
      await simulateDelay(250)
      await aiSystem.loadMathFunctions()
      updateStep(
        4,
        "completed",
        `Loaded ${aiSystem.getMathFunctionCount()} math functions.`,
        undefined,
        performance.now() - stepStartTime,
      )

      // Step 5: Conversation History
      stepStartTime = performance.now()
      updateStep(5, "loading", "Retrieving past conversations...")
      await simulateDelay(350)
      await aiSystem.loadConversationHistory()
      const history = aiSystem.getConversationHistory()
      const formattedHistory = history.map((msg: any, index: number) => ({
        id: index.toString(),
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
      }))
      setMessages(formattedHistory)
      updateStep(
        5,
        "completed",
        `Loaded ${history.length} conversations.`,
        undefined,
        performance.now() - stepStartTime,
      )

      // Step 6: Memory System Ready
      stepStartTime = performance.now()
      updateStep(6, "loading", "Activating long-term memory system...")
      await simulateDelay(300)
      await aiSystem.activateMemorySystem()
      updateStep(
        6,
        "completed",
        `Memory system active with ${aiSystem.getMemoryEntryCount()} entries.`,
        undefined,
        performance.now() - stepStartTime,
      )

      // Step 7: Final Setup
      stepStartTime = performance.now()
      updateStep(7, "loading", "Completing system configurations...")
      await simulateDelay(100)
      await aiSystem.finalizeSetup()
      updateStep(7, "completed", "System ready for interaction.", undefined, performance.now() - stepStartTime)

      const totalInitTime = performance.now() - initStartTime.current
      setPerformanceMetrics((prev) => ({ ...prev, initializationTime: totalInitTime }))
      setIsInitializing(false)
      updateStats()
      loadKnowledgeData()
      console.log("✅ All initialization steps completed. System fully operational.")
    } catch (e: any) {
      console.error("❌ Initialization failed:", e)
      setError(`System initialization failed: ${e.message || "Unknown error"}`)
      setIsInitializing(false)
      // Mark all subsequent steps as failed if an error occurs
      const failedIndex = currentSteps.findIndex((step) => step.status === "loading")
      if (failedIndex !== -1) {
        for (let i = failedIndex; i < currentSteps.length; i++) {
          updateStep(i, "failed", `Failed due to previous error: ${e.message || "Unknown error"}`)
        }
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    try {
      const aiStats = aiSystem.getSystemStats()
      setStats({
        vocabulary: aiStats.vocabulary?.total || 0,
        mathematics: aiStats.mathematics?.total || 0,
        userInfo: aiStats.vocabulary?.learned || 0,
        facts: aiStats.facts?.total || 0,
        conversations: aiStats.conversations || 0,
        totalEntries: aiStats.vocabulary?.total + aiStats.mathematics?.total + aiStats.facts?.total || 0,
        lastUpdated: Date.now(),
        version: "3.0.0",
        systemStatus: "Ready",
        avgConfidence: aiStats.avgConfidence || 0.85, // Use actual avgConfidence if available
        breakdown: aiStats,
        vocabularySize: aiStats.vocabularySize || 0,
        mathFunctions: aiStats.mathFunctions || 0,
        memoryEntries: aiStats.memoryEntries || 0,
        seedProgress: (aiStats.vocabulary?.total / 1000) * 100 || 0, // Example progress
      })
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const loadKnowledgeData = () => {
    try {
      const vocabularyList = aiSystem.getVocabularyList()
      const mathHistory = aiSystem.getMathematicsHistory()
      const debugInfo = aiSystem.getSystemDebugInfo()

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
      setKnowledgeData(processedData)
    } catch (error) {
      console.error("❌ Failed to load knowledge data:", error)
    }
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

      const thinkingSteps = await simulateThinking(userInput)

      const response = await aiSystem.processMessage(userInput)
      const responseTime = performance.now() - startTime

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

      setPerformanceMetrics((prev: any) => {
        const newAvg = prev.averageResponseTime === 0 ? responseTime : (prev.averageResponseTime + responseTime) / 2
        return {
          ...prev,
          averageResponseTime: newAvg,
          firstResponseTime: prev.firstResponseTime === 0 ? responseTime : prev.firstResponseTime,
        }
      })

      updateStats()
    } catch (error: any) {
      console.error("Error processing message:", error)
      setError(`Failed to process message: ${error.message || "Unknown error"}`)
      setInput(userInput)
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

    if (userInput.toLowerCase().includes("what") || userInput.toLowerCase().includes("how")) {
      suggestions.push("Can you explain more?", "Give me an example")
    }

    if (/\d/.test(userInput)) {
      suggestions.push("Try a different math problem", "What's 2x2?", "Calculate 5+5")
    }

    suggestions.push("Tell me something interesting", "What can you do?", "Self diagnostic")

    return suggestions.slice(0, 4)
  }

  const handleExport = () => {
    try {
      const aiData = aiSystem.exportData()

      const combinedData = {
        cognitiveProcessor: aiData,
        exportDate: new Date().toISOString(),
        version: "3.0.0",
      }

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-cognitive-export-${new Date().toISOString().split("T")[0]}.json`
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

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "good":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "slow":
        return <Wifi className="w-4 h-4 text-yellow-500" />
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-500" />
      case "checking":
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "loading":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (isInitializing) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI System Diagnostic Loading
              {getConnectionIcon()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Connection: <strong className="capitalize">{connectionStatus}</strong>
                {connectionStatus === "slow" && " - This may affect loading times"}
                {connectionStatus === "offline" && " - Some features may not work"}
              </AlertDescription>
            </Alert>

            {/* Loading Steps */}
            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <div key={step.name} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{step.name}</span>
                      {step.duration && <span className="text-xs text-gray-500">{step.duration.toFixed(0)}ms</span>}
                    </div>
                    <div className="text-sm text-gray-600">
                      {step.error ? <span className="text-red-600">Error: {step.error}</span> : step.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>
                  {loadingSteps.filter((s) => s.status === "completed").length} / {loadingSteps.length}
                </span>
              </div>
              <Progress
                value={(loadingSteps.filter((s) => s.status === "completed").length / loadingSteps.length) * 100}
                className="h-2"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
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
                {systemInfo.name || "ZacAI"}
                <Badge variant="outline">Cognitive System</Badge>
                {getConnectionIcon()}
              </CardTitle>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Init: {performanceMetrics.initializationTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Avg: {performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Admin</span>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-12 h-12 opacity-50" />
                    <Calculator className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="text-lg font-medium mb-2">Hello! I'm {systemInfo.name || "ZacAI"} 🧠</p>
                  <p className="mb-4">
                    I'm ZacAI - an advanced AI system with neural learning and comprehensive knowledge management!
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
                      onClick={() => setInput("What is serendipity")}
                      className="text-left justify-start"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      What is serendipity
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("My name is Ron")}
                      className="text-left justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      My name is Ron
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
                            {message.responseTime && (
                              <span className="text-gray-500">{message.responseTime.toFixed(0)}ms</span>
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
                      <Loader2 className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-500">{systemInfo.name || "ZacAI"} is processing...</span>
                      <Cloud className="w-4 h-4 text-gray-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything - math, definitions, coding, or self-analysis!"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Zap className="w-4 h-4 mr-2" />
                Send
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      {showMetrics && (
        <div className="w-80 flex-shrink-0 p-4 overflow-hidden">
          <Tabs defaultValue="stats" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="stats" className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      System Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.conversations}</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.vocabulary}</div>
                        <div className="text-xs text-gray-500">Vocabulary</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.memoryEntries}</div>
                        <div className="text-xs text-gray-500">Memories</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.mathematics}</div>
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
                          className="w-full text-left justify-start bg-transparent"
                          onClick={() => setInput("Remember that I work as a developer")}
                        >
                          "Remember that I work as a developer"
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start bg-transparent"
                          onClick={() => setInput("What did we talk about earlier?")}
                        >
                          "What did we talk about earlier?"
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start bg-transparent"
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
                    <Button onClick={handleExport} className="w-full bg-transparent" variant="outline">
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
            </div>
          </Tabs>
        </div>
      )}
    </div>
  )
}
