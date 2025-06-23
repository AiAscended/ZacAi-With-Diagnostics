"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { KnowledgeManagerV2 } from "@/lib/knowledge-manager-v2"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { ChevronDown, Cloud, Brain, Settings, BarChart3, Database, User, MessageSquare, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import PerformanceMonitor from "@/components/performance-monitor"

const EnhancedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: string; content: string; thinking?: string; suggestions?: string[]; timestamp?: number }[]
  >([])
  const [input, setInput] = useState("")
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...")
  const [isSystemReady, setIsSystemReady] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinking, setCurrentThinking] = useState("")
  const [knowledgeStats, setKnowledgeStats] = useState({
    vocabulary: 0,
    mathematics: 0,
    userInfo: 0,
    facts: 0,
    conversations: 0,
    totalEntries: 0,
  })
  const [systemStats, setSystemStats] = useState({
    totalInteractions: 0,
    avgResponseTime: 0,
    successRate: 100,
    learningProgress: 0,
  })
  const [knowledgeManager] = useState(() => new KnowledgeManagerV2())
  const [aiSystem] = useState(() => new ReliableAISystem())

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setLoadingStatus("Loading core systems...")

        // Load session data first
        knowledgeManager.loadSessionFromLocalStorage()

        // Load knowledge from IndexedDB
        await knowledgeManager.loadFromIndexedDB()

        // Load seed data
        await knowledgeManager.loadSeedData()

        // Initialize AI system
        await aiSystem.initialize()

        // Update stats
        updateKnowledgeStats()

        setLoadingStatus("System ready!")
        setIsSystemReady(true)

        setTimeout(() => setLoadingStatus(""), 2000)
      } catch (error) {
        console.error("Failed to initialize AI system:", error)
        setLoadingStatus("System initialization failed")
      }
    }

    initializeSystem()
  }, [knowledgeManager, aiSystem])

  const updateKnowledgeStats = () => {
    const stats = knowledgeManager.getStats()
    setKnowledgeStats(stats)

    // Update system stats
    setSystemStats((prev) => ({
      ...prev,
      totalInteractions: messages.length,
      learningProgress: Math.min((stats.totalEntries / 1000) * 100, 100),
    }))
  }

  const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
    const suggestions = []

    if (userMessage.toLowerCase().includes("what") || userMessage.toLowerCase().includes("how")) {
      suggestions.push("Can you explain that in more detail?")
      suggestions.push("What are some examples?")
    }

    if (userMessage.toLowerCase().includes("remember")) {
      suggestions.push("What else should I remember about you?")
      suggestions.push("Show me what you've learned about me")
    }

    if (userMessage.toLowerCase().includes("math") || userMessage.toLowerCase().includes("calculate")) {
      suggestions.push("Show me more math problems")
      suggestions.push("Explain the mathematical concept")
    }

    suggestions.push("Tell me something interesting")
    suggestions.push("What can you help me with?")
    suggestions.push("Show me your knowledge stats")

    return suggestions.slice(0, 3)
  }

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim()
    if (userMessage === "" || !isSystemReady) return

    const startTime = Date.now()
    if (!messageText) setInput("")

    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setIsThinking(true)
    setCurrentThinking("Analyzing your message and searching knowledge base...")

    try {
      // Simulate thinking process
      setTimeout(() => setCurrentThinking("Processing context and generating response..."), 1000)

      // Get AI response using the reliable AI system
      const response = await aiSystem.processMessage(userMessage)

      // Generate suggestions
      const suggestions = generateSuggestions(userMessage, response.content)

      setIsThinking(false)
      setCurrentThinking("")

      // Learn from the interaction
      await knowledgeManager.learnFromMessage(userMessage, response.content)

      const responseTime = Date.now() - startTime

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          thinking:
            "I analyzed your message, searched my knowledge base, and generated a contextual response based on what I've learned.",
          suggestions,
          timestamp: Date.now(),
        },
      ])

      // Update stats
      updateKnowledgeStats()
      setSystemStats((prev) => ({
        ...prev,
        avgResponseTime: Math.round((prev.avgResponseTime + responseTime) / 2),
        totalInteractions: prev.totalInteractions + 1,
      }))
    } catch (error) {
      console.error("Error processing message:", error)
      setIsThinking(false)
      setCurrentThinking("")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your message.",
          timestamp: Date.now(),
        },
      ])

      setSystemStats((prev) => ({
        ...prev,
        successRate: Math.max(prev.successRate - 5, 0),
      }))
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-800">ZacAI Enhanced</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Interactions</span>
                    <Badge variant="secondary">{systemStats.totalInteractions}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Response</span>
                    <Badge variant="secondary">{systemStats.avgResponseTime}ms</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <Badge variant={systemStats.successRate > 90 ? "default" : "destructive"}>
                      {systemStats.successRate}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Learning Progress</span>
                      <span>{Math.round(systemStats.learningProgress)}%</span>
                    </div>
                    <Progress value={systemStats.learningProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <PerformanceMonitor />
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Vocabulary</span>
                    <Badge variant="outline">{knowledgeStats.vocabulary}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mathematics</span>
                    <Badge variant="outline">{knowledgeStats.mathematics}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>User Info</span>
                    <Badge variant="outline">{knowledgeStats.userInfo}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Facts</span>
                    <Badge variant="outline">{knowledgeStats.facts}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversations</span>
                    <Badge variant="outline">{knowledgeStats.conversations}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Entries</span>
                      <Badge>{knowledgeStats.totalEntries}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    System Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Version</span>
                    <Badge variant="secondary">v2.0.0</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant={isSystemReady ? "default" : "destructive"}>
                      {isSystemReady ? "Ready" : "Loading"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mode</span>
                    <Badge variant="outline">Enhanced</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-800">Chat Interface</h2>
            </div>
            {loadingStatus && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 text-sm">{loadingStatus}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {isThinking && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-yellow-600 animate-pulse" />
                  <span className="text-yellow-700 text-sm">{currentThinking}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.length === 0 && isSystemReady && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to ZacAI Enhanced!</h3>
                <p className="text-gray-600 mb-4">
                  I'm ready to chat and learn from our conversations. Try asking me something!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Tell me about yourself")}>
                    Tell me about yourself
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("What can you help me with?")}>
                    What can you help me with?
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Show me your knowledge stats")}>
                    Show knowledge stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <Card
                className={`${
                  message.role === "user"
                    ? "bg-blue-50 border-blue-200 ml-12"
                    : "bg-white border-gray-200 mr-12 shadow-sm"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        message.role === "user" ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{message.content}</p>

                      {message.timestamp && (
                        <p className="text-xs text-gray-500 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</p>
                      )}

                      {message.thinking && (
                        <Collapsible className="mt-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                              <Brain className="h-3 w-3 mr-1" />
                              Show AI thinking
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 border-l-2 border-gray-300">
                              <strong>AI Thinking Process:</strong>
                              <p className="mt-1">{message.thinking}</p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="flex items-center space-x-2 ml-12">
                  <Cloud className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, suggestionIndex) => (
                      <Button
                        key={suggestionIndex}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white hover:bg-gray-50 border-gray-300"
                        onClick={() => sendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </main>

        <footer className="p-4 bg-white border-t shadow-sm">
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={!isSystemReady || isThinking}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!isSystemReady || isThinking || input.trim() === ""}
              className="px-6"
            >
              {isThinking ? "Thinking..." : "Send"}
            </Button>
          </div>
          {!isSystemReady && (
            <div className="text-red-500 text-sm mt-2 text-center">System is initializing. Please wait...</div>
          )}
        </footer>
      </div>
    </div>
  )
}

export default EnhancedAIChat
