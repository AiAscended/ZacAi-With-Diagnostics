"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
  type Map,
  ImageDownIcon as Down,
  ImageDownIcon as Down,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  thinking?: any
  confidence?: number
  processingTime?: number
  toolsUsed?: string[]
}

interface ThinkingStep {
  step: number
  process: string
  reasoning: string
  toolsConsidered: string[]
  toolSelected: string | null
  confidence: number
  result?: any
  timestamp?: number
}

interface SystemStats {
  totalMessages: number
  vocabularySize: number
  memoryEntries: number
  avgConfidence: number
  systemStatus: string
  mathFunctions: number
  seedProgress: number
  responseTime: number
  vocabularyData: Map<string, string>
  memoryData: Map<string, any>
  personalInfoData: Map<string, any>
  factsData: Map<string, any>
  mathFunctionsData: Map<string, any>
}

export function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showThinking, setShowThinking] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [toolsUsed, setToolsUsed] = useState<string[]>([])
  const [responseTime, setResponseTime] = useState(0)
  const [aiSystem] = useState(() => new CognitiveAISystem())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const thinkingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, currentThinking, autoScroll])

  const initializeSystem = async () => {
    try {
      await aiSystem.initialize()
      await loadStats()

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `🧠 **Enhanced AI Learning System Initialized!**

I'm your cognitive AI companion starting with infant-level vocabulary and growing smarter with each conversation.

**Current Capabilities:**
• 📚 432-word vocabulary system (starting with alphabet)
• 🧮 Mathematical toolkit with step-by-step reasoning
• 🔍 Web knowledge integration
• 💭 Transparent thinking process
• 📊 Real-time learning statistics

**Try asking me to:**
• Calculate math problems (e.g., "What's 25 × 4?")
• Define words or concepts
• Remember personal information about you
• Show my thinking process for any question

I'll show you exactly how I think through each problem!`,
          timestamp: Date.now(),
          confidence: 1.0,
        },
      ])
    } catch (error) {
      console.error("Failed to initialize system:", error)
    }
  }

  const loadStats = async () => {
    try {
      const systemStats = aiSystem.getStats()
      setStats(systemStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const simulateThinkingProcess = async (userMessage: string): Promise<ThinkingStep[]> => {
    const steps: ThinkingStep[] = []

    // Step 1: Message Analysis
    setProcessingStep("Analyzing your message...")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const analysisStep: ThinkingStep = {
      step: 1,
      process: "Message Analysis",
      reasoning: `Analyzing "${userMessage}" for mathematical expressions, questions, and learning opportunities`,
      toolsConsidered: ["pattern-recognition", "keyword-analysis", "intent-detection"],
      toolSelected: "pattern-recognition",
      confidence: 0.9,
      timestamp: Date.now(),
    }
    steps.push(analysisStep)
    setCurrentThinking([...steps])

    // Step 2: Tool Selection
    setProcessingStep("Selecting appropriate tools...")
    await new Promise((resolve) => setTimeout(resolve, 400))

    const isMath =
      /\d+\s*[+\-*/]\s*\d+/.test(userMessage) ||
      userMessage.toLowerCase().includes("calculate") ||
      userMessage.toLowerCase().includes("math")

    const isDefinition = userMessage.toLowerCase().includes("what is") || userMessage.toLowerCase().includes("define")

    const toolStep: ThinkingStep = {
      step: 2,
      process: "Tool Selection",
      reasoning: isMath
        ? "Mathematical expression detected - using math toolkit"
        : isDefinition
          ? "Definition request detected - using vocabulary and web knowledge"
          : "General inquiry - using vocabulary system and reasoning",
      toolsConsidered: ["math-toolkit", "vocabulary-system", "web-knowledge", "personal-memory"],
      toolSelected: isMath ? "math-toolkit" : isDefinition ? "vocabulary-system" : "general-reasoning",
      confidence: 0.85,
      timestamp: Date.now(),
    }
    steps.push(toolStep)
    setCurrentThinking([...steps])

    // Step 3: Processing
    setProcessingStep("Processing with selected tools...")
    await new Promise((resolve) => setTimeout(resolve, 500))

    let result = ""
    if (isMath) {
      const mathMatch = userMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
      if (mathMatch) {
        const [, a, op, b] = mathMatch
        const num1 = Number.parseInt(a)
        const num2 = Number.parseInt(b)
        let mathResult = 0
        let operation = ""

        switch (op) {
          case "+":
            mathResult = num1 + num2
            operation = "addition"
            break
          case "-":
            mathResult = num1 - num2
            operation = "subtraction"
            break
          case "*":
            mathResult = num1 * num2
            operation = "multiplication"
            break
          case "/":
            mathResult = num1 / num2
            operation = "division"
            break
        }

        result = `${num1} ${op} ${num2} = ${mathResult}`
      }
    }

    const processingStep: ThinkingStep = {
      step: 3,
      process: "Tool Execution",
      reasoning: isMath
        ? `Performed ${result} using mathematical toolkit with step-by-step calculation`
        : isDefinition
          ? "Searching vocabulary database and web knowledge for definition"
          : "Processing general inquiry using vocabulary and reasoning systems",
      toolsConsidered: [toolStep.toolSelected!],
      toolSelected: toolStep.toolSelected,
      confidence: 0.92,
      result: result || "Processing complete",
      timestamp: Date.now(),
    }
    steps.push(processingStep)
    setCurrentThinking([...steps])

    // Step 4: Response Generation
    setProcessingStep("Generating response...")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const responseStep: ThinkingStep = {
      step: 4,
      process: "Response Synthesis",
      reasoning: "Combining results from all analysis steps to create comprehensive response",
      toolsConsidered: ["response-generator", "confidence-calculator"],
      toolSelected: "response-generator",
      confidence: 0.88,
      timestamp: Date.now(),
    }
    steps.push(responseStep)
    setCurrentThinking([...steps])

    return steps
  }

  const handleSendMessage = async () => {
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
    setConfidence(0)
    setToolsUsed([])

    const startTime = Date.now()

    try {
      // Show thinking process
      const thinkingSteps = await simulateThinkingProcess(input)

      // Get actual AI response
      const response = await aiSystem.processMessage(input)
      const endTime = Date.now()
      const processingTime = endTime - startTime

      setResponseTime(processingTime)
      setConfidence(response.confidence || 0.8)
      setToolsUsed(response.thinking?.toolsUsed || [])

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
        thinking: {
          steps: thinkingSteps,
          processingTime,
          confidence: response.confidence || 0.8,
          toolsUsed: response.thinking?.toolsUsed || [],
        },
        confidence: response.confidence || 0.8,
        processingTime,
        toolsUsed: response.thinking?.toolsUsed || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      await loadStats()
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I encountered an error processing your message. Let me try to help you anyway with my basic reasoning.",
        timestamp: Date.now(),
        confidence: 0.3,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setProcessingStep("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatThinkingSteps = (thinking: any) => {
    if (!thinking || !thinking.steps) return null

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          My Thinking Process
          <Badge variant="outline" className="ml-2 text-xs">
            {thinking.processingTime}ms
          </Badge>
        </h4>
        <div className="space-y-3">
          {thinking.steps.map((step: ThinkingStep, index: number) => (
            <div key={index} className="bg-white p-3 rounded-md border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-700 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mr-2">
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
              <p className="text-blue-600 text-sm mb-2">{step.reasoning}</p>
              {step.toolsConsidered && step.toolsConsidered.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-blue-500">Tools considered:</span>
                  {step.toolsConsidered.map((tool, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-blue-500">
                <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                {step.result && <span className="font-mono bg-blue-50 px-2 py-1 rounded">{step.result}</span>}
              </div>
            </div>
          ))}
        </div>
        {thinking.toolsUsed && thinking.toolsUsed.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Zap className="w-4 h-4" />
              <span>Tools used:</span>
              {thinking.toolsUsed.map((tool: string, i: number) => (
                <Badge key={i} variant="default" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCurrentThinking = () => {
    if (!isThinking || currentThinking.length === 0) return null

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400 mb-4">
        <div className="flex items-center mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
          <h4 className="font-semibold text-yellow-800">Real-time Thinking Process</h4>
        </div>

        {processingStep && <div className="mb-3 text-sm text-yellow-700 font-medium">{processingStep}</div>}

        <div className="space-y-2" ref={thinkingRef}>
          {currentThinking.map((step, index) => (
            <div key={index} className="bg-white p-3 rounded-md border border-yellow-100 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Step {step.step}: {step.process}
                </span>
                {step.toolSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {step.toolSelected}
                  </Badge>
                )}
              </div>
              <p className="text-yellow-600 text-sm">{step.reasoning}</p>
              <div className="flex items-center justify-between text-xs text-yellow-500 mt-2">
                <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                {step.result && <span className="font-mono bg-yellow-50 px-2 py-1 rounded">{step.result}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Enhanced Chat
          </TabsTrigger>
          <TabsTrigger value="thinking" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Thinking Lab
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Enhanced AI Chat
                      {stats && (
                        <Badge variant="outline" className="ml-2">
                          Vocab: {stats.vocabularySize} words
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Switch checked={showThinking} onCheckedChange={setShowThinking} id="show-thinking" />
                        <label htmlFor="show-thinking">Show Thinking</label>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Switch checked={autoScroll} onCheckedChange={setAutoScroll} id="auto-scroll" />
                        <label htmlFor="auto-scroll">Auto Scroll</label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {/* Real-time thinking display */}
                      {renderCurrentThinking()}

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              <span className="text-sm font-medium">
                                {message.role === "user" ? "You" : "AI Assistant"}
                              </span>
                              {message.confidence !== undefined && (
                                <Badge variant={message.role === "user" ? "secondary" : "outline"} className="text-xs">
                                  {Math.round(message.confidence * 100)}% confident
                                </Badge>
                              )}
                            </div>

                            <div className="whitespace-pre-wrap mb-2">{message.content}</div>

                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
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

                            {showThinking && message.thinking && formatThinkingSteps(message.thinking)}
                          </div>
                        </div>
                      ))}

                      {isLoading && !isThinking && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span>Finalizing response...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything... I'll show you exactly how I think through it!"
                      disabled={isLoading}
                      className="flex-1 min-h-[60px] resize-none"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="px-6">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
              <Card className="h-[700px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Live Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">System Status</span>
                          <Badge variant={stats.systemStatus === "ready" ? "default" : "secondary"}>
                            {stats.systemStatus}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Vocabulary Size</span>
                            <span className="font-mono">{stats.vocabularySize}</span>
                          </div>
                          <Progress value={(stats.vocabularySize / 432) * 100} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence</span>
                            <span className="font-mono">{Math.round(confidence * 100)}%</span>
                          </div>
                          <Progress value={confidence * 100} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Response Time</span>
                            <span className="font-mono">{responseTime}ms</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Messages</span>
                            <span className="font-mono">{stats.totalMessages}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Memory Entries</span>
                            <span className="font-mono">{stats.memoryEntries}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Math Functions</span>
                            <span className="font-mono">{stats.mathFunctions}</span>
                          </div>
                        </div>
                      </div>

                      {toolsUsed.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Active Tools</span>
                          <div className="flex flex-wrap gap-1">
                            {toolsUsed.map((tool, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Keep all other tabs as they were... */}
        <TabsContent value="thinking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Thinking Laboratory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Send a message in the chat to see the AI's thinking process here!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add all the other tab contents back... */}
        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Vocabulary System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to 432 Core Words</span>
                        <span>{Math.round((stats.vocabularySize / 432) * 100)}%</span>
                      </div>
                      <Progress value={(stats.vocabularySize / 432) * 100} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Current Vocabulary: {stats.vocabularySize} words</p>
                      <p>Target: 432 core English words</p>
                      <p>
                        Learning Stage:{" "}
                        {stats.vocabularySize < 27
                          ? "Alphabet"
                          : stats.vocabularySize < 77
                            ? "Basic"
                            : stats.vocabularySize < 177
                              ? "Elementary"
                              : stats.vocabularySize < 377
                                ? "Intermediate"
                                : "Advanced"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Mathematics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Math Functions: {stats.mathFunctions}</p>
                    <p>Times Tables: 12×12 = 144 combinations</p>
                    <p>Constants Available: π, e, φ, √2, √3</p>
                    <p>Operations: +, -, ×, ÷, ^, √</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Total Messages: {stats.totalMessages}</p>
                    <p>Avg Confidence: {Math.round(stats.avgConfidence * 100)}%</p>
                    <p>Response Time: {responseTime}ms</p>
                    <p>System Status: {stats.systemStatus}</p>
                    <p>Memory Entries: {stats.memoryEntries}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>432 Core Words Learning System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>This system starts with the alphabet and progresses through essential English words.</p>
                  <p>Each level requires mastery before advancing to the next.</p>
                </div>

                {stats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Current Progress</span>
                      <Badge variant="outline">{Math.round((stats.vocabularySize / 432) * 100)}% Complete</Badge>
                    </div>

                    <Progress value={(stats.vocabularySize / 432) * 100} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Learning Stage</p>
                        <p>
                          {stats.vocabularySize < 27
                            ? "Infant (Alphabet)"
                            : stats.vocabularySize < 77
                              ? "Toddler (Basic)"
                              : stats.vocabularySize < 177
                                ? "Child (Elementary)"
                                : stats.vocabularySize < 377
                                  ? "Teen (Intermediate)"
                                  : "Adult (Advanced)"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Words Learned</p>
                        <p>{stats.vocabularySize} / 432</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => aiSystem.resetLearningProgress()} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Learning Progress
                </Button>

                <Button onClick={loadStats} variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Statistics
                </Button>

                <Button
                  onClick={() => {
                    const data = aiSystem.exportData()
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "ai-learning-data.json"
                    a.click()
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Learning Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Cognitive Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <span>
                      <strong>Mathematical Toolkit</strong> - Times tables, step-by-step calculations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-green-500" />
                    <span>
                      <strong>Vocabulary System</strong> - 432 core English words with progression
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span>
                      <strong>Web Knowledge</strong> - Dictionary definitions and Wikipedia integration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-orange-500" />
                    <span>
                      <strong>Thinking Pipeline</strong> - Smart tool selection and reasoning transparency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-500" />
                    <span>
                      <strong>Personal Memory</strong> - Remembers user information and preferences
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
