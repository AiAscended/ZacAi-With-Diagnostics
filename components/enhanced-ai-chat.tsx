"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CognitiveAISystem, type CognitiveResponse, type CognitiveStats } from "@/lib/cognitive-ai-system"
import { Brain, MessageSquare, BarChart3, Settings, Lightbulb, Calculator, Book, Globe } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  thinking?: any
  confidence?: number
}

export function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<CognitiveStats | null>(null)
  const [aiSystem] = useState(() => new CognitiveAISystem())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStats()
    // Add welcome message
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your enhanced AI learning companion. I start with infant-level vocabulary (learning the alphabet) and grow smarter with each conversation. Try asking me to calculate something, define a word, or just chat!",
        timestamp: Date.now(),
        confidence: 1.0,
      },
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadStats = async () => {
    try {
      const systemStats = await aiSystem.getSystemStats()
      setStats(systemStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
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

    try {
      const response: CognitiveResponse = await aiSystem.processMessage(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
        thinking: response.thinking,
        confidence: response.confidence,
      }

      setMessages((prev) => [...prev, assistantMessage])
      await loadStats() // Refresh stats after each message
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: Message = {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatThinkingSteps = (thinking: any) => {
    if (!thinking || !thinking.steps) return null

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <Brain className="w-4 h-4 mr-2" />
          My Thinking Process
        </h4>
        <div className="space-y-2">
          {thinking.steps.map((step: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-blue-700">Step {step.step}:</span>
              <span className="text-blue-600 ml-2">{step.process}</span>
              {step.toolSelected && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {step.toolSelected}
                </Badge>
              )}
              <p className="text-blue-600 text-xs mt-1 ml-4">{step.reasoning}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-blue-500">
          Processing time: {thinking.processingTime}ms | Confidence: {Math.round(thinking.confidence * 100)}%
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
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
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Enhanced AI Chat
                {stats && (
                  <Badge variant="outline" className="ml-auto">
                    Level: {stats.vocabulary.currentLevel}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.confidence !== undefined && (
                          <div className="mt-2 text-xs opacity-70">
                            Confidence: {Math.round(message.confidence * 100)}%
                          </div>
                        )}
                        {message.thinking && formatThinkingSteps(message.thinking)}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything... I'm learning!"
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Vocabulary Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Level: {stats.vocabulary.currentLevel}</span>
                        <span>{stats.vocabulary.currentLevelProgress}%</span>
                      </div>
                      <Progress value={stats.vocabulary.currentLevelProgress} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Vocabulary Age: {stats.vocabulary.vocabularyAge}</p>
                      <p>
                        Words Mastered: {stats.vocabulary.masteredWords}/{stats.vocabulary.totalCoreWords}
                      </p>
                      <p>Next Milestone: {stats.vocabulary.nextMilestone}</p>
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
                    <p>Total Calculations: {stats.mathematics.totalCalculations}</p>
                    <p>Times Table Size: {stats.mathematics.timesTableSize}</p>
                    <p>Constants Available: {stats.mathematics.constantsAvailable}</p>
                    {stats.mathematics.operationBreakdown && (
                      <div>
                        <p className="font-medium mt-2">Operations Used:</p>
                        {Object.entries(stats.mathematics.operationBreakdown).map(([op, count]) => (
                          <div key={op} className="flex justify-between">
                            <span>{op}:</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Thinking Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Total Queries: {stats.thinking.totalQueries}</p>
                    <p>Avg Processing: {stats.thinking.averageProcessingTime}ms</p>
                    <p>Avg Confidence: {stats.thinking.averageConfidence}%</p>
                    <p>Personal Memory: {stats.thinking.personalMemorySize} items</p>
                    {stats.thinking.toolUsage && (
                      <div>
                        <p className="font-medium mt-2">Tool Usage:</p>
                        {Object.entries(stats.thinking.toolUsage).map(([tool, count]) => (
                          <div key={tool} className="flex justify-between">
                            <span>{tool}:</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Web Knowledge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Cache Size: {stats.webKnowledge.cacheSize}</p>
                    <p>Search History: {stats.webKnowledge.searchHistory}</p>
                    {stats.webKnowledge.recentSearches && stats.webKnowledge.recentSearches.length > 0 && (
                      <div>
                        <p className="font-medium mt-2">Recent Searches:</p>
                        {stats.webKnowledge.recentSearches.map((search: string, index: number) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {search}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Total Interactions: {stats.overallProgress.totalInteractions}</p>
                    <p>Learning Rate: {stats.overallProgress.learningRate}</p>
                    <p>Confidence Level: {stats.overallProgress.confidenceLevel}%</p>
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
                      <span className="font-medium">Current Level: {stats.vocabulary.currentLevel}</span>
                      <Badge variant="outline">{stats.vocabulary.vocabularyAge}</Badge>
                    </div>

                    <Progress value={stats.vocabulary.currentLevelProgress} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Progress</p>
                        <p>Words Mastered: {stats.vocabulary.masteredWords}</p>
                        <p>Total Core Words: {stats.vocabulary.totalCoreWords}</p>
                      </div>
                      <div>
                        <p className="font-medium">Next Goal</p>
                        <p>{stats.vocabulary.nextMilestone}</p>
                      </div>
                    </div>

                    {stats.vocabulary.recentlyLearned && stats.vocabulary.recentlyLearned.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">Recently Learned Words:</p>
                        <div className="flex flex-wrap gap-2">
                          {stats.vocabulary.recentlyLearned.map((word: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
                <CardTitle>System Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => aiSystem.resetLearningProgress()} variant="outline" className="w-full">
                  Reset Learning Progress
                </Button>

                <Button onClick={loadStats} variant="outline" className="w-full">
                  Refresh Statistics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span>Mathematical Toolkit - Times tables, calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    <span>Vocabulary System - 432 core words</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Web Knowledge - Dictionary & Wikipedia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>Thinking Pipeline - Smart tool selection</span>
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
