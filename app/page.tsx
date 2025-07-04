"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { SafeModeSystem } from "@/core/system/safe-mode"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
}

type LoadingStage = "initializing" | "diagnostics" | "safe-mode" | "modules" | "ready" | "error"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("initializing")
  const [loadingProgress, setLoadingProgress] = useState<string[]>([])
  const [safeMode, setSafeMode] = useState<SafeModeSystem | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  useEffect(() => {
    initializeSystem()
  }, [])

  const addLoadingStep = (step: string) => {
    setLoadingProgress((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${step}`])
  }

  const initializeSystem = async () => {
    try {
      addLoadingStep("🚀 Starting ZacAI System...")
      setLoadingStage("initializing")

      // Stage 1: Initialize Safe Mode System
      addLoadingStep("🛡️ Initializing Safe Mode System...")
      setLoadingStage("diagnostics")

      const safeModeSystem = new SafeModeSystem()
      await safeModeSystem.initialize()
      setSafeMode(safeModeSystem)

      addLoadingStep("✅ Safe Mode System ready")
      setLoadingStage("safe-mode")

      // Stage 2: Check what features we can enable
      addLoadingStep("🔍 Checking system capabilities...")

      if (safeModeSystem.canUseFeature("enableModules")) {
        addLoadingStep("📦 Modules can be loaded")
        setLoadingStage("modules")
      } else {
        addLoadingStep("⚠️ Running in basic mode - modules disabled")
      }

      if (safeModeSystem.canUseFeature("enableNetworkRequests")) {
        addLoadingStep("🌐 Network requests enabled")
      } else {
        addLoadingStep("⚠️ Network requests disabled - offline mode")
      }

      if (safeModeSystem.canUseFeature("enableStorage")) {
        addLoadingStep("💾 Storage enabled")
      } else {
        addLoadingStep("⚠️ Storage disabled - session only")
      }

      // Stage 3: System ready
      addLoadingStep("✅ ZacAI System ready!")
      setLoadingStage("ready")

      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: `🎉 **ZacAI System Online!**

I'm running in ${safeModeSystem.canUseFeature("enableAdvancedFeatures") ? "full" : "safe"} mode.

**Available Commands:**
• Basic chat and responses
• Simple math calculations (5+5)
• Name recognition (my name is...)
• System diagnostics (status, health)
• Help and information

What would you like to do?`,
        sender: "ai",
        timestamp: Date.now(),
        confidence: 1.0,
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("❌ System initialization failed:", error)
      addLoadingStep(`❌ Error: ${error}`)
      setLoadingStage("error")

      // Even in error state, provide basic functionality
      const errorMessage: Message = {
        id: "error",
        content: `⚠️ **System Error Detected**

ZacAI encountered an error during initialization but is running in emergency mode.

**Available Commands:**
• Basic responses
• System diagnostics
• Error reporting

Type "help" for assistance or "diagnostics" for detailed error information.`,
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0.5,
      }

      setMessages([errorMessage])
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let response = ""
      let confidence = 0.8
      const lowerInput = input.toLowerCase()

      // System commands
      if (lowerInput.includes("status") || lowerInput.includes("diagnostics")) {
        if (safeMode) {
          response = safeMode.getSystemStatus() + "\n\n" + safeMode.getHealthReport()
        } else {
          response = "⚠️ System diagnostics unavailable - running in emergency mode"
        }
        confidence = 0.95
      }
      // Health check
      else if (lowerInput.includes("health")) {
        if (safeMode) {
          await safeMode.runDiagnostics()
          response = safeMode.getHealthReport()
        } else {
          response = "⚠️ Health monitoring unavailable"
        }
        confidence = 0.95
      }
      // Help
      else if (lowerInput.includes("help")) {
        response = `🆘 **ZacAI Help**

**Available Commands:**
• **status** - System status and diagnostics
• **health** - Run health check
• **help** - Show this help message
• **my name is [name]** - Tell me your name
• **[math expression]** - Calculate math (5+5, 10*2)
• **hello/hi** - Greetings

**System Status:** ${loadingStage}
**Safe Mode:** ${safeMode ? "Active" : "Inactive"}`
        confidence = 0.95
      }
      // Basic math
      else if (/^\d+[\s]*[+\-*/][\s]*\d+$/.test(input.replace(/\s/g, ""))) {
        try {
          const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
          response = `🧮 **${input} = ${result}**

Calculation completed successfully!`
          confidence = 0.95
        } catch {
          response = "❌ I couldn't calculate that. Please check your math expression."
          confidence = 0.3
        }
      }
      // Name recognition
      else if (lowerInput.includes("my name is")) {
        const nameMatch = input.match(/my name is (\w+)/i)
        if (nameMatch) {
          const name = nameMatch[1]
          if (safeMode?.canUseFeature("enableStorage")) {
            localStorage.setItem("zacai_user_name", name)
          }
          response = `👋 Nice to meet you, ${name}! I'll remember your name${safeMode?.canUseFeature("enableStorage") ? "" : " for this session only"}.`
          confidence = 0.95
        }
      }
      // Greetings
      else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        const userName = safeMode?.canUseFeature("enableStorage") ? localStorage.getItem("zacai_user_name") : null
        response = `👋 Hello${userName ? ` ${userName}` : ""}! I'm ZacAI, your AI assistant.

I'm currently running in ${safeMode?.canUseFeature("enableAdvancedFeatures") ? "full" : "safe"} mode and ready to help!`
        confidence = 0.9
      }
      // Default response
      else {
        response = `I received your message: "${input}"

I'm currently running in ${loadingStage === "ready" ? "operational" : "basic"} mode. Type "help" to see what I can do!`
        confidence = 0.6
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: Date.now(),
        confidence,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("❌ Message processing error:", error)

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content:
          "⚠️ I encountered an error processing your message. The system is still operational - please try again.",
        sender: "ai",
        timestamp: Date.now(),
        confidence: 0,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getStatusIcon = () => {
    switch (loadingStage) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (loadingStage) {
      case "ready":
        return "default"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Loading screen
  if (loadingStage !== "ready" && loadingStage !== "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Initializing ZacAI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stage:</span>
                <Badge variant="secondary">{loadingStage}</Badge>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Loading Progress:</h4>
                <ScrollArea className="h-32 w-full border rounded p-2">
                  <div className="space-y-1">
                    {loadingProgress.map((step, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {step}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span>ZacAI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor()}>{loadingStage}</Badge>
                <Button variant="outline" size="sm" onClick={() => setShowDiagnostics(!showDiagnostics)}>
                  Diagnostics
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          {showDiagnostics && (
            <div className="border-b p-4 bg-muted/50">
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {loadingProgress.map((step, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {step}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.confidence !== undefined && (
                        <div className="text-xs mt-2 opacity-70">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (try 'help' or 'status')"
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
