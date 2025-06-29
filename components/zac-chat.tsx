"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CognitiveProcessor } from "@/lib/cognitive-processor"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  pathways?: string[]
  reasoning?: string[]
}

export function ZacChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [processor] = useState(() => new CognitiveProcessor())
  const [stats, setStats] = useState<any>({})
  const [showReasoning, setShowReasoning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeProcessor()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeProcessor = async () => {
    try {
      setIsLoading(true)
      await processor.initialize()
      setStats(processor.getStats())

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "🧠 **Advanced Cognitive Processor Online!**\n\nI'm your sophisticated AI assistant with:\n• 🧮 Advanced mathematical processing\n• 📖 Dynamic vocabulary learning\n• 💾 Personal memory system\n• ⏰ Temporal awareness\n• 🔍 Knowledge synthesis\n• 🧠 Multi-pathway cognitive processing\n\nWhat would you like to explore?",
        timestamp: Date.now(),
        confidence: 0.95,
        pathways: ["system"],
        reasoning: ["System initialization complete"],
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize Cognitive Processor:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "❌ Failed to initialize the cognitive processor. Please refresh the page.",
        timestamp: Date.now(),
        confidence: 0.3,
      }
      setMessages([errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
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

    try {
      const response = await processor.processMessage(input)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        pathways: response.pathways,
        reasoning: response.reasoning,
      }

      setMessages((prev) => [...prev, aiMessage])
      setStats(processor.getStats())
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "❌ I encountered an error processing your message. My cognitive systems are still learning. Please try again.",
        timestamp: Date.now(),
        confidence: 0.3,
        reasoning: [`Error: ${error}`],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exportData = () => {
    const data = processor.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cognitive-processor-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🧠 Advanced Cognitive Processor</h1>
              <p className="text-gray-600">Multi-pathway AI with learning capabilities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowReasoning(!showReasoning)}>
                {showReasoning ? "Hide" : "Show"} Reasoning
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.role === "assistant" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {message.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(message.confidence * 100)}% confident
                        </Badge>
                      )}
                      {message.pathways &&
                        message.pathways.map((pathway) => (
                          <Badge key={pathway} variant="outline" className="text-xs">
                            {pathway}
                          </Badge>
                        ))}
                    </div>

                    {showReasoning && message.reasoning && message.reasoning.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold mb-1">🤔 Reasoning:</div>
                        {message.reasoning.map((reason, index) => (
                          <div key={index} className="text-gray-600">
                            • {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500">🧠 Cognitive processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything - I can do math, define words, remember info, and more..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Stats Sidebar */}
      <div className="w-80 bg-white border-l p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🧠 Cognitive Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Vocabulary:</span>
              <Badge variant="secondary">{stats.vocabularySize || 0} words</Badge>
            </div>
            <div className="flex justify-between">
              <span>Mathematics:</span>
              <Badge variant="secondary">{stats.mathFunctions || 0} concepts</Badge>
            </div>
            <div className="flex justify-between">
              <span>Personal Memory:</span>
              <Badge variant="secondary">{stats.memoryEntries || 0} entries</Badge>
            </div>
            <div className="flex justify-between">
              <span>Messages:</span>
              <Badge variant="secondary">{stats.totalMessages || 0} processed</Badge>
            </div>
            <div className="flex justify-between">
              <span>Avg Confidence:</span>
              <Badge variant="secondary">{Math.round((stats.avgConfidence || 0) * 100)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Response Time:</span>
              <Badge variant="secondary">{stats.responseTime || 0}ms</Badge>
            </div>
            <div className="flex justify-between">
              <span>Knowledge Graph:</span>
              <Badge variant="secondary">{stats.knowledgeGraphSize || 0} nodes</Badge>
            </div>
            <div className="flex justify-between">
              <span>Neural Connections:</span>
              <Badge variant="secondary">{stats.neuralConnections || 0}</Badge>
            </div>

            {stats.breakdown && (
              <div className="pt-3 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">Vocabulary Breakdown:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Seed vocabulary:</span>
                    <span>{stats.breakdown.seedVocab}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learned vocabulary:</span>
                    <span>{stats.breakdown.learnedVocab}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="text-sm font-semibold text-gray-700 mb-2">Learning Progress:</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.learningProgress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{Math.round(stats.learningProgress || 0)}% complete</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Try These:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => setInput("My name is John")}
            >
              💾 Tell me your name
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => setInput("What is 15 × 7?")}
            >
              🧮 Math calculation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => setInput("What is quantum?")}
            >
              📖 Define a word
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => setInput("What time is it?")}
            >
              ⏰ Current time
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => setInput("What do you remember about me?")}
            >
              🧠 Check memory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
