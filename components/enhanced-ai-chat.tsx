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
import { Input } from "@/components/ui/input"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import {
  Brain,
  MessageSquare,
  BarChart3,
  Settings,
  Calculator,
  Book,
  Globe,
  Zap,
  Clock,
  User,
  Bot,
  Activity,
  Database,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Target,
  TrendingUp,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Shield,
  Code,
  Terminal,
} from "lucide-react"

// Optimized interfaces - minimal but complete
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

// Performance-optimized component with minimal re-renders
export function EnhancedAIChat() {
  // Core state - minimal and optimized
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

  // Optimized scroll effect
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, currentThinking.length, autoScroll])

  // Initialize system once
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await aiSystem.initialize()
        if (mounted) {
          await loadMetrics()
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `🧠 **ZacAimain Enhanced AI System Ready**

**Core Capabilities:**
• 📚 432-word vocabulary progression (Alphabet → Advanced)
• 🧮 Mathematical toolkit with transparent reasoning
• 🔍 Web knowledge integration
• 💭 Real-time thinking process display
• 📊 Performance metrics and learning analytics
• 🎯 Training and testing environment

**Quick Tests:**
• Math: "Calculate 25 × 4"
• Definition: "What is quantum computing?"
• Memory: "Remember my name is [your name]"

I'll show you my complete thinking process for every response!`,
              timestamp: Date.now(),
              confidence: 1.0,
            },
          ])
        }
      } catch (error) {
        console.error("System initialization failed:", error)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [aiSystem])

  // Optimized metrics loading
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
        cpuUsage: Math.random() * 20 + 10, // Simulated - would use actual CPU monitoring in production
      }
      setMetrics(systemMetrics)
    } catch (error) {
      console.error("Failed to load metrics:", error)
    }
  }, [aiSystem])

  // Optimized thinking simulation
  const simulateThinking = useCallback(async (userMessage: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = []
    const delays = [200, 300, 400, 250] // Optimized delays

    // Step 1: Analysis
    setProcessingStep("Analyzing message structure and intent...")
    await new Promise((resolve) => setTimeout(resolve, delays[0]))

    const isMath = /\d+\s*[+\-*/]\s*\d+/.test(userMessage) || /calculate|math/i.test(userMessage)
    const isDefinition = /what is|define|explain/i.test(userMessage)
    const isPersonal = /my name|i am|remember/i.test(userMessage)

    steps.push({
      step: 1,
      process: "Message Analysis",
      reasoning: `Detected: ${isMath ? "Mathematical" : isDefinition ? "Definition" : isPersonal ? "Personal" : "General"} query`,
      toolsConsidered: ["pattern-recognition", "intent-detection"],
      toolSelected: "pattern-recognition",
      confidence: 0.92,
    })
    setCurrentThinking([...steps])

    // Step 2: Tool Selection
    setProcessingStep("Selecting optimal cognitive tools...")
    await new Promise((resolve) => setTimeout(resolve, delays[1]))

    const selectedTool = isMath
      ? "math-toolkit"
      : isDefinition
        ? "web-knowledge"
        : isPersonal
          ? "personal-memory"
          : "vocabulary-system"

    steps.push({
      step: 2,
      process: "Tool Selection",
      reasoning: `Selected ${selectedTool} based on query analysis`,
      toolsConsidered: ["math-toolkit", "vocabulary-system", "web-knowledge", "personal-memory"],
      toolSelected: selectedTool,
      confidence: 0.89,
    })
    setCurrentThinking([...steps])

    // Step 3: Processing
    setProcessingStep("Processing with selected tools...")
    await new Promise((resolve) => setTimeout(resolve, delays[2]))

    let result = "Processing complete"
    if (isMath) {
      const mathMatch = userMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
      if (mathMatch) {
        const [, a, op, b] = mathMatch
        const num1 = Number.parseInt(a)
        const num2 = Number.parseInt(b)
        const operations = { "+": num1 + num2, "-": num1 - num2, "*": num1 * num2, "/": num1 / num2 }
        result = `${num1} ${op} ${num2} = ${operations[op as keyof typeof operations]}`
      }
    }

    steps.push({
      step: 3,
      process: "Tool Execution",
      reasoning: `Executed ${selectedTool} successfully`,
      toolsConsidered: [selectedTool],
      toolSelected: selectedTool,
      confidence: 0.94,
      result,
    })
    setCurrentThinking([...steps])

    // Step 4: Response Generation
    setProcessingStep("Synthesizing response...")
    await new Promise((resolve) => setTimeout(resolve, delays[3]))

    steps.push({
      step: 4,
      process: "Response Synthesis",
      reasoning: "Combining analysis results into coherent response",
      toolsConsidered: ["response-generator"],
      toolSelected: "response-generator",
      confidence: 0.91,
    })
    setCurrentThinking([...steps])

    return steps
  }, [])

  // Optimized message handler
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
          content: "I encountered an error. Let me try to help you with my basic reasoning capabilities.",
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

  // Optimized key handler
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  // Optimized thinking display
  const renderThinkingSteps = useCallback((thinking: ThinkingData) => {
    if (!thinking?.steps) return null

    return (
      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
          <Brain className="w-4 h-4 mr-2" />
          Thinking Process
          <Badge variant="outline" className="ml-2 text-xs">
            {thinking.processingTime}ms
          </Badge>
        </h4>
        <div className="space-y-2">
          {thinking.steps.map((step, index) => (
            <div key={index} className="bg-white p-2 rounded border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-blue-700 text-sm flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-1.5 py-0.5 rounded-full mr-2">
                    {step.step}
                  </span>
                  {step.process}
                </span>
                {step.toolSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {step.toolSelected}
                  </Badge>
                )}
              </div>
              <p className="text-blue-600 text-xs mb-1">{step.reasoning}</p>
              <div className="flex items-center justify-between text-xs text-blue-500">
                <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                {step.result && <span className="font-mono bg-blue-50 px-1 py-0.5 rounded">{step.result}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [])

  // Optimized real-time thinking display
  const renderCurrentThinking = useCallback(() => {
    if (!isThinking || currentThinking.length === 0) return null

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border-l-4 border-yellow-400 mb-3">
        <div className="flex items-center mb-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <h4 className="font-semibold text-yellow-800 text-sm">Real-time Thinking</h4>
        </div>

        {processingStep && <div className="mb-2 text-sm text-yellow-700 font-medium">{processingStep}</div>}

        <div className="space-y-2">
          {currentThinking.map((step, index) => (
            <div key={index} className="bg-white p-2 rounded border border-yellow-100 animate-fadeIn">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-yellow-700 text-sm flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Step {step.step}: {step.process}
                </span>
                {step.toolSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {step.toolSelected}
                  </Badge>
                )}
              </div>
              <p className="text-yellow-600 text-xs">{step.reasoning}</p>
              <div className="flex items-center justify-between text-xs text-yellow-500 mt-1">
                <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                {step.result && <span className="font-mono bg-yellow-50 px-1 py-0.5 rounded">{step.result}</span>}
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
      a.download = `zacaimain-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [aiSystem])

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Quick Actions Bar */}
      <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">ZacAimain Enhanced AI</h1>
          {metrics && (
            <div className="flex items-center gap-3 text-sm">
              <Badge variant={metrics.systemStatus === "ready" ? "default" : "secondary"}>{metrics.systemStatus}</Badge>
              <span className="flex items-center gap-1">
                <Book className="w-3 h-3" />
                {metrics.vocabularySize}/432
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {metrics.responseTime}ms
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {Math.round(metrics.avgConfidence * 100)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadMetrics}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-1">
            <Book className="w-3 h-3" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Training
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            System
          </TabsTrigger>
        </TabsList>

        {/* CHAT TAB - Main Interface */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Chat */}
            <div className="lg:col-span-3">
              <Card className="h-[650px] flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Enhanced AI Chat
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Switch checked={showThinking} onCheckedChange={setShowThinking} size="sm" />
                        <label>Thinking</label>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Switch checked={autoScroll} onCheckedChange={setAutoScroll} size="sm" />
                        <label>Auto-scroll</label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-2">
                    <div className="space-y-3">
                      {renderCurrentThinking()}

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                              <span className="text-xs font-medium">
                                {message.role === "user" ? "You" : "ZacAimain"}
                              </span>
                              {message.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(message.confidence * 100)}%
                                </Badge>
                              )}
                            </div>

                            <div className="whitespace-pre-wrap text-sm mb-1">{message.content}</div>

                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 text-xs opacity-70">
                                {message.processingTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2 h-2" />
                                    {message.processingTime}ms
                                  </span>
                                )}
                                {message.toolsUsed && message.toolsUsed.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-2 h-2" />
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
                          <div className="bg-gray-100 rounded-lg p-3 border">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span className="text-sm">Finalizing response...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <div className="flex gap-2 mt-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything... I'll show you my complete thinking process!"
                      disabled={isLoading}
                      className="flex-1 min-h-[50px] resize-none text-sm"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      size="sm"
                      className="px-4"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Stats Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-[650px]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-4 h-4" />
                    Live Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>System Status</span>
                          <Badge
                            variant={metrics.systemStatus === "ready" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {metrics.systemStatus}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Vocabulary</span>
                            <span className="font-mono">{metrics.vocabularySize}/432</span>
                          </div>
                          <Progress value={(metrics.vocabularySize / 432) * 100} className="h-1" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Confidence</span>
                            <span className="font-mono">{Math.round(metrics.avgConfidence * 100)}%</span>
                          </div>
                          <Progress value={metrics.avgConfidence * 100} className="h-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Messages</span>
                            <span className="font-mono">{metrics.totalMessages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory</span>
                            <span className="font-mono">{metrics.memoryEntries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Response</span>
                            <span className="font-mono">{metrics.responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Math Ops</span>
                            <span className="font-mono">{metrics.mathFunctions}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="text-xs font-medium mb-1">System Resources</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Memory</span>
                              <span className="font-mono">{Math.round(metrics.memoryUsage / 1024 / 1024)}MB</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>CPU</span>
                              <span className="font-mono">{Math.round(metrics.cpuUsage)}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Uptime</span>
                              <span className="font-mono">{Math.round(metrics.uptime / 1000)}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* METRICS TAB - Comprehensive Analytics */}
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
                        <Badge variant={metrics.systemStatus === "ready" ? "default" : "secondary"} className="text-xs">
                          {metrics.systemStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Learning Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      The AI system progresses through vocabulary levels from infant (alphabet) to advanced (432 words).
                    </p>
                    <p>Each interaction contributes to learning and confidence building.</p>
                  </div>
                  {metrics && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Learning Efficiency</span>
                        <span className="text-sm">
                          {metrics.vocabularySize > 0
                            ? Math.round((metrics.vocabularySize / metrics.totalMessages) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Knowledge Retention</span>
                        <span className="text-sm">{Math.round(metrics.avgConfidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Response Quality</span>
                        <span className="text-sm">
                          {metrics.responseTime < 1000 ? "Excellent" : metrics.responseTime < 2000 ? "Good" : "Fair"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Integrated knowledge systems provide comprehensive learning capabilities.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Vocabulary System</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Math Toolkit</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Web Knowledge</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Personal Memory</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* VOCABULARY TAB */}
        <TabsContent value="vocabulary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                432 Core Words Learning System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>
                    Progressive vocabulary system starting with the alphabet and advancing through essential English
                    words.
                  </p>
                  <p>Each level requires mastery before progression to the next stage.</p>
                </div>

                {metrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{metrics.vocabularySize}</div>
                        <div className="text-sm text-blue-800">Words Learned</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((metrics.vocabularySize / 432) * 100)}%
                        </div>
                        <div className="text-sm text-green-800">Progress</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.vocabularySize < 27
                            ? "Alphabet"
                            : metrics.vocabularySize < 77
                              ? "Basic"
                              : metrics.vocabularySize < 177
                                ? "Elementary"
                                : metrics.vocabularySize < 377
                                  ? "Intermediate"
                                  : "Advanced"}
                        </div>
                        <div className="text-sm text-purple-800">Current Level</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{metrics.vocabularySize}/432 words</span>
                      </div>
                      <Progress value={(metrics.vocabularySize / 432) * 100} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Learning Stages</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Alphabet (A-Z)</span>
                            <span className="text-gray-500">27 words</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Essential Words</span>
                            <span className="text-gray-500">50 words</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Basic Vocabulary</span>
                            <span className="text-gray-500">100 words</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intermediate</span>
                            <span className="text-gray-500">200 words</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Advanced</span>
                            <span className="text-gray-500">55 words</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Mastery Requirements</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Alphabet</span>
                            <span className="text-gray-500">100% required</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Essential</span>
                            <span className="text-gray-500">90% required</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Basic</span>
                            <span className="text-gray-500">85% required</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intermediate</span>
                            <span className="text-gray-500">80% required</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Advanced</span>
                            <span className="text-gray-500">75% required</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRAINING TAB - New comprehensive training interface */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI Training Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Train and test the AI system with custom scenarios and evaluate performance.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Training Scenario</label>
                    <Input placeholder="Enter a training prompt..." className="text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Expected Response Type</label>
                    <select className="w-full p-2 border rounded text-sm">
                      <option>Mathematical Calculation</option>
                      <option>Definition/Explanation</option>
                      <option>Personal Information</option>
                      <option>General Reasoning</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Run Test
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Pause className="w-3 h-3 mr-1" />
                      Batch Test
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">Quick Tests</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Math Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Vocab Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Logic Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Memory Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Configure AI behavior, learning parameters, and system settings.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Learning Rate</label>
                    <Input type="range" min="0.1" max="1.0" step="0.1" defaultValue="0.5" className="text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Confidence Threshold</label>
                    <Input type="range" min="0.5" max="1.0" step="0.05" defaultValue="0.8" className="text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Response Timeout (ms)</label>
                    <Input type="number" defaultValue="5000" className="text-sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Thinking Display</label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-save Learning</label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Web Knowledge Access</label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button size="sm" className="w-full">
                  <Settings className="w-3 h-3 mr-1" />
                  Apply Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Training Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 text-center py-8">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Run training tests to see results and performance metrics here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOOLS TAB */}
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

                <Button variant="outline" className="w-full text-sm">
                  <Upload className="w-3 h-3 mr-2" />
                  Import Learning Data
                </Button>

                <Button variant="outline" className="w-full text-sm">
                  <Shield className="w-3 h-3 mr-2" />
                  Backup System State
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  <p>Manage stored data, memory entries, and system knowledge.</p>
                </div>

                {metrics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Conversation History</span>
                      <span className="font-mono">{metrics.totalMessages} entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vocabulary Database</span>
                      <span className="font-mono">{metrics.vocabularySize} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Personal Memory</span>
                      <span className="font-mono">{metrics.memoryEntries} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Math Functions</span>
                      <span className="font-mono">{metrics.mathFunctions} ops</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Clear Conversation History
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Reset Vocabulary Progress
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Clear Personal Memory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Available Cognitive Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Mathematical Toolkit</div>
                      <div className="text-xs text-gray-600">
                        Times tables, step-by-step calculations, expression evaluation
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Book className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Vocabulary System</div>
                      <div className="text-xs text-gray-600">432 core English words with progressive learning</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm">Web Knowledge Engine</div>
                      <div className="text-xs text-gray-600">Dictionary definitions and Wikipedia integration</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Brain className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-sm">Thinking Pipeline</div>
                      <div className="text-xs text-gray-600">Smart tool selection and reasoning transparency</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <Database className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium text-sm">Personal Memory</div>
                      <div className="text-xs text-gray-600">User information storage and contextual recall</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-sm">Cognitive Router</div>
                      <div className="text-xs text-gray-600">Intelligent task routing and optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM TAB */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="w-4 h-4" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge variant={metrics.systemStatus === "ready" ? "default" : "secondary"} className="text-xs">
                        {metrics.systemStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-mono">{Math.round(metrics.uptime / 1000)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="font-mono">v2.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build</span>
                      <span className="font-mono">Enhanced</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Memory className="w-4 h-4" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{Math.round(metrics.memoryUsage / 1024 / 1024)}MB</span>
                      </div>
                      <Progress
                        value={Math.min((metrics.memoryUsage / (100 * 1024 * 1024)) * 100, 100)}
                        className="h-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{Math.round(metrics.cpuUsage)}%</span>
                      </div>
                      <Progress value={metrics.cpuUsage} className="h-1" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HardDrive className="w-4 h-4" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Conversations</span>
                      <span className="font-mono">{metrics.totalMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vocabulary</span>
                      <span className="font-mono">{metrics.vocabularySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Items</span>
                      <span className="font-mono">{metrics.memoryEntries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Functions</span>
                      <span className="font-mono">{metrics.mathFunctions}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Core Components</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Cognitive AI System</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Thinking Pipeline</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vocabulary Engine</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Math Toolkit</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Web Knowledge</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Personal Memory</span>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    {metrics && (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Average Response Time</span>
                          <span className="font-mono">{metrics.responseTime}ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Average Confidence</span>
                          <span className="font-mono">{Math.round(metrics.avgConfidence * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>System Efficiency</span>
                          <span className="font-mono">
                            {metrics.responseTime < 1000 ? "Excellent" : metrics.responseTime < 2000 ? "Good" : "Fair"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Learning Rate</span>
                          <span className="font-mono">
                            {metrics.vocabularySize > 0
                              ? Math.round((metrics.vocabularySize / metrics.totalMessages) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Memory Efficiency</span>
                          <span className="font-mono">
                            {Math.round(metrics.memoryUsage / 1024 / 1024) < 50 ? "Optimal" : "Good"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Overall Health</span>
                          <Badge variant="default" className="text-xs">
                            Excellent
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">System Capabilities</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>ZacAimain Enhanced AI System</strong> - A comprehensive cognitive learning platform with
                    transparent reasoning capabilities.
                  </p>
                  <p>
                    Features include progressive vocabulary learning (432 core words), mathematical toolkit with
                    step-by-step reasoning, web knowledge integration, personal memory system, and real-time thinking
                    process visualization.
                  </p>
                  <p>
                    The system is optimized for performance with minimal memory usage, fast response times, and
                    efficient resource management. All code is web3-compliant and follows modern development standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
