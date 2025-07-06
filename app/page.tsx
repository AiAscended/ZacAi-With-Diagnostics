"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

// Self-contained UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Button = ({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "default",
  size = "default",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm"
  className?: string
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-hover-effect"

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
  }

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-sm",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline"
  className?: string
}) => {
  const variantClasses = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "text-gray-700 border border-gray-200 bg-white",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

const ScrollArea = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative overflow-auto ${className}`}>{children}</div>
)

// Icon Components
const Brain = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

const Loader2 = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

const CheckCircle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const XCircle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Send = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const Settings = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Activity = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const Clock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

// Types
interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
}

interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  confidence?: number
  duration?: number
}

type LoadingStage = "initializing" | "ready" | "error"
type AppMode = "chat" | "admin"

// Main Component
export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("chat")
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [systemHealth, setSystemHealth] = useState({
    core: false,
    chat: false,
    admin: false,
  })

  useEffect(() => {
    initializeSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLoadingProgress((prev) => [...prev, `${timestamp}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Starting ZacAI Core System...")

      // Simulate core system initialization
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setSystemHealth((prev) => ({ ...prev, core: true }))
      addLoadingStep("✅ Core engine online")

      // Initialize chat system
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSystemHealth((prev) => ({ ...prev, chat: true }))
      addLoadingStep("💬 Chat interface ready")

      // Initialize admin system
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSystemHealth((prev) => ({ ...prev, admin: true }))
      addLoadingStep("⚙️ Admin dashboard ready")

      addLoadingStep("🎉 All systems operational!")

      // Small delay before showing ready state
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStage("ready")
    } catch (error) {
      console.error("System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")
    }
  }

  // Loading screen
  if (loadingStage === "initializing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl border-0 glass-effect animate-fadeIn">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">ZacAI System</CardTitle>
            <p className="text-gray-600 text-lg">Initializing advanced AI assistant...</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse px-4 py-2">
                <Loader2 className="w-4 h-4 mr-2" />
                Starting up<span className="loading-dots"></span>
              </Badge>
            </div>

            {/* System Health Check */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-4 text-gray-700">System Health Check:</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Core Engine:</span>
                  <Badge variant={systemHealth.core ? "default" : "secondary"} className="text-xs">
                    {systemHealth.core ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chat Interface:</span>
                  <Badge variant={systemHealth.chat ? "default" : "secondary"} className="text-xs">
                    {systemHealth.chat ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admin Panel:</span>
                  <Badge variant={systemHealth.admin ? "default" : "secondary"} className="text-xs">
                    {systemHealth.admin ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 mr-1" />
                        Loading
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Initialization Log */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Initialization Log:</h4>
              <ScrollArea className="h-40 w-full border rounded-lg p-3 bg-white/80">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono leading-relaxed animate-slideIn">
                      {step}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.min((loadingProgress.length / 5) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full progress-bar"
                  style={{ width: `${Math.min((loadingProgress.length / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error screen
  if (loadingStage === "error") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-6 w-6" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              The system encountered an error during initialization. Please refresh to try again.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">
                Refresh Application
              </Button>
              <Button onClick={() => setLoadingStage("initializing")} variant="outline" className="w-full">
                Retry Initialization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application
  if (appMode === "admin") {
    return <AdminDashboard onToggleChat={() => setAppMode("chat")} />
  }

  return <ChatWindow onToggleAdmin={() => setAppMode("admin")} />
}

// ChatWindow Component
function ChatWindow({ onToggleAdmin }: { onToggleAdmin: () => void }) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  const simulateThinking = async (userInput: string) => {
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
      setCurrentThinking((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "processing" as const } : step)),
      )

      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400))

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

    return generateResponse(userInput)
  }

  const generateResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: `👋 **Hello there!** 

It's wonderful to meet you! I'm ZacAI, your advanced AI assistant.

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
      const { response, confidence, sources } = await simulateThinking(input.trim())

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: Date.now(),
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
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 status-pulse" />
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
        <Card className="h-full flex flex-col shadow-2xl glass-effect border-0">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Chat Session
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-6">
                {messages.map((message) => (
                  <div key={message.id} className="message-enter">
                    <div className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex gap-3 max-w-4xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md text-sm font-bold ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                          }`}
                        >
                          {message.type === "user" ? "U" : "AI"}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${message.type === "user" ? "text-right" : "text-left"}`}>
                          <Card
                            className={`card-hover ${
                              message.type === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600"
                                : "bg-white border-gray-200 shadow-sm"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                                {/* Message metadata */}
                                <div
                                  className={`flex items-center justify-between text-xs ${
                                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                  {message.confidence !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {Math.round(message.confidence * 100)}%
                                    </Badge>
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Active Thinking Process */}
                {isThinking && currentThinking.length > 0 && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md text-sm font-bold">
                        AI
                      </div>
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">
                                Thinking<span className="loading-dots"></span>
                              </span>
                            </div>
                            <div className="space-y-2">
                              {currentThinking.map((step) => (
                                <div
                                  key={step.id}
                                  className={`flex items-center gap-3 text-xs thinking-step ${step.status}`}
                                >
                                  <div className="flex-shrink-0">
                                    {step.status === "completed" ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : step.status === "processing" ? (
                                      <Loader2 className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                                    )}
                                  </div>
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
                                  {step.duration && step.status === "completed" && (
                                    <span className="text-gray-400 ml-auto">{step.duration}ms</span>
                                  )}
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
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex gap-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-md text-sm font-bold">
                        AI
                      </div>
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              Processing your request<span className="loading-dots"></span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... I can help with questions, math, coding, creative tasks, and more!"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-base focus-ring"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// AdminDashboard Component
function AdminDashboard({ onToggleChat }: { onToggleChat: () => void }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-96 shadow-2xl border-0 glass-effect animate-fadeIn">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Settings className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2 gradient-text">Loading ZacAI Dashboard</h2>
            <p className="text-gray-600">
              Initializing system analytics<span className="loading-dots"></span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onToggleChat} className="gap-2">
                ← Back to Chat
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System management and monitoring • Version 208</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 status-pulse" />
                Online
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                127 queries
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                30m uptime
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-3xl font-bold text-gray-900">127</p>
                  <p className="text-xs text-green-600 mt-1">↗ +12% from last hour</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">96%</p>
                  <p className="text-xs text-green-600 mt-1">↗ +2% improvement</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-3xl font-bold text-gray-900">1250ms</p>
                  <p className="text-xs text-orange-600 mt-1">↗ +50ms slower</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Modules</p>
                  <p className="text-3xl font-bold text-gray-900">4</p>
                  <p className="text-xs text-blue-600 mt-1">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              System Status & Module Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Vocabulary", accuracy: 94, loadTime: 120, status: "active" },
                { name: "Mathematics", accuracy: 98, loadTime: 95, status: "active" },
                { name: "Facts", accuracy: 89, loadTime: 200, status: "active" },
                { name: "Coding", accuracy: 92, loadTime: 180, status: "active" },
              ].map((module) => (
                <div key={module.name} className="p-4 border rounded-lg bg-gray-50/50 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{module.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 status-pulse" />
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium text-gray-900">{module.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Time:</span>
                      <span className="font-medium text-gray-900">{module.loadTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-green-600 capitalize">{module.status}</span>
                    </div>
                  </div>

                  {/* Progress bar for accuracy */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full progress-bar"
                        style={{ width: `${module.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">67.8MB / 1GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full progress-bar"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full progress-bar"
                      style={{ width: "23%" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Quality</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full progress-bar"
                      style={{ width: "96%" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2 min ago", action: "User query processed", status: "success" },
                  { time: "5 min ago", action: "Math calculation completed", status: "success" },
                  { time: "8 min ago", action: "Admin dashboard accessed", status: "info" },
                  { time: "12 min ago", action: "System health check", status: "success" },
                  { time: "15 min ago", action: "Knowledge base updated", status: "info" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-white/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "success" ? "bg-green-500" : "bg-blue-500"
                        }`}
                      />
                      <span className="text-sm text-gray-700">{activity.action}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
