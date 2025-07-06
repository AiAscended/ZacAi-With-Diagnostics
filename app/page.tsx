"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

// Simple UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
)

const Button = ({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: "default" | "outline"
}) => {
  const baseClass = "px-4 py-2 rounded-md font-medium transition-all duration-200 btn-hover"
  const variantClass =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
)

// Icons
const Brain = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

const Send = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const Settings = ({ className = "w-5 h-5" }: { className?: string }) => (
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

const Loader = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

// Types
interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
}

// Main App Component
export default function ZacAI() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"chat" | "admin">("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      // Simulate initialization
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          type: "assistant",
          content: `🎉 **ZacAI System Online!**

I'm your advanced AI assistant, ready to help with:

• **Conversations** - Natural dialogue and Q&A
• **Mathematics** - Calculations and problem-solving  
• **Creative Tasks** - Writing and brainstorming
• **Code Help** - Programming assistance
• **Research** - Information and explanations

What would you like to explore today?`,
          timestamp: Date.now(),
        },
      ])

      setIsLoading(false)
    }

    initApp()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate response
    const response = generateResponse(userMessage.content)

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsProcessing(false)
  }

  // Generate AI response
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `👋 **Hello there!**

Great to meet you! I'm ZacAI, your AI assistant. I'm here to help with questions, calculations, creative tasks, and much more.

What can I help you with today?`
    }

    if (lowerInput.includes("admin") || lowerInput.includes("dashboard")) {
      setTimeout(() => setCurrentView("admin"), 1000)
      return `🔧 **Switching to Admin Dashboard...**

Taking you to the admin panel where you can monitor system performance and configure settings.

*Redirecting now...*`
    }

    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return `🧮 **Calculation Result**

**Expression:** \`${input}\`
**Result:** \`${result}\`

✅ Calculation completed successfully!`
      } catch {
        return `❌ **Calculation Error**

I couldn't process that expression. Please try simple arithmetic like:
• \`5 + 3\`
• \`10 * 2\`  
• \`15 / 3\`

Example: "What is 25 + 17?"`
      }
    }

    if (lowerInput.includes("help")) {
      return `🆘 **ZacAI Help**

I can help you with:

**💬 Conversations**
• Answer questions on various topics
• Provide explanations and tutorials
• General discussion and advice

**🧮 Mathematics**
• Basic arithmetic and calculations
• Math problem solving
• Statistical analysis

**✍️ Creative Tasks**
• Writing assistance
• Brainstorming ideas
• Content creation

**💻 Programming**
• Code help and debugging
• Programming concepts
• Technical guidance

**⚙️ System**
• Type "admin" for dashboard
• System monitoring
• Performance metrics

What would you like help with?`
    }

    return `🤔 **Interesting question!**

You asked: *"${input}"*

I'm here to help! To give you the best response, could you:

• **Be more specific** - What exactly would you like to know?
• **Provide context** - What's the background or use case?
• **Ask directly** - Try "Explain..." or "Help me with..."

I'm ready to assist with detailed, helpful answers!`
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ZacAI System</h1>
          <p className="text-gray-600 mb-4">
            Initializing AI assistant<span className="loading-dots"></span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
              style={{ width: "75%" }}
            ></div>
          </div>
        </Card>
      </div>
    )
  }

  // Admin Dashboard
  if (currentView === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setCurrentView("chat")}>
                  ← Back to Chat
                </Button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">System monitoring and management</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <Card className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900">1.2s</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">99.9%</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Core Engine", "Chat Interface", "Admin Panel", "Knowledge Base"].map((system) => (
                <div key={system} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{system}</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Chat Interface
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ZacAI Assistant</h1>
                <p className="text-sm text-gray-600">Advanced AI Chat Interface</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
            <Button variant="outline" onClick={() => setCurrentView("admin")}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        <Card className="h-full flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-3xl p-4 rounded-lg ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-3xl p-4 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader className="w-4 h-4" />
                      AI is thinking<span className="loading-dots"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <Button type="submit" disabled={!input.trim() || isProcessing}>
                {isProcessing ? <Loader className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
