"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DiagnosticAISystem } from "@/lib/diagnostic-ai-system"
import { Brain, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Activity, Loader2 } from "lucide-react"

interface LoadingStep {
  name: string
  status: "pending" | "loading" | "completed" | "failed"
  duration?: number
  error?: string
  details?: string
}

interface PerformanceMetrics {
  initializationTime: number
  firstResponseTime: number
  averageResponseTime: number
  memoryUsage: number
  vocabularyLoadTime: number
  mathFunctionsLoadTime: number
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  responseTime?: number
}

export default function DiagnosticChatWindow() {
  const [aiSystem] = useState(() => new DiagnosticAISystem())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    initializationTime: 0,
    firstResponseTime: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    vocabularyLoadTime: 0,
    mathFunctionsLoadTime: 0,
  })
  const [connectionStatus, setConnectionStatus] = useState<"good" | "slow" | "offline">("good")
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initStartTime = useRef<number>(0)

  useEffect(() => {
    initializeWithDiagnostics()
    monitorConnection()

    // Performance monitoring
    const interval = setInterval(updatePerformanceMetrics, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeWithDiagnostics = async () => {
    console.log("🔍 Starting diagnostic initialization...")
    initStartTime.current = performance.now()

    const steps: LoadingStep[] = [
      { name: "System Startup", status: "pending", details: "Initializing core system" },
      { name: "Memory Check", status: "pending", details: "Checking available memory" },
      { name: "LocalStorage Access", status: "pending", details: "Testing localStorage availability" },
      { name: "Basic Vocabulary", status: "pending", details: "Loading essential words" },
      { name: "Math Functions", status: "pending", details: "Initializing mathematical operations" },
      { name: "Conversation History", status: "pending", details: "Loading previous conversations" },
      { name: "Memory System", status: "pending", details: "Restoring AI memory" },
      { name: "Final Setup", status: "pending", details: "Completing initialization" },
    ]

    setLoadingSteps(steps)

    try {
      // Step 1: System Startup
      await executeStep("System Startup", async () => {
        console.log("📱 System startup check...")
        await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate startup
        return "Core system initialized"
      })

      // Step 2: Memory Check
      await executeStep("Memory Check", async () => {
        console.log("🧠 Checking memory availability...")
        const memoryInfo = (performance as any).memory
        if (memoryInfo) {
          const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
          const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)
          console.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`)
          return `Memory: ${usedMB}MB used`
        }
        return "Memory check completed"
      })

      // Step 3: LocalStorage Test
      await executeStep("LocalStorage Access", async () => {
        console.log("💾 Testing localStorage...")
        const testKey = "diagnostic-test"
        const testData = { test: true, timestamp: Date.now() }

        const startTime = performance.now()
        localStorage.setItem(testKey, JSON.stringify(testData))
        const stored = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        const duration = performance.now() - startTime

        console.log(`LocalStorage test: ${duration.toFixed(2)}ms`)

        if (duration > 100) {
          console.warn("⚠️ LocalStorage is slow!")
          return `LocalStorage slow (${duration.toFixed(0)}ms)`
        }

        return `LocalStorage fast (${duration.toFixed(0)}ms)`
      })

      // Step 4: Basic Vocabulary
      await executeStep("Basic Vocabulary", async () => {
        console.log("📚 Loading basic vocabulary...")
        const startTime = performance.now()
        await aiSystem.initializeBasicVocabulary()
        const duration = performance.now() - startTime
        console.log(`Basic vocabulary loaded in ${duration.toFixed(2)}ms`)
        return `${aiSystem.getVocabularySize()} words loaded`
      })

      // Step 5: Math Functions
      await executeStep("Math Functions", async () => {
        console.log("🔢 Loading math functions...")
        const startTime = performance.now()
        await aiSystem.initializeMathFunctions()
        const duration = performance.now() - startTime
        console.log(`Math functions loaded in ${duration.toFixed(2)}ms`)
        setPerformanceMetrics((prev) => ({ ...prev, mathFunctionsLoadTime: duration }))
        return `${aiSystem.getMathFunctionCount()} functions loaded`
      })

      // Step 6: Conversation History
      await executeStep("Conversation History", async () => {
        console.log("💬 Loading conversation history...")
        const startTime = performance.now()
        const history = await aiSystem.loadConversationHistory()
        const duration = performance.now() - startTime
        console.log(`Conversation history loaded in ${duration.toFixed(2)}ms`)
        setMessages(history)
        return `${history.length} messages restored`
      })

      // Step 7: Memory System
      await executeStep("Memory System", async () => {
        console.log("🧠 Loading AI memory...")
        const startTime = performance.now()
        await aiSystem.loadMemorySystem()
        const duration = performance.now() - startTime
        console.log(`Memory system loaded in ${duration.toFixed(2)}ms`)
        return `${aiSystem.getMemoryEntryCount()} memories loaded`
      })

      // Step 8: Final Setup
      await executeStep("Final Setup", async () => {
        console.log("✅ Completing setup...")
        await aiSystem.finalizeInitialization()
        const totalTime = performance.now() - initStartTime.current
        console.log(`🎉 Total initialization time: ${totalTime.toFixed(2)}ms`)
        setPerformanceMetrics((prev) => ({ ...prev, initializationTime: totalTime }))
        return `Ready in ${totalTime.toFixed(0)}ms`
      })

      setIsInitialized(true)
      console.log("✅ Diagnostic initialization completed successfully!")
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      setError(`Initialization failed: ${error}`)
    }
  }

  const executeStep = async (stepName: string, operation: () => Promise<string>) => {
    console.log(`🔄 Executing step: ${stepName}`)

    setLoadingSteps((prev) => prev.map((step) => (step.name === stepName ? { ...step, status: "loading" } : step)))

    try {
      const startTime = performance.now()
      const result = await operation()
      const duration = performance.now() - startTime

      console.log(`✅ Step completed: ${stepName} (${duration.toFixed(2)}ms)`)

      setLoadingSteps((prev) =>
        prev.map((step) =>
          step.name === stepName ? { ...step, status: "completed", duration, details: result } : step,
        ),
      )

      // Add delay if step completed too quickly (might indicate skipped work)
      if (duration < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error(`❌ Step failed: ${stepName}`, error)

      setLoadingSteps((prev) =>
        prev.map((step) => (step.name === stepName ? { ...step, status: "failed", error: String(error) } : step)),
      )

      throw error
    }
  }

  const monitorConnection = () => {
    const updateConnectionStatus = () => {
      if (!navigator.onLine) {
        setConnectionStatus("offline")
        return
      }

      // Test connection speed with a small request
      const startTime = performance.now()
      const img = new Image()

      img.onload = () => {
        const duration = performance.now() - startTime
        console.log(`Connection test: ${duration.toFixed(2)}ms`)

        if (duration > 2000) {
          setConnectionStatus("slow")
        } else {
          setConnectionStatus("good")
        }
      }

      img.onerror = () => {
        setConnectionStatus("slow")
      }

      // Use a small image for connection testing
      img.src = "/placeholder.svg?height=1&width=1&t=" + Date.now()
    }

    updateConnectionStatus()

    // Monitor connection changes
    window.addEventListener("online", updateConnectionStatus)
    window.addEventListener("offline", updateConnectionStatus)

    // Periodic connection checks
    const interval = setInterval(updateConnectionStatus, 30000)

    return () => {
      window.removeEventListener("online", updateConnectionStatus)
      window.removeEventListener("offline", updateConnectionStatus)
      clearInterval(interval)
    }
  }

  const updatePerformanceMetrics = () => {
    if ((performance as any).memory) {
      const memoryInfo = (performance as any).memory
      const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)

      setPerformanceMetrics((prev) => ({
        ...prev,
        memoryUsage: usedMB,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isInitialized) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setError(null)

    const startTime = performance.now()

    try {
      console.log(`🤖 Processing message: "${userInput}"`)

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Get AI response with timing
      const response = await aiSystem.processMessage(userInput)
      const responseTime = performance.now() - startTime

      console.log(`✅ Response generated in ${responseTime.toFixed(2)}ms`)
      console.log(`🎯 Response confidence: ${(response.confidence * 100).toFixed(1)}%`)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        responseTime: responseTime,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update performance metrics
      setPerformanceMetrics((prev) => {
        const newAvg = prev.averageResponseTime === 0 ? responseTime : (prev.averageResponseTime + responseTime) / 2

        return {
          ...prev,
          averageResponseTime: newAvg,
          firstResponseTime: prev.firstResponseTime === 0 ? responseTime : prev.firstResponseTime,
        }
      })
    } catch (error) {
      console.error("❌ Error processing message:", error)
      setError(`Failed to process message: ${error}`)
      setInput(userInput) // Restore input
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "good":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "slow":
        return <Wifi className="w-4 h-4 text-yellow-500" />
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-500" />
    }
  }

  const getStepIcon = (status: LoadingStep["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "loading":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  if (!isInitialized) {
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
                Diagnostic AI Chat
                <Badge variant="outline">{aiSystem.getVocabularySize()} words</Badge>
                {getConnectionIcon()}
              </CardTitle>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Init: {performanceMetrics.initializationTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Avg: {performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
                <Button variant="outline" size="sm" onClick={() => setShowDiagnostics(!showDiagnostics)}>
                  {showDiagnostics ? "Hide" : "Show"} Diagnostics
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Diagnostic AI Ready!</p>
                  <p className="mb-4">System initialized in {performanceMetrics.initializationTime.toFixed(0)}ms</p>

                  <div className="grid grid-cols-2 gap-2 text-sm max-w-md mx-auto">
                    <Button variant="outline" size="sm" onClick={() => setInput("Calculate 15 * 23")}>
                      Test Math: 15 × 23
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setInput("Remember: I'm testing the system")}>
                      Test Memory
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setInput("What's the square root of 144?")}>
                      Test Complex Math
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setInput("How are you performing?")}>
                      Performance Check
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

                    <div className="flex items-center justify-between text-xs opacity-70 mt-2">
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>

                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          {message.confidence && (
                            <div className="flex items-center gap-1">
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
                          {message.responseTime && (
                            <span className="text-gray-500">{message.responseTime.toFixed(0)}ms</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Processing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here... (try math questions)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
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

      {/* Diagnostics Sidebar */}
      {showDiagnostics && (
        <div className="w-80 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="font-medium">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Initialization:</span>
                    <span className="font-mono">{performanceMetrics.initializationTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Response:</span>
                    <span className="font-mono">
                      {performanceMetrics.firstResponseTime > 0
                        ? `${performanceMetrics.firstResponseTime.toFixed(0)}ms`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response:</span>
                    <span className="font-mono">
                      {performanceMetrics.averageResponseTime > 0
                        ? `${performanceMetrics.averageResponseTime.toFixed(0)}ms`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span className="font-mono">{performanceMetrics.memoryUsage}MB</span>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-3">
                <h4 className="font-medium">Connection</h4>
                <div className="flex items-center gap-2">
                  {getConnectionIcon()}
                  <span className="capitalize text-sm">{connectionStatus}</span>
                </div>
              </div>

              {/* System Status */}
              <div className="space-y-3">
                <h4 className="font-medium">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vocabulary:</span>
                    <span>{aiSystem.getVocabularySize()} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Math Functions:</span>
                    <span>{aiSystem.getMathFunctionCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Entries:</span>
                    <span>{aiSystem.getMemoryEntryCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <span>{messages.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Tests */}
              <div className="space-y-3">
                <h4 className="font-medium">Quick Tests</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => setInput("2 + 2")}
                  >
                    Basic Math: 2 + 2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => setInput("sqrt(16)")}
                  >
                    Advanced: sqrt(16)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => setInput("Remember: diagnostic test")}
                  >
                    Memory Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
