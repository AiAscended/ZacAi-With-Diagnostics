"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Brain,
  Settings,
  Send,
  Loader2,
  User,
  Bot,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Search,
  Zap,
} from "lucide-react"

interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  confidence?: number
  duration?: number
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  thinking?: {
    steps: ThinkingStep[]
    isComplete: boolean
    totalTime?: number
  }
  confidence?: number
  sources?: string[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `🎉 **ZacAI System Online!**

I'm your advanced AI assistant, ready to help with:

• **Intelligent Conversations** - Natural dialogue and Q&A
• **Mathematical Calculations** - From basic arithmetic to complex equations  
• **Creative Tasks** - Writing, brainstorming, and problem-solving
• **Code Analysis** - Programming help and debugging
• **Research & Facts** - Information gathering and explanations
• **System Management** - Access admin panel for configuration

**What would you like to explore today?**`,
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["core", "welcome"],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  const getStepIcon = (type: string, status: string) => {
    const iconClass = "w-4 h-4"

    if (status === "processing") {
      return <Loader2 className={`${iconClass} animate-spin text-blue-600`} />
    }
    if (status === "completed") {
      return <CheckCircle className={`${iconClass} text-green-600`} />
    }
    if (status === "error") {
      return <AlertCircle className={`${iconClass} text-red-600`} />
    }

    switch (type) {
      case "analysis":
        return <Search className={`${iconClass} text-purple-600`} />
      case "search":
        return <Search className={`${iconClass} text-blue-600`} />
      case "reasoning":
        return <Brain className={`${iconClass} text-indigo-600`} />
      case "synthesis":
        return <Lightbulb className={`${iconClass} text-yellow-600`} />
      case "validation":
        return <CheckCircle className={`${iconClass} text-green-600`} />
      default:
        return <Zap className={`${iconClass} text-gray-600`} />
    }
  }

  const simulateThinking = async (
    userInput: string,
  ): Promise<{ response: string; confidence: number; sources: string[] }> => {
    const thinkingSteps: Omit<ThinkingStep, "id">[] = [
      {
        type: "analysis",
        title: "Analyzing Input",
        description: "Breaking down the user's question and identifying key components...",
        status: "pending",
      },
      {
        type: "search",
        title: "Knowledge Retrieval",
        description: "Searching through knowledge base for relevant information...",
        status: "pending",
      },
      {
        type: "reasoning",
        title: "Processing Logic",
        description: "Applying reasoning and connecting concepts...",
        status: "pending",
      },
      {
        type: "synthesis",
        title: "Formulating Response",
        description: "Combining insights into a comprehensive answer...",
        status: "pending",
      },
      {
        type: "validation",
        title: "Quality Check",
        description: "Verifying accuracy and completeness of response...",
        status: "pending",
      },
    ]

    const steps = thinkingSteps.map((step, index) => ({
      ...step,
      id: `step-${index}`,
    }))

    setCurrentThinking(steps)
    setIsThinking(true)

    // Simulate thinking process
    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      setCurrentThinking((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "processing" as const } : step)),
      )

      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))

      // Complete current step
      setCurrentThinking((prev) =>
        prev.map((step, index) =>
          index === i
            ? {
                ...step,
                status: "completed" as const,
                duration: Math.floor(200 + Math.random() * 300),
                confidence: 0.8 + Math.random() * 0.2,
              }
            : step,
        ),
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    setIsThinking(false)

    // Generate response based on input
    return generateResponse(userInput)
  }

  const generateResponse = (input: string): { response: string; confidence: number; sources: string[] } => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: `👋 **Hello there!** 

It's wonderful to meet you! I'm ZacAI, your advanced AI assistant. I'm here to help you with a wide variety of tasks and questions.

**I can assist you with:**
• Answering questions and providing detailed explanations
• Mathematical calculations and problem-solving
• Creative writing and brainstorming sessions
• Code analysis and programming guidance
• Research and factual information
• General conversation and advice

What would you like to explore together today?`,
        confidence: 0.95,
        sources: ["greeting", "core"],
      }
    }

    if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
      setTimeout(() => onToggleAdmin(), 1000)
      return {
        response: `🔧 **Switching to Admin Dashboard...**

Redirecting you to the administrative interface where you can:
• Monitor system performance and statistics
• Configure AI behavior and settings
• Manage knowledge modules
• View detailed analytics
• Export/import system configurations

*Please wait while I transfer you to the admin panel...*`,
        confidence: 0.98,
        sources: ["admin", "navigation"],
      }
    }

    if (lowerInput.includes("help")) {
      return {
        response: `🆘 **ZacAI Help Center**

I'm here to assist you with a comprehensive range of capabilities:

**💬 Conversation & Questions**
• Natural language discussions on any topic
• Detailed explanations and clarifications
• Educational content and tutorials

**🧮 Mathematics & Calculations**
• Basic arithmetic (try: 25 + 17 * 3)
• Complex equations and problem-solving
• Statistical analysis and data interpretation

**💻 Programming & Code**
• Code review and debugging assistance
• Programming concept explanations
• Algorithm design and optimization

**✍️ Creative Tasks**
• Writing assistance and editing
• Brainstorming and idea generation
• Content creation and storytelling

**🔍 Research & Information**
• Fact-checking and verification
• In-depth topic exploration
• Current knowledge synthesis

**⚙️ System Management**
• Type "admin" to access the dashboard
• Configure settings and preferences
• Monitor performance metrics

**What specific area would you like help with?**`,
        confidence: 0.92,
        sources: ["help", "documentation", "core"],
      }
    }

    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return {
          response: `🧮 **Mathematical Calculation**

**Expression:** \`${input}\`
**Result:** \`${result}\`

✅ Calculation completed successfully!

Would you like me to:
• Explain the steps involved?
• Help with more complex mathematics?
• Show alternative calculation methods?`,
          confidence: 0.97,
          sources: ["mathematics", "calculator"],
        }
      } catch {
        return {
          response: `❌ **Calculation Error**

I couldn't process that mathematical expression. Please try:
• Simple arithmetic: \`5 + 3\`, \`10 * 2\`, \`15 / 3\`
• Using parentheses for complex expressions: \`(5 + 3) * 2\`
• Ensuring proper mathematical notation

**Example:** Try asking me "What is 25 + 17?"`,
          confidence: 0.3,
          sources: ["mathematics", "error"],
        }
      }
    }

    if (lowerInput.includes("code") || lowerInput.includes("programming")) {
      return {
        response: `💻 **Programming Assistant Ready!**

I'm excited to help you with coding challenges! I can assist with:

**🔧 Development Support**
• Code review and optimization
• Debugging and troubleshooting
• Best practices and design patterns
• Performance improvements

**📚 Learning & Education**
• Programming concept explanations
• Language-specific guidance
• Algorithm design and analysis
• Data structure implementations

**🚀 Popular Languages & Technologies**
• JavaScript/TypeScript, Python, Java, C++
• React, Next.js, Node.js frameworks
• Database design and queries
• API development and integration

**What programming challenge are you working on?** Share your code or describe the problem you're facing!`,
        confidence: 0.89,
        sources: ["coding", "programming", "development"],
      }
    }

    if (lowerInput.includes("creative") || lowerInput.includes("write") || lowerInput.includes("story")) {
      return {
        response: `✨ **Creative Writing Studio**

I love helping with creative projects! Let's bring your ideas to life:

**📝 Writing Services**
• Story development and plotting
• Character creation and development
• Dialogue writing and improvement
• Poetry and creative expression

**💡 Brainstorming & Ideas**
• Concept generation and exploration
• Plot twist suggestions
• World-building assistance
• Theme and message development

**✏️ Editing & Refinement**
• Style and tone adjustments
• Grammar and flow improvements
• Structure and pacing optimization
• Creative feedback and suggestions

**What kind of creative project are you working on?** I'm here to help spark your imagination!`,
        confidence: 0.91,
        sources: ["creative", "writing", "brainstorming"],
      }
    }

    // Default intelligent response
    return {
      response: `🤔 **Interesting Question!**

You asked about: *"${input}"*

I'm processing your request and thinking through the best way to help you. To provide the most accurate and helpful response, could you:

• **Provide more context** - What specific aspect interests you most?
• **Clarify your goal** - Are you looking for an explanation, solution, or discussion?
• **Share details** - Any particular angle or use case you have in mind?

I'm here to help with detailed, thoughtful responses once I understand exactly what you're looking for!

**Tip:** Try asking more specific questions like "Explain how..." or "Help me understand..."`,
      confidence: 0.65,
      sources: ["general", "clarification"],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const { response, confidence, sources } = await simulateThinking(input.trim())
      const totalTime = Date.now() - startTime

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: Date.now(),
        thinking: {
          steps: currentThinking,
          isComplete: true,
          totalTime,
        },
        confidence,
        sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentThinking([])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        confidence: 0,
        sources: ["error"],
      }
      setMessages((prev) => [...prev, errorMessage])
      setCurrentThinking([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Assistant</h1>
                <p className="text-sm text-gray-600">Advanced AI Chat Interface • Version 208</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
            <Button
              onClick={onToggleAdmin}
              variant="outline"
              className="gap-2 bg-white/50 hover:bg-white/80 border-gray-200 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Card className="h-full flex flex-col shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Chat Session
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
              <div className="space-y-6 py-6">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex gap-3 max-w-4xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                          }`}
                        >
                          {message.type === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${message.type === "user" ? "text-right" : "text-left"}`}>
                          <Card
                            className={`${
                              message.type === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600"
                                : "bg-white border-gray-200 shadow-sm"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="prose prose-sm max-w-none">
                                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                </div>

                                {/* Message metadata */}
                                <div
                                  className={`flex items-center justify-between text-xs ${
                                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  <span>{formatTimestamp(message.timestamp)}</span>

                                  {message.type === "assistant" && (
                                    <div className="flex items-center gap-2">
                                      {message.thinking?.totalTime && (
                                        <Badge variant="outline" className="text-xs bg-white/50">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {message.thinking.totalTime}ms
                                        </Badge>
                                      )}

                                      {message.confidence !== undefined && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getConfidenceColor(message.confidence)}`}
                                        >
                                          {message.confidence >= 0.8 ? (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                          ) : (
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                          )}
                                          {Math.round(message.confidence * 100)}%
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                                    {message.sources.map((source, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Thinking Process - Version 100 Style */}
                          {message.thinking && message.thinking.steps.length > 0 && (
                            <div className="mt-3">
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                  >
                                    <Brain className="w-3 h-3 mr-2" />
                                    View Thinking Process
                                    <ChevronDown className="w-3 h-3 ml-2" />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <Card className="mt-2 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                                            <Brain className="w-4 h-4" />
                                            AI Reasoning Process
                                          </h4>
                                          {message.thinking.totalTime && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-orange-100 text-orange-700 border-orange-300"
                                            >
                                              Total: {message.thinking.totalTime}ms
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="space-y-2">
                                          {message.thinking.steps.map((step, index) => (
                                            <div
                                              key={step.id}
                                              className="flex items-start gap-3 p-2 rounded-lg bg-white/60"
                                            >
                                              <div className="flex-shrink-0 mt-0.5">
                                                {getStepIcon(step.type, step.status)}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                  <h5 className="text-sm font-medium text-gray-800">{step.title}</h5>
                                                  <div className="flex items-center gap-2">
                                                    {step.duration && (
                                                      <span className="text-xs text-gray-500">{step.duration}ms</span>
                                                    )}
                                                    {step.confidence && (
                                                      <span className="text-xs text-gray-500">
                                                        {Math.round(step.confidence * 100)}%
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Active Thinking Process */}
                {isThinking && currentThinking.length > 0 && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Thinking...</span>
                            </div>
                            <div className="space-y-2">
                              {currentThinking.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-3 text-xs">
                                  <div className="flex-shrink-0">{getStepIcon(step.type, step.status)}</div>
                                  <span
                                    className={`${
                                      step.status === "completed"
                                        ? "text-green-700"
                                        : step.status === "processing"
                                          ? "text-orange-700"
                                          : "text-gray-500"
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && !isThinking && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                            <span className="text-sm text-gray-600">Processing your request...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... I can help with questions, math, coding, creative tasks, and more!"
                  className="flex-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-base py-3"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
