"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Brain,
  Zap,
  BookOpen,
  Calculator,
  MessageSquare,
  Settings,
  Activity,
  Database,
  Cpu,
  Network,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Trash2,
  CheckCircle,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { ReasoningEngine } from "@/lib/reasoning-engine"

// MASTER AI CHAT - ALL GOLDEN UI CODE FROM ALL CHAT COMPONENTS MERGED
export default function MasterAIChat() {
  // Core State (from all chat components)
  const [reasoningEngine] = useState(() => new ReasoningEngine())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // System State (from diagnostic and enhanced components)
  const [systemStatus, setSystemStatus] = useState<any>({})
  const [performanceStats, setPerformanceStats] = useState<any>({})
  const [connectionStatus, setConnectionStatus] = useState<"good" | "slow" | "offline">("good")
  const [thoughtStream, setThoughtStream] = useState<any[]>([])

  // UI State (from all enhanced components)
  const [activeTab, setActiveTab] = useState("chat")
  const [showThinking, setShowThinking] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [showSystemInfo, setShowSystemInfo] = useState(true)

  // Diagnostic State (from diagnostic components)
  const [diagnosticMode, setDiagnosticMode] = useState(false)
  const [initializationSteps, setInitializationSteps] = useState<InitStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  // Performance State (from enhanced components)
  const [processingTime, setProcessingTime] = useState(0)
  const [responseConfidence, setResponseConfidence] = useState(0)
  const [knowledgeUsed, setKnowledgeUsed] = useState<string[]>([])

  // Learning State (from cognitive components)
  const [learningStats, setLearningStats] = useState({
    wordsLearned: 0,
    conversationsHad: 0,
    teslaCalculations: 0,
    neuralUpdates: 0,
  })

  // Refs (from all components)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // INITIALIZATION (merged from all components)
  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    console.log("🚀 Initializing Master AI Chat System...")
    setIsInitializing(true)

    const steps: InitStep[] = [
      { id: 1, name: "System Startup", status: "pending", duration: 0 },
      { id: 2, name: "Memory Check", status: "pending", duration: 0 },
      { id: 3, name: "Storage Access", status: "pending", duration: 0 },
      { id: 4, name: "Basic Vocabulary", status: "pending", duration: 0 },
      { id: 5, name: "Math Functions", status: "pending", duration: 0 },
      { id: 6, name: "Tesla Mathematics", status: "pending", duration: 0 },
      { id: 7, name: "Neural Networks", status: "pending", duration: 0 },
      { id: 8, name: "Knowledge Loading", status: "pending", duration: 0 },
      { id: 9, name: "Pattern Recognition", status: "pending", duration: 0 },
      { id: 10, name: "Final Setup", status: "pending", duration: 0 },
    ]

    setInitializationSteps(steps)

    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        const startTime = performance.now()

        // Update step to running
        setInitializationSteps(prev => 
          prev.map(step => 
            step.id === i + 1 ? { ...step, status: "running" } : step
          )
        )

        // Simulate step processing
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))

        const duration = performance.now() - startTime

        // Update step to completed
        setInitializationSteps(prev => 
          prev.map(step => 
            step.id === i + 1 ? { ...step, status: "completed", duration } : step
          )
        )
      }

      // Initialize the reasoning engine
      await reasoningEngine.initialize()

      // Load initial system status
      await updateSystemStatus()

      setIsInitializing(false)
      console.log("✅ Master AI Chat System initialized successfully!")

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: `🧠 **Master AI Reasoning Engine Activated!**

I'm ZacAI v5.0 - your advanced reasoning companion with:

⚡ **Tesla Mathematics** - Digital root analysis and vortex patterns
🧮 **Advanced Math** - Complex calculations and problem solving  
📚 **Dynamic Learning** - Vocabulary expansion and knowledge growth
🧠 **Neural Processing** - Multi-layer neural networks with iterative thinking
🔧 **System Diagnostics** - Real-time performance monitoring
💭 **Cognitive Flow** - Transparent reasoning process

**Try asking me:**
• Math: "What is 15 × 23?" or "Tesla analysis of 369"
• Definitions: "What does quantum mean?"
• Learning: "Remember that I like pizza"
• System: "Run diagnostic" or "What can you do?"

Ready to explore the depths of reasoning together! 🚀`,
        timestamp: Date.now(),
        confidence: 0.95,
        processingTime: 0,
        thinking: [],
        knowledgeUsed: ["welcome_system"],
      }

      setMessages([welcomeMessage])

    } catch (error) {
      console.error("❌ Initialization failed:", error)
      setIsInitializing(false)
    }
  }

  // SYSTEM STATUS UPDATES (from all diagnostic components)
  const updateSystemStatus = useCallback(async () => {
    try {
      const status = reasoningEngine.getSystemStatus()
      const performance = reasoningEngine.getPerformanceStats()
      
      setSystemStatus(status)
      setPerformanceStats(performance)
      setLearningStats(status.learningStats || learningStats)
      
      // Update connection status based on system health
      if (status.isInitialized && status.systemStatus === "ready") {
        setConnectionStatus("good")
      } else if (status.systemStatus === "error") {
        setConnectionStatus("offline")
      } else {
        setConnectionStatus("slow")
      }
    } catch (error) {
      console.error("Failed to update system status:", error)
      setConnectionStatus("offline")
    }
  }, [reasoningEngine, learningStats])

  // Update system status periodically
  useEffect(() => {
    const interval = setInterval(updateSystemStatus, 5000)
    return () => clearInterval(interval)
  }, [updateSystemStatus])

  // MESSAGE PROCESSING (merged from all components)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const startTime = performance.now()
      const response = await reasoningEngine.processMessage(userMessage.content)
      const endTime = performance.now()

      setProcessingTime(endTime - startTime)
      setResponseConfidence(response.confidence)
      setKnowledgeUsed(response.knowledgeUsed)
      setThoughtStream(response.thinking || [])

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        processingTime: response.processingTime,
        thinking: response.thinking,
        knowledgeUsed: response.knowledgeUsed,
        mathAnalysis: response.mathAnalysis,
        teslaAnalysis: response.teslaAnalysis,
      }

      setMessages(prev => [...prev, assistantMessage])
      await updateSystemStatus()

    } catch (error) {
      console.error("Error processing message:", error)
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "I encountered an error processing your message. My diagnostic systems are analyzing the issue. Please try again.",
        timestamp: Date.now(),
        confidence: 0.3,
        processingTime: 0,
        thinking: [],
        knowledgeUsed: ["error_handling"],
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // AUTO SCROLL (from all components)
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  // KEYBOARD HANDLING (from all components)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // SYSTEM ACTIONS (from enhanced components)
  const handleSystemReset = async () => {
    setIsLoading(true)
    try {
      await reasoningEngine.resetSystem()
      setMessages([])
      await updateSystemStatus()
      console.log("✅ System reset complete")
    } catch (error) {
      console.error("❌ System reset failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    try {
      const data = reasoningEngine.exportLearningData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zac-ai-learning-data-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("✅ Learning data exported")
    } catch (error) {
      console.error("❌ Export failed:", error)
    }
  }

  const handleClearThoughts = () => {
    reasoningEngine.clearThoughtStream()
    setThoughtStream([])
  }

  const handleRunDiagnostic = async () => {
    setIsLoading(true)
    try {
      const response = await reasoningEngine.processMessage("run system diagnostic")
      
      const diagnosticMessage: ChatMessage = {
        id: `diagnostic_${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        processingTime: response.processingTime,
        thinking: response.thinking,
        knowledgeUsed: response.knowledgeUsed,
      }

      setMessages(prev => [...prev, diagnosticMessage])
      await updateSystemStatus()
    } catch (error) {
      console.error("❌ Diagnostic failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // INITIALIZATION LOADING SCREEN (from diagnostic components)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Master AI Reasoning Engine
            </CardTitle>
            <p className="text-gray-600">Initializing advanced cognitive systems...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {initializationSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : step.status === "running" ? (
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${
                        step.status === "completed" ? "text-green-700" :
                        step.status === "running" ? "text-blue-700" : "text-gray-500"
                      }`}>
                        {step.name}
                      </span>
                      {step.duration > 0 && (
                        <span className="text-xs text-gray-500">
                          {step.duration.toFixed(0)}ms
                        </span>
                      )}
                    </div>
                    {step.status === "running" && (
                      <Progress value={50} className="h-1 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Progress value={(currentStep / initializationSteps.length) * 100} className="mb-2" />
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {initializationSteps.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // MAIN INTERFACE (merged from all components)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* HEADER (from enhanced components) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Master AI Reasoning Engine
                </h1>
                <p className="text-sm text-gray-600">
                  Advanced cognitive processing with Tesla mathematics & neural learning
                </p>
              </div>
            </div>
            
            {/* SYSTEM STATUS INDICATORS (from diagnostic components) */}
            <div className="flex items-center space-x-2">
              <Badge variant={connectionStatus === "good" ? "default" : connectionStatus === "slow" ? "secondary" : "destructive"}>
                <Network className="w-3 h-3 mr-1" />
                {connectionStatus}
              </Badge>
              <Badge variant={systemStatus.isInitialized ? "default" : "secondary"}>
                <Cpu className="w-3 h-3 mr-1" />
                {systemStatus.systemStatus || "unknown"}
              </Badge>
              {processingTime > 0 && (
                <Badge variant="outline">
                  <Activity className="w-3 h-3 mr-1" />
                  {processingTime.toFixed(0)}ms
                </Badge>
              )}
            </div>
          </div>

          {/* QUICK STATS (from enhanced components) */}
          {showSystemInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Vocabulary</p>
                    <p className="text-sm font-semibold">{systemStatus.vocabularySize || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Math</p>
                    <p className="text-sm font-semibold">{systemStatus.mathematicsSize || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-600">Conversations</p>
                    <p className="text-sm font-semibold">{learningStats.conversationsHad}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-600">Tesla Calcs</p>
                    <p className="text-sm font-semibold">{learningStats.teslaCalculations}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-xs text-gray-600">Neural</p>
                    <p className="text-sm font-semibold">{systemStatus.neuralLayersCount || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-600">Confidence</p>
                    <p className="text-sm font-semibold">{Math.round(responseConfidence * 100)}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* MAIN CONTENT TABS (from all enhanced components) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="thinking" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Thinking</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Knowledge</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* CHAT TAB (merged from all chat components) */}
          <TabsContent value="chat" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* MAIN CHAT AREA */}
              <div className="lg:col-span-3">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>Conversation</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowThinking(!showThinking)}
                        >
                          {showThinking ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompactMode(!compactMode)}
                        >
                          {compactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* MESSAGES AREA */}
                    <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"} rounded-lg p-3`}>
                              {/* MESSAGE CONTENT */}
                              <div className="prose prose-sm max-w-none">
                                {message.content.split('\n').map((line, index) => (
                                  <div key={index}>
                                    {line.startsWith('**') && line.endsWith('**') ? (
                                      <strong>{line.slice(2, -2)}</strong>
                                    ) : line.startsWith('• ') ? (
                                      <div className="ml-4">• {line.slice(2)}</div>
                                    ) : (
                                      line
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* MESSAGE METADATA (from enhanced components) */}
                              {message.role === "assistant" && !compactMode && (
                                <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span>Confidence: {Math.round((message.confidence || 0) * 100)}%</span>
                                    {message.processingTime && (
                                      <span>Time: {message.processingTime.toFixed(0)}ms</span>
                                    )}
                                  </div>
                                  
                                  {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {message.knowledgeUsed.slice(0, 3).map((knowledge, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {knowledge}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {/* TESLA ANALYSIS DISPLAY (from cognitive components) */}
                                  {message.teslaAnalysis && (
                                    <div className="mt-2 p-2 bg-yellow-50 rounded border">
                                      <div className="text-xs font-semibold text-yellow-800 mb-1">⚡ Tesla Analysis</div>
                                      <div className="text-xs text-yellow-700">
                                        Number: {message.teslaAnalysis.number} → Digital Root: {message.teslaAnalysis.digitalRoot}
                                      </div>
                                    </div>
                                  )}

                                  {/* MATH ANALYSIS DISPLAY (from math components) */}
                                  {message.mathAnalysis && (
                                    <div className="mt-2 p-2 bg-green-50 rounded border">
                                      <div className="text-xs font-semibold text-green-800 mb-1">🧮 Math Analysis</div>
                                      <div className="text-xs text-green-700">
                                        Operation: {message.mathAnalysis.operation} | Result: {message.mathAnalysis.result}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* THINKING PROCESS (from cognitive components) */}
                              {message.role === "assistant" && showThinking && message.thinking && message.thinking.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                  <div className="text-xs font-semibold text-gray-600 mb-2">💭 Thinking Process:</div>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {message.thinking.slice(0, 5).map((thought: any, index: number) => (
                                      <div key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                                        <span>{thought.emoji}</span>
                                        <span className="flex-1">{thought.content}</span>
                                        <span className="text-gray-400">{Math.round(thought.confidence * 100)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* LOADING INDICATOR (from all components) */}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-gray-600">Processing with neural networks...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    {/* INPUT AREA (from all components) */}
                    <div className="border-t p-4">
                      <div className="flex space-x-2">
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything... Try math, definitions, Tesla analysis, or system diagnostics!"
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={isLoading || !inputMessage.trim()}
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SIDE PANEL (from enhanced components) */}
              <div className="space-y-4">
                {/* QUICK ACTIONS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-transparent"
                      onClick={handleRunDiagnostic}
                      disabled={isLoading}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Run Diagnostic
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-transparent"
                      onClick={() => setInputMessage("Tesla analysis of 369")}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Tesla Math
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-transparent"
                      onClick={() => setInputMessage("What does quantum mean?")}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Define Word
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-transparent"
                      onClick={() => setInputMessage("What can you do?")}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Capabilities
                    </Button>
                  </CardContent>
                </Card>

                {/* CURRENT KNOWLEDGE (from knowledge components) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Knowledge Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {knowledgeUsed.length > 0 ? (
                        knowledgeUsed.slice(0, 5).map((knowledge, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {knowledge}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No knowledge activated yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SYSTEM HEALTH (from diagnostic components) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Connection</span>
                      <Badge variant={connectionStatus === "good" ? "default" : "secondary"}>
                        {connectionStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Status</span>
                      <Badge variant={systemStatus.isInitialized ? "default" : "secondary"}>
                        {systemStatus.systemStatus || "unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Neural Layers</span>
                      <span className="text-xs font-semibold">{systemStatus.neuralLayersCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Thoughts</span>
                      <span className="text-xs font-semibold">{thoughtStream.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* THINKING TAB (from cognitive components) */}
          <TabsContent value="thinking" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Cognitive Flow</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleClearThoughts}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {thoughtStream.length > 0 ? (
                      thoughtStream.map((thought: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-lg">{thought.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{thought.type}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(thought.confidence * 100)}%
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(thought.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{thought.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No thoughts captured yet. Start a conversation to see the reasoning process!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KNOWLEDGE TAB (from knowledge components) */}
          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols\
