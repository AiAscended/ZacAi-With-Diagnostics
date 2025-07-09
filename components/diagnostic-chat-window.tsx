"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Activity, Send, Brain, Zap, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { DiagnosticAISystem } from "@/lib/diagnostic-ai-system"

interface DiagnosticMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  diagnostics?: {
    responseTime: number
    confidence: number
    systemStatus: string
    memoryUsage: number
    processingSteps: string[]
  }
}

export default function DiagnosticChatWindow() {
  const [aiSystem] = useState(() => new DiagnosticAISystem())
  const [messages, setMessages] = useState<DiagnosticMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState("initializing")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initStartTime = useRef<number>(0)

  useEffect(() => {
    // Initialize diagnostic system
    const initSystem = async () => {
      setSystemStatus("loading")

      // Add system initialization message
      const initMessage: DiagnosticMessage = {
        id: Date.now().toString(),
        role: "system",
        content:
          "🔧 Diagnostic AI System initializing...\n\n✅ Core modules loaded\n✅ Memory systems active\n✅ Processing engines online\n\n🚀 System ready for diagnostic testing!",
        timestamp: Date.now(),
        diagnostics: {
          responseTime: 150,
          confidence: 1.0,
          systemStatus: "ready",
          memoryUsage: 45,
          processingSteps: ["System initialization", "Module loading", "Memory allocation", "Engine startup"],
        },
      }

      setMessages([initMessage])
      setSystemStatus("ready")
    }

    initSystem()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: DiagnosticMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate diagnostic processing
    const startTime = Date.now()

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      const responseTime = Date.now() - startTime
      const confidence = 0.85 + Math.random() * 0.15

      // Generate diagnostic response
      const response = generateDiagnosticResponse(input, responseTime, confidence)

      const assistantMessage: DiagnosticMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        diagnostics: {
          responseTime,
          confidence,
          systemStatus: "operational",
          memoryUsage: 35 + Math.random() * 30,
          processingSteps: response.steps,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: DiagnosticMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Diagnostic error encountered. System attempting recovery...",
        timestamp: Date.now(),
        diagnostics: {
          responseTime: Date.now() - startTime,
          confidence: 0.1,
          systemStatus: "error",
          memoryUsage: 0,
          processingSteps: ["Error detection", "Recovery attempt"],
        },
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateDiagnosticResponse = (input: string, responseTime: number, confidence: number) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("test") || lowerInput.includes("diagnostic")) {
      return {
        content: `🔍 **Diagnostic Test Results**\n\n✅ **System Health**: Optimal\n📊 **Response Time**: ${responseTime}ms\n🎯 **Confidence**: ${Math.round(confidence * 100)}%\n🧠 **Memory Usage**: ${Math.round(35 + Math.random() * 30)}%\n\n**Diagnostic Summary:**\n• All core systems operational\n• Memory allocation within normal parameters\n• Processing engines responding correctly\n• No critical errors detected\n\n🚀 System performing at peak efficiency!`,
        steps: [
          "Input analysis",
          "System health check",
          "Memory diagnostic",
          "Performance evaluation",
          "Report generation",
        ],
      }
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        content: `👋 **Diagnostic AI Online**\n\n🔧 **System Status**: Fully Operational\n⚡ **Processing Speed**: ${responseTime}ms\n🎯 **Accuracy**: ${Math.round(confidence * 100)}%\n\nI'm your diagnostic AI assistant, ready to help with:\n• System performance testing\n• Memory usage analysis\n• Error detection and reporting\n• Processing speed optimization\n\nWhat would you like to diagnose today?`,
        steps: ["Greeting recognition", "System status check", "Capability assessment", "Response formulation"],
      }
    }

    if (lowerInput.includes("memory") || lowerInput.includes("performance")) {
      return {
        content: `📊 **Performance & Memory Analysis**\n\n🧠 **Memory Metrics:**\n• Current Usage: ${Math.round(40 + Math.random() * 25)}%\n• Available: ${Math.round(60 + Math.random() * 25)}%\n• Fragmentation: Low\n\n⚡ **Performance Metrics:**\n• Response Time: ${responseTime}ms\n• Throughput: High\n• Error Rate: 0.01%\n• Uptime: 99.9%\n\n✅ All systems within optimal parameters!`,
        steps: ["Memory scan", "Performance analysis", "Metric calculation", "Status evaluation", "Report compilation"],
      }
    }

    return {
      content: `🤖 **Diagnostic Analysis Complete**\n\n**Input Processed**: "${input}"\n**Processing Time**: ${responseTime}ms\n**Confidence Level**: ${Math.round(confidence * 100)}%\n\n**Analysis Results:**\n• Input successfully parsed\n• Context understanding: High\n• Response generation: Optimal\n• System resources: Available\n\n**Recommendation**: System operating normally. Continue with standard operations.\n\n💡 Try asking about "system test", "memory usage", or "performance" for detailed diagnostics!`,
      steps: ["Input parsing", "Context analysis", "Pattern matching", "Response synthesis", "Quality assurance"],
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
      case "operational":
        return "bg-green-500"
      case "loading":
      case "initializing":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Diagnostic AI System
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus)}`} />
            <Badge variant="outline" className="text-xs">
              {systemStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : message.role === "system"
                          ? "bg-gray-100 text-gray-800 border"
                          : "bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === "assistant" && <Brain className="w-4 h-4" />}
                      {message.role === "system" && <Zap className="w-4 h-4" />}
                      <span className="text-xs font-medium">
                        {message.role === "user" ? "You" : message.role === "system" ? "System" : "Diagnostic AI"}
                      </span>
                      <span className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>

                {message.diagnostics && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Diagnostic Data
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{message.diagnostics.responseTime}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{Math.round(message.diagnostics.confidence * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-purple-600" />
                          <span>{Math.round(message.diagnostics.memoryUsage)}% RAM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-600" />
                          <span>{message.diagnostics.systemStatus}</span>
                        </div>
                      </div>
                      {message.diagnostics.processingSteps.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="text-xs font-medium text-blue-800 mb-1">Processing Steps:</div>
                          <div className="text-xs text-blue-700">{message.diagnostics.processingSteps.join(" → ")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  <span className="text-sm text-gray-600 ml-2">Running diagnostics...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter diagnostic command or question..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Try: "system test", "memory usage", "performance check", or "hello"
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
