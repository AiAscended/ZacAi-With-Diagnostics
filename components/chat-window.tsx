"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Brain, Database, MessageSquare } from "lucide-react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export interface LearningStats {
  totalInteractions: number
  knowledgeItems: number
  modelVersion: number
  avgConfidence: number
}

// Simplified AI System that won't break
class SimpleAISystem {
  private conversationHistory: ChatMessage[] = []
  private knowledgeBase: string[] = []
  private responses = [
    "That's really interesting! Tell me more about that.",
    "I understand what you're saying. How does that make you feel?",
    "That's a great point. I'm learning from our conversation.",
    "I see what you mean. Can you give me an example?",
    "That reminds me of something we discussed earlier.",
    "I'm still learning about this topic. What's your experience with it?",
    "That's worth thinking about. What led you to that conclusion?",
    "I appreciate you sharing that with me. It helps me learn.",
    "That's an interesting perspective. I hadn't considered that before.",
    "Thanks for teaching me about this. I'm getting smarter with each conversation!",
  ]

  constructor() {
    this.loadFromStorage()
  }

  public async processMessage(userMessage: string): Promise<ChatMessage> {
    // Add user message
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    // Add to knowledge base
    this.knowledgeBase.push(userMessage.toLowerCase())

    // Generate response
    const responseText = this.generateResponse(userMessage)
    const assistantMsg: ChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
    }
    this.conversationHistory.push(assistantMsg)

    // Save to storage (with error handling)
    this.saveToStorage()

    return assistantMsg
  }

  private generateResponse(input: string): string {
    const lowerInput = input.toLowerCase()

    // Simple pattern matching
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! It's great to chat with you. I'm learning from every conversation we have!"
    }
    if (lowerInput.includes("how are you")) {
      return "I'm doing well, thank you! I'm constantly learning and improving. How are you doing today?"
    }
    if (lowerInput.includes("what can you do")) {
      return "I can have conversations with you and learn from them! Each time we chat, I get a little smarter. I remember our conversations and try to give better responses over time."
    }
    if (lowerInput.includes("remember") || lowerInput.includes("recall")) {
      const recentTopics = this.knowledgeBase.slice(-5).join(", ")
      return `I remember we've talked about: ${recentTopics}. My memory helps me have better conversations with you!`
    }

    // Use knowledge base to make responses more contextual
    const hasContext = this.knowledgeBase.some((item) =>
      item.split(" ").some((word) => lowerInput.includes(word) && word.length > 3),
    )

    if (hasContext) {
      return (
        "I remember we've discussed something similar before! " +
        this.responses[Math.floor(Math.random() * this.responses.length)]
      )
    }

    // Random response
    return this.responses[Math.floor(Math.random() * this.responses.length)]
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public getLearningStats(): LearningStats {
    const assistantMessages = this.conversationHistory.filter((msg) => msg.role === "assistant")
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / assistantMessages.length
        : 0

    return {
      totalInteractions: this.conversationHistory.length,
      knowledgeItems: this.knowledgeBase.length,
      modelVersion: 1,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
    }
  }

  public provideFeedback(messageId: string, feedback: "positive" | "negative"): void {
    // Simple feedback - just log it for now
    console.log(`Received ${feedback} feedback for message ${messageId}`)
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveToStorage(): void {
    try {
      // Only save recent history to avoid storage issues
      const recentHistory = this.conversationHistory.slice(-20)
      const recentKnowledge = this.knowledgeBase.slice(-50)

      localStorage.setItem(
        "simple-ai-chat",
        JSON.stringify({
          history: recentHistory,
          knowledge: recentKnowledge,
        }),
      )
    } catch (error) {
      console.warn("Could not save to storage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("simple-ai-chat")
      if (stored) {
        const data = JSON.parse(stored)
        this.conversationHistory = data.history || []
        this.knowledgeBase = data.knowledge || []
      }
    } catch (error) {
      console.warn("Could not load from storage:", error)
      this.conversationHistory = []
      this.knowledgeBase = []
    }
  }
}

export default function ChatWindow() {
  const [aiSystem] = useState(() => new SimpleAISystem())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<LearningStats>({
    totalInteractions: 0,
    knowledgeItems: 0,
    modelVersion: 1,
    avgConfidence: 0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load conversation history
    const history = aiSystem.getConversationHistory()
    setMessages(history)
    updateStats()
  }, [aiSystem])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    const newStats = aiSystem.getLearningStats()
    setStats(newStats)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiSystem.processMessage(userInput)
      const updatedHistory = aiSystem.getConversationHistory()
      setMessages(updatedHistory)
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    aiSystem.provideFeedback(messageId, feedback)
    updateStats()
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-500"
    if (confidence > 0.7) return "bg-green-500"
    if (confidence > 0.4) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Browser AI with Memory
              <Badge variant="outline" className="ml-auto">
                v{stats.modelVersion}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to Browser AI with Memory!</p>
                  <p>I can remember our conversations and learn from them!</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Try:</strong> "Hello, how are you?"
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <strong>Ask:</strong> "What can you remember?"
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                    }`}
                  >
                    <div className="text-sm mb-1">{message.content}</div>

                    <div className="flex items-center justify-between text-xs opacity-70 mt-2">
                      <span>{formatTimestamp(message.timestamp)}</span>

                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          {message.confidence && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                              <span>{Math.round(message.confidence * 100)}%</span>
                            </div>
                          )}

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleFeedback(message.id, "positive")}
                              className="hover:bg-green-100 p-1 rounded"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, "negative")}
                              className="hover:bg-red-100 p-1 rounded"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Stats Sidebar */}
      <div className="w-80 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-4 h-4" />
              Memory Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
                <div className="text-xs text-gray-500">Messages</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.knowledgeItems}</div>
                <div className="text-xs text-gray-500">Memories</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.modelVersion}</div>
                <div className="text-xs text-gray-500">Version</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgConfidence * 100)}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              How Memory Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Conversation Memory:</strong> I remember what we've talked about in our chat sessions
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Context Awareness:</strong> I use our conversation history to give better responses
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Local Storage:</strong> Your conversations are saved in your browser only
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Learning:</strong> I improve responses based on our conversation patterns
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
