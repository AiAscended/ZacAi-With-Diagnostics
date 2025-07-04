"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Bot, User, Brain, Calculator, Book, MemoryStickIcon as Memory } from "lucide-react"
import { SimpleAISystem } from "@/lib/simple-ai-system"
import { teslaMathCalculator } from "@/core/tesla-math/calculator"
import { dictionaryAPI } from "@/core/dictionary/api-client"
import { userMemory } from "@/core/memory/user-memory"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  reasoning?: string[]
  knowledgeUsed?: string[]
}

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSystem] = useState(() => new SimpleAISystem())
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      await aiSystem.initialize()
      setIsInitialized(true)
      updateStats()

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "👋 Hello! I'm ZacAI, your enhanced AI assistant. I can help with math calculations (including Tesla/Vortex patterns), word definitions, and I'll remember our conversations. What would you like to explore?",
        timestamp: Date.now(),
        confidence: 1.0,
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize AI system:", error)
    }
  }

  const updateStats = () => {
    const systemStats = aiSystem.getStats()
    const memoryStats = userMemory.getStats()

    setStats({
      ...systemStats,
      memoryStats,
      dictionaryCacheSize: dictionaryAPI.getCacheSize(),
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isInitialized) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Extract personal info
      userMemory.extractPersonalInfo(input.trim())

      // Check for Tesla math queries
      if (isTeslaMathQuery(input.trim())) {
        const teslaResponse = await handleTeslaMath(input.trim())
        setMessages((prev) => [...prev, teslaResponse])
      } else {
        // Use the AI system
        const response = await aiSystem.processMessage(input.trim())

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          timestamp: Date.now(),
          confidence: response.confidence,
          reasoning: response.reasoning,
          knowledgeUsed: response.knowledgeUsed,
        }

        setMessages((prev) => [...prev, assistantMessage])
      }

      updateStats()
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
      setIsLoading(false)
    }
  }

  const isTeslaMathQuery = (message: string): boolean => {
    const patterns = [
      /tesla.*pattern.*(?:for|of).*(\d+)/i,
      /vortex.*pattern.*(?:for|of).*(\d+)/i,
      /tesla.*math/i,
      /vortex.*math/i,
      /digital.*root.*(\d+)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  const handleTeslaMath = async (message: string): Promise<ChatMessage> => {
    const numberMatch = message.match(/(\d+)/)

    if (numberMatch) {
      const number = Number.parseInt(numberMatch[1])
      const teslaPattern = teslaMathCalculator.getTeslaPattern(number)

      let content = `🌀 **Tesla Pattern Analysis for ${number}**\n\n`
      content += `**Digital Root:** ${teslaPattern.digitalRoot}\n`
      content += `**Type:** ${teslaPattern.type}\n`
      content += `**Significance:** ${teslaPattern.significance}\n\n`
      content += `**Analysis:** ${teslaPattern.analysis}\n\n`
      content += `**Calculation Steps:**\n`
      teslaPattern.steps.forEach((step: string) => {
        content += `• ${step}\n`
      })

      if (teslaPattern.isTeslaNumber) {
        content += `\n⚡ **Tesla's Quote:** "If you only knew the magnificence of the 3, 6 and 9, then you would have the key to the universe."`
      }

      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: Date.now(),
        confidence: 0.95,
        knowledgeUsed: ["tesla-math"],
      }
    } else {
      // General Tesla math explanation
      let content = `🌀 **Tesla/Vortex Mathematics**\n\n`
      content += `Tesla's 3-6-9 pattern reveals the fundamental structure of the universe through digital root analysis.\n\n`
      content += `**The Tesla Numbers:** 3, 6, 9 - The sacred numbers that control the universe\n`
      content += `**The Vortex Cycle:** 1, 2, 4, 8, 7, 5 - The infinite loop of physical reality\n\n`
      content += `Try asking me to calculate the Tesla pattern for any number!`

      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: Date.now(),
        confidence: 0.9,
        knowledgeUsed: ["tesla-math"],
      }
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "secondary"
    if (confidence >= 0.8) return "default"
    if (confidence >= 0.6) return "secondary"
    return "destructive"
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Enhanced ZacAI Chat
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Book className="h-3 w-3" />
                {stats.vocabularySize || 0} words
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                {stats.mathFunctions || 0} functions
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Memory className="h-3 w-3" />
                {stats.memoryStats?.totalEntries || 0} memories
              </Badge>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div
                        className={`rounded-lg p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"}`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.confidence && (
                          <Badge variant={getConfidenceColor(message.confidence)} className="text-xs">
                            {Math.round(message.confidence * 100)}% confident
                          </Badge>
                        )}
                        {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                          <div className="flex gap-1">
                            {message.knowledgeUsed.map((source, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.reasoning && message.reasoning.length > 0 && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            Reasoning ({message.reasoning.length} steps)
                          </summary>
                          <ul className="mt-1 ml-4 space-y-1">
                            {message.reasoning.map((reason, index) => (
                              <li key={index} className="list-disc">
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isInitialized
                    ? "Ask me anything... Try 'Tesla pattern for 12' or 'define quantum'"
                    : "Initializing AI system..."
                }
                disabled={isLoading || !isInitialized}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !isInitialized || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {!isInitialized && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Loading vocabulary and mathematical functions...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
