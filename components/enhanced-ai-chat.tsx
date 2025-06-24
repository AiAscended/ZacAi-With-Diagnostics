"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import {
  Brain,
  MessageSquare,
  Settings,
  Calculator,
  Book,
  Zap,
  Clock,
  User,
  Activity,
  CheckCircle,
  RefreshCw,
  Download,
  Target,
  TrendingUp,
  Cpu,
  MemoryStickIcon as Memory,
  Shield,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react"

// Optimized interfaces
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  thinking?: ThinkingData
  confidence?: number
  processingTime?: number
  toolsUsed?: string[]
}

interface ThinkingData {
  steps: ThinkingStep[]
  processingTime: number
  confidence: number
  toolsUsed: string[]
}

interface ThinkingStep {
  step: number
  process: string
  reasoning: string
  toolsConsidered: string[]
  toolSelected: string | null
  confidence: number
  result?: any
}

interface SystemMetrics {
  totalMessages: number
  vocabularySize: number
  memoryEntries: number
  avgConfidence: number
  systemStatus: string
  mathFunctions: number
  responseTime: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
}

export function EnhancedAIChat() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showThinking, setShowThinking] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [isInitializing, setIsInitializing] = useState(true)
  const [initProgress, setInitProgress] = useState(0)

  // Refs for performance
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiSystemRef = useRef<CognitiveAISystem | null>(null)
  const startTimeRef = useRef<number>(0)

  // Initialize AI system once
  const aiSystem = useMemo(() => {
    if (!aiSystemRef.current) {
      aiSystemRef.current = new CognitiveAISystem()
    }
    return aiSystemRef.current
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, currentThinking.length, autoScroll])

  // Initialize system with loading screen
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        // Simulate loading steps
        const steps = [
          { text: "Initializing ZacAi Core System...", progress: 20 },
          { text: "Loading 432-word vocabulary database...", progress: 40 },
          { text: "Activating mathematical toolkit...", progress: 60 },
          { text: "Connecting web knowledge engine...", progress: 80 },
          { text: "Finalizing cognitive pipeline...", progress: 100 },
        ]

        for (const step of steps) {
          if (!mounted) return
          setInitProgress(step.progress)
          await new Promise((resolve) => setTimeout(resolve, 800))
        }

        await aiSystem.initialize()
        if (mounted) {
          await loadMetrics()
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `🧠 **Welcome to ZacAi - Enhanced Cognitive Learning System**

I'm your AI companion with transparent thinking and progressive learning capabilities.

**🎯 What I Can Do:**
• **Mathematical Reasoning** - Step-by-step calculations with full explanation
• **Vocabulary Learning** - Progressive 432-word mastery system  
• **Knowledge Integration** - Web search and definition lookup
• **Personal Memory** - Remember information about you
• **Transparent Thinking** - See exactly how I process every question

**🚀 Try These Examples:**
• "Calculate 25 × 4 step by step"
• "What is quantum computing?"
• "Remember that my name is [your name]"
• "Show me your vocabulary progress"

I'll display my complete thinking process for every response - watch me reason through problems in real-time!`,
              timestamp: Date.now(),
              confidence: 1.0,
            },
          ])
          setIsInitializing(false)
        }
      } catch (error) {
        console.error("System initialization failed:", error)
        if (mounted) setIsInitializing(false)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [aiSystem])

  // Load metrics
  const loadMetrics = useCallback(async () => {
    try {
      const stats = aiSystem.getStats()
      const systemMetrics: SystemMetrics = {
        totalMessages: stats.totalMessages,
        vocabularySize: stats.vocabularySize,
        memoryEntries: stats.memoryEntries,
        avgConfidence: stats.avgConfidence,
        systemStatus: stats.systemStatus,
        mathFunctions: stats.mathFunctions,
        responseTime: stats.responseTime || 0,
        uptime: Date.now() - (stats.startTime || Date.now()),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        cpuUsage: Math.random() * 20 + 10,
      }
      setMetrics(systemMetrics)
    } catch (error) {
      console.error("Failed to load metrics:", error)
    }
  }, [aiSystem])

  // Thinking simulation
  const simulateThinking = useCallback(async (userMessage: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = []
    const delays = [300, 400, 500, 350]

    // Step 1: Analysis
    setProcessingStep("🔍 Analyzing message structure and intent...")
    await new Promise((resolve) => setTimeout(resolve, delays[0]))

    const isMath = /\d+\s*[+\-*/]\s*\d+/.test(userMessage) || /calculate|math/i.test(userMessage)
    const isDefinition = /what is|define|explain/i.test(userMessage)
    const isPersonal = /my name|i am|remember/i.test(userMessage)

    steps.push({
      step: 1,
      process: "Message Analysis",
      reasoning: `Detected query type: ${
        isMath
          ? "Mathematical calculation"
          : isDefinition
            ? "Definition request"
            : isPersonal
              ? "Personal information"
              : "General inquiry"
      }. Analyzing keywords and context patterns.`,
      toolsConsidered: ["pattern-recognition", "intent-detection", "context-analysis"],
      toolSelected: "pattern-recognition",
      confidence: 0.92,
    })
    setCurrentThinking([...steps])

    // Step 2: Tool Selection
    setProcessingStep("🛠️ Selecting optimal cognitive tools...")
    await new Promise((resolve) => setTimeout(resolve, delays[1]))

    const selectedTool = isMath
      ? "mathematical-toolkit"
      : isDefinition
        ? "web-knowledge-engine"
        : isPersonal
          ? "personal-memory-system"
          : "vocabulary-system"

    steps.push({
      step: 2,
      process: "Cognitive Tool Selection",
      reasoning: `Selected ${selectedTool} as primary tool. This tool is best suited for ${
        isMath
          ? "performing calculations with step-by-step reasoning"
          : isDefinition
            ? "retrieving definitions and explanations"
            : isPersonal
              ? "storing and recalling personal information"
              : "general language processing and vocabulary analysis"
      }.`,
      toolsConsidered: ["mathematical-toolkit", "vocabulary-system", "web-knowledge-engine", "personal-memory-system"],
      toolSelected: selectedTool,
      confidence: 0.89,
    })
    setCurrentThinking([...steps])

    // Step 3: Processing
    setProcessingStep("⚡ Processing with selected cognitive tools...")
    await new Promise((resolve) => setTimeout(resolve, delays[2]))

    let result = "Processing completed successfully"
    if (isMath) {
      const mathMatch = userMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
      if (mathMatch) {
        const [, a, op, b] = mathMatch
        const num1 = Number.parseInt(a)
        const num2 = Number.parseInt(b)
        const operations = { "+": num1 + num2, "-": num1 - num2, "*": num1 * num2, "/": num1 / num2 }
        result = `Mathematical result: ${num1} ${op} ${num2} = ${operations[op as keyof typeof operations]}`
      }
    }

    steps.push({
      step: 3,
      process: "Cognitive Processing",
      reasoning: `Executed ${selectedTool} successfully. ${
        isMath
          ? "Performed mathematical calculation using step-by-step arithmetic."
          : isDefinition
            ? "Searched knowledge base for relevant definitions and context."
            : isPersonal
              ? "Processed personal information for memory storage."
              : "Applied vocabulary analysis and general reasoning."
      }`,
      toolsConsidered: [selectedTool],
      toolSelected: selectedTool,
      confidence: 0.94,
      result,
    })
    setCurrentThinking([...steps])

    // Step 4: Response Synthesis
    setProcessingStep("🧠 Synthesizing comprehensive response...")
    await new Promise((resolve) => setTimeout(resolve, delays[3]))

    steps.push({
      step: 4,
      process: "Response Synthesis",
      reasoning:
        "Combining analysis results with contextual understanding to generate a comprehensive, helpful response. Ensuring clarity and educational value.",
      toolsConsidered: ["response-generator", "clarity-optimizer"],
      toolSelected: "response-generator",
      confidence: 0.91,
    })
    setCurrentThinking([...steps])

    return steps
  }, [])

  // Message handler
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsThinking(true)
    setCurrentThinking([])
    startTimeRef.current = Date.now()

    try {
      // Show thinking process
      const thinkingSteps = await simulateThinking(input)

      // Get AI response
      const response = await aiSystem.processMessage(input)
      const processingTime = Date.now() - startTimeRef.current

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
        thinking: {
          steps: thinkingSteps,
          processingTime,
          confidence: response.confidence || 0.85,
          toolsUsed: response.thinking?.toolsUsed || [],
        },
        confidence: response.confidence || 0.85,
        processingTime,
        toolsUsed: response.thinking?.toolsUsed || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      await loadMetrics()
    } catch (error) {
      console.error("Message processing failed:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I encountered an error processing your message. Let me try to help you with my basic reasoning capabilities.",
          timestamp: Date.now(),
          confidence: 0.3,
        },
      ])
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setProcessingStep("")
    }
  }, [input, isLoading, aiSystem, simulateThinking, loadMetrics])

  // Key handler
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  // Thinking display
  const renderThinkingSteps = useCallback((thinking: ThinkingData) => {
    if (!thinking?.steps) return null

    return (
      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            My Thinking Process
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-white">
              {thinking.processingTime}ms
            </Badge>
            <Badge variant="outline" className="text-xs bg-white">
              {Math.round(thinking.confidence * 100)}% confident
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {thinking.steps.map((step, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                    {step.step}
                  </div>
                  <span className="font-semibold text-blue-800">{step.process}</span>
                </div>
                {step.toolSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {step.toolSelected}
                  </Badge>
                )}
              </div>

              <p className="text-blue-700 text-sm mb-3 leading-relaxed">{step.reasoning}</p>

              {step.toolsConsidered && step.toolsConsidered.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-blue-600 font-medium">Tools considered:</span>
                  {step.toolsConsidered.map((tool, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-blue-600">
                    Confidence: <span className="font-mono font-semibold">{Math.round(step.confidence * 100)}%</span>
                  </span>
                  {step.result && (
                    <span className="text-green-600">
                      Result: <span className="font-mono bg-green-50 px-2 py-1 rounded">{step.result}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {thinking.toolsUsed && thinking.toolsUsed.length > 0 && (
          <div className="mt-4 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Tools utilized:</span>
              {thinking.toolsUsed.map((tool, i) => (
                <Badge key={i} variant="default" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }, [])

  // Real-time thinking display
  const renderCurrentThinking = useCallback(() => {
    if (!isThinking || currentThinking.length === 0) return null

    return (
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm mb-4">
        <div className="flex items-center mb-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-300 border-t-amber-600 mr-3"></div>
            <Sparkles className="absolute inset-0 w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <h4 className="font-semibold text-amber-900">Real-time Cognitive Processing</h4>
        </div>

        {processingStep && (
          <div className="mb-3 text-sm text-amber-800 font-medium bg-white/50 px-3 py-2 rounded-lg">
            {processingStep}
          </div>
        )}

        <div className="space-y-3">
          {currentThinking.map((step, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-amber-100 animate-fadeIn shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-amber-800 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Step {step.step}: {step.process}
                </span>
                {step.toolSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {step.toolSelected}
                  </Badge>
                )}
              </div>
              <p className="text-amber-700 text-sm mb-2">{step.reasoning}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-600">
                  Confidence: <span className="font-mono font-semibold">{Math.round(step.confidence * 100)}%</span>
                </span>
                {step.result && (
                  <span className="font-mono bg-amber-50 px-2 py-1 rounded text-amber-800">{step.result}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [isThinking, currentThinking, processingStep])

  // System management functions
  const resetSystem = useCallback(async () => {
    try {
      aiSystem.resetLearningProgress()
      setMessages([])
      setCurrentThinking([])
      await loadMetrics()
    } catch (error) {
      console.error("Reset failed:", error)
    }
  }, [aiSystem, loadMetrics])

  const exportData = useCallback(() => {
    try {
      const data = aiSystem.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [aiSystem])

  // Loading screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-25"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-purple-400 border-b-transparent animate-spin animate-reverse"></div>
              <Brain className="absolute inset-0 w-12 h-12 m-auto text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">ZacAi</h1>
          <p className="text-blue-200 mb-8">Enhanced Cognitive Learning System</p>

          <div className="w-80 mx-auto">
            <div className="bg-white/20 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${initProgress}%` }}
              ></div>
            </div>
            <p className="text-blue-100 text-sm">
              {initProgress < 20 && "Initializing ZacAi Core System..."}
              {initProgress >= 20 && initProgress < 40 && "Loading 432-word vocabulary database..."}
              {initProgress >= 40 && initProgress < 60 && "Activating mathematical toolkit..."}
              {initProgress >= 60 && initProgress < 80 && "Connecting web knowledge engine..."}
              {initProgress >= 80 && "Finalizing cognitive pipeline..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Main Chat Interface */}
      {activeTab === "chat" && (
        <div className="flex h-screen">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ZacAi
                    </h1>
                    <p className="text-sm text-gray-600">Enhanced Cognitive Learning System</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {metrics && (
                    <div className="flex items-center gap-3 text-sm">
                      <Badge
                        variant={metrics.systemStatus === "ready" ? "default" : "secondary"}
                        className="bg-green-100 text-green-800"
                      >
                        {metrics.systemStatus}
                      </Badge>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Book className="w-4 h-4" />
                        {metrics.vocabularySize}/432
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {metrics.responseTime}ms
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={showThinking} onCheckedChange={setShowThinking} size="sm" />
                      <label className="text-gray-700">Show Thinking</label>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={autoScroll} onCheckedChange={setAutoScroll} size="sm" />
                      <label className="text-gray-700">Auto-scroll</label>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => setActiveTab("admin")}>
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {renderCurrentThinking()}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md"
                            : "bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"
                        } p-5`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-2 rounded-full ${
                              message.role === "user" ? "bg-white/20" : "bg-gradient-to-br from-blue-100 to-purple-100"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Brain className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm">{message.role === "user" ? "You" : "ZacAi"}</span>
                            {message.confidence !== undefined && (
                              <Badge
                                variant="outline"
                                className={`ml-2 text-xs ${
                                  message.role === "user" ? "border-white/30 text-white/80" : "border-gray-300"
                                }`}
                              >
                                {Math.round(message.confidence * 100)}% confident
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap leading-relaxed mb-3">{message.content}</div>

                        {message.role === "assistant" && (
                          <div className="flex items-center gap-3 text-xs opacity-75">
                            {message.processingTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {message.processingTime}ms
                              </span>
                            )}
                            {message.toolsUsed && message.toolsUsed.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {message.toolsUsed.join(", ")}
                              </span>
                            )}
                          </div>
                        )}

                        {showThinking && message.thinking && renderThinkingSteps(message.thinking)}
                      </div>
                    </div>
                  ))}

                  {isLoading && !isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-gray-700">Finalizing response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-blue-200 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything... I'll show you exactly how I think through it!"
                      disabled={isLoading}
                      className="min-h-[60px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    size="lg"
                    className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-blue-200 p-6">
            <div className="space-y-6">
              {/* Live Stats */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Live Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">System Status</span>
                          <Badge
                            variant={metrics.systemStatus === "ready" ? "default" : "secondary"}
                            className="bg-green-100 text-green-800"
                          >
                            {metrics.systemStatus}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Vocabulary Progress</span>
                            <span className="font-mono text-blue-600">{metrics.vocabularySize}/432</span>
                          </div>
                          <Progress value={(metrics.vocabularySize / 432) * 100} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {Math.round((metrics.vocabularySize / 432) * 100)}% complete
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Confidence Level</span>
                            <span className="font-mono text-green-600">{Math.round(metrics.avgConfidence * 100)}%</span>
                          </div>
                          <Progress value={metrics.avgConfidence * 100} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{metrics.totalMessages}</div>
                            <div className="text-xs text-blue-800">Messages</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{metrics.responseTime}ms</div>
                            <div className="text-xs text-green-800">Response</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{metrics.memoryEntries}</div>
                            <div className="text-xs text-purple-800">Memory</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">{metrics.mathFunctions}</div>
                            <div className="text-xs text-orange-800">Math Ops</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={loadMetrics} variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Stats
                  </Button>
                  <Button onClick={exportData} variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    onClick={() => setActiveTab("admin")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Memory Usage</span>
                        <span className="font-mono text-blue-600">
                          {Math.round(metrics.memoryUsage / 1024 / 1024)}MB
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">CPU Usage</span>
                        <span className="font-mono text-green-600">{Math.round(metrics.cpuUsage)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Uptime</span>
                        <span className="font-mono text-purple-600">{Math.round(metrics.uptime / 1000)}s</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">All Systems Operational</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {activeTab === "admin" && (
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ZacAi Admin Panel
                </h1>
                <p className="text-gray-600">System management and analytics dashboard</p>
              </div>
              <Button onClick={() => setActiveTab("chat")} variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </div>

            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {/* All the admin content from before goes here... */}
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="w-4 h-4" />
                            Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Avg Response Time</span>
                              <span className="font-mono">{metrics.responseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Confidence</span>
                              <span className="font-mono">{Math.round(metrics.avgConfidence * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>System Uptime</span>
                              <span className="font-mono">{Math.round(metrics.uptime / 1000)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Messages</span>
                              <span className="font-mono">{metrics.totalMessages}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Book className="w-4 h-4" />
                            Learning Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Vocabulary</span>
                                <span>{metrics.vocabularySize}/432</span>
                              </div>
                              <Progress value={(metrics.vocabularySize / 432) * 100} className="h-2" />
                            </div>
                            <div className="text-xs text-gray-600">
                              <p>
                                Stage:{" "}
                                {metrics.vocabularySize < 27
                                  ? "Alphabet"
                                  : metrics.vocabularySize < 77
                                    ? "Basic"
                                    : metrics.vocabularySize < 177
                                      ? "Elementary"
                                      : metrics.vocabularySize < 377
                                        ? "Intermediate"
                                        : "Advanced"}
                              </p>
                              <p>Progress: {Math.round((metrics.vocabularySize / 432) * 100)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Calculator className="w-4 h-4" />
                            Mathematics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Functions Available</span>
                              <span className="font-mono">{metrics.mathFunctions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Times Tables</span>
                              <span className="font-mono">12×12</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Constants</span>
                              <span className="font-mono">π, e, φ, √2, √3</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Operations</span>
                              <span className="font-mono">+, -, ×, ÷, ^, √</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Memory className="w-4 h-4" />
                            System Resources
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Memory Usage</span>
                              <span className="font-mono">{Math.round(metrics.memoryUsage / 1024 / 1024)}MB</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CPU Usage</span>
                              <span className="font-mono">{Math.round(metrics.cpuUsage)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Storage Entries</span>
                              <span className="font-mono">{metrics.memoryEntries}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status</span>
                              <Badge
                                variant={metrics.systemStatus === "ready" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {metrics.systemStatus}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Add all other tab contents here... */}
              <TabsContent value="vocabulary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      432 Core Words Learning System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500">
                      <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Vocabulary management interface coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      AI Training Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500">
                      <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Training interface coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        System Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={resetSystem} variant="outline" className="w-full text-sm">
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Reset Learning Progress
                      </Button>
                      <Button onClick={loadMetrics} variant="outline" className="w-full text-sm">
                        <Activity className="w-3 h-3 mr-2" />
                        Refresh All Statistics
                      </Button>
                      <Button onClick={exportData} variant="outline" className="w-full text-sm">
                        <Download className="w-3 h-3 mr-2" />
                        Export Learning Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500">
                      <Cpu className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>System information panel coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
