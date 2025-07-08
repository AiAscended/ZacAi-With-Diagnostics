"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SystemManager } from "../core/system/SystemManager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Calculator,
  BookOpen,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Activity,
  Zap,
  Database,
  TrendingUp,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  thinkingProcess?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
}

export default function ZacAIMainPage() {
  const [systemManager] = useState(() => new SystemManager())
  const [isInitialized, setIsInitialized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [showThinking, setShowThinking] = useState(true)

  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      console.log("🚀 Initializing ZacAI System...")
      await systemManager.initialize()
      setIsInitialized(true)

      // Load conversation history
      const history = await systemManager.getConversationHistory()
      setMessages(history)

      // Get system status
      const status = systemManager.getSystemStatus()
      setSystemStatus(status)

      console.log("✅ ZacAI System initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize ZacAI:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsProcessing(true)

    try {
      const response = await systemManager.processMessage(inputMessage)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        thinkingProcess: response.thinkingProcess,
        mathAnalysis: response.mathAnalysis,
        knowledgeUsed: response.knowledgeUsed,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update system status
      const status = systemManager.getSystemStatus()
      setSystemStatus(status)
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.1,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportData = async () => {
    try {
      const data = await systemManager.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await systemManager.importData(data)

      // Refresh the interface
      const history = await systemManager.getConversationHistory()
      setMessages(history)

      const status = systemManager.getSystemStatus()
      setSystemStatus(status)

      console.log("✅ Data imported successfully")
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      await systemManager.clearAllData()
      setMessages([])
      const status = systemManager.getSystemStatus()
      setSystemStatus(status)
    }
  }

  const handleOptimizeSystem = async () => {
    await systemManager.optimizeSystem()
    const status = systemManager.getSystemStatus()
    setSystemStatus(status)
  }

  const handleRetrain = async () => {
    await systemManager.retrain()
    const status = systemManager.getSystemStatus()
    setSystemStatus(status)
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">ZacAI Initializing...</h2>
            <p className="text-gray-600 mb-4">Loading AI systems and knowledge base</p>
            <Progress value={75} className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">ZacAI - Advanced AI Assistant</CardTitle>
                  <p className="text-gray-600">Browser-based AI with learning capabilities</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Activity className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                {systemStatus && <Badge variant="outline">v{systemStatus.config.VERSION}</Badge>}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat Interface</span>
                  <Button variant="outline" size="sm" onClick={() => setShowThinking(!showThinking)}>
                    {showThinking ? "Hide" : "Show"} Thinking
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with ZacAI!</p>
                      <p className="text-sm mt-2">Try asking about math, definitions, or just chat!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {message.role === "assistant" && (
                              <div className="mt-2 text-xs opacity-75">
                                {message.confidence && (
                                  <Badge variant="outline" className="mr-2">
                                    {Math.round(message.confidence * 100)}% confident
                                  </Badge>
                                )}
                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                              </div>
                            )}

                            {/* Thinking Process */}
                            {showThinking && message.thinkingProcess && message.thinkingProcess.length > 0 && (
                              <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                <p className="font-semibold text-blue-800 mb-1">🧠 Thinking Process:</p>
                                {message.thinkingProcess.map((step, index) => (
                                  <p key={index} className="text-blue-700">
                                    • {step}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Math Analysis */}
                            {message.mathAnalysis && (
                              <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                                <p className="font-semibold text-green-800 mb-1">🔢 Math Analysis:</p>
                                <p className="text-green-700">Method: {message.mathAnalysis.method}</p>
                                {message.mathAnalysis.steps && (
                                  <div className="mt-1">
                                    {message.mathAnalysis.steps.map((step: string, index: number) => (
                                      <p key={index} className="text-green-700">
                                        • {step}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Knowledge Used */}
                            {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                              <div className="mt-3 p-2 bg-purple-50 rounded text-xs">
                                <p className="font-semibold text-purple-800 mb-1">📚 Knowledge Sources:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.knowledgeUsed.map((source, index) => (
                                    <Badge key={index} variant="outline" className="text-purple-700">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isProcessing}
                  />
                  <Button onClick={handleSendMessage} disabled={isProcessing || !inputMessage.trim()}>
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemStatus && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Health Score</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        95/100
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Vocabulary</span>
                        <span>{systemStatus.managers.knowledge.vocabulary || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conversations</span>
                        <span>{messages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Memory Entries</span>
                        <span>{systemStatus.managers.memory?.totalMemories || 0}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Engine Status:</p>
                      {Object.entries(systemStatus.engines).map(([engine, status]) => (
                        <div key={engine} className="flex justify-between items-center text-xs">
                          <span className="capitalize">{engine}</span>
                          <Badge variant={status ? "default" : "destructive"} className="text-xs">
                            {status ? "✅" : "❌"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleOptimizeSystem}>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize System
                  </Button>

                  <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleRetrain}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retrain Models
                  </Button>

                  <Separator />

                  <Button variant="destructive" size="sm" className="w-full" onClick={handleClearData}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Knowledge Base</span>
                    <Badge variant="outline">{systemStatus?.managers.knowledge.totalEntries || 0}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Math Engine</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Memory System</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      Learning
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
