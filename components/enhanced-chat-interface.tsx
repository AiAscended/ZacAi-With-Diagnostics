"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  Calculator,
  BookOpen,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Search,
  Clock,
  Zap,
  User,
  Bot,
  Sparkles,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  thinkingProcess?: string[]
  mathAnalysis?: {
    operation: string
    method: string
    steps: string[]
    confidence: number
  }
  knowledgeUsed?: string[]
  suggestions?: string[]
  processingTime?: number
}

interface EnhancedChatInterfaceProps {
  onSendMessage: (message: string) => Promise<ChatMessage>
  messages: ChatMessage[]
  isProcessing: boolean
  systemStats?: any
}

export default function EnhancedChatInterface({
  onSendMessage,
  messages,
  isProcessing,
  systemStats,
}: EnhancedChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [showThinking, setShowThinking] = useState<{ [key: string]: boolean }>({})
  const [showMathAnalysis, setShowMathAnalysis] = useState<{ [key: string]: boolean }>({})
  const [currentThinking, setCurrentThinking] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isProcessing])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isProcessing) return

    const message = inputMessage.trim()
    setInputMessage("")
    setIsThinking(true)

    // Simulate thinking process
    const thinkingSteps = [
      "🧠 Analyzing your message...",
      "🔍 Searching knowledge base...",
      "💭 Formulating response...",
      "✨ Finalizing answer...",
    ]

    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setIsThinking(false)
    setCurrentThinking("")

    try {
      await onSendMessage(message)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const toggleThinking = (messageId: string) => {
    setShowThinking((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  const toggleMathAnalysis = (messageId: string) => {
    setShowMathAnalysis((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Enhanced Chat</h1>
              <p className="text-sm text-gray-600">Intelligent conversation with learning capabilities</p>
            </div>
          </div>

          {systemStats && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>{systemStats.vocabulary || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calculator className="w-4 h-4 text-green-500" />
                <span>{systemStats.mathematics || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>{messages.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Brain className="w-16 h-16 text-blue-400 opacity-50" />
                  <Sparkles className="w-8 h-8 text-yellow-400 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to ZacAI! 👋</h3>
                <p className="text-gray-600 mb-6">
                  I'm here to help with math, answer questions, and have great conversations!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {[
                    { icon: Calculator, text: "2 × 15 = ?", color: "blue" },
                    { icon: BookOpen, text: "Define 'serendipity'", color: "green" },
                    { icon: Lightbulb, text: "Tell me a fun fact", color: "yellow" },
                    { icon: MessageSquare, text: "How are you?", color: "purple" },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all bg-transparent"
                      onClick={() => handleSuggestionClick(item.text)}
                    >
                      <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                      <span className="text-sm text-center">{item.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 shadow-sm ${
                      message.role === "user" ? "bg-blue-600 text-white ml-4" : "bg-white text-gray-900 mr-4 border"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {message.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">{message.role === "user" ? "You" : "ZacAI"}</span>
                        <span className={`text-xs ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>

                      {message.role === "assistant" && (
                        <div className="flex items-center space-x-1">
                          {message.confidence && (
                            <Badge variant="outline" className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                              {getConfidenceLabel(message.confidence)} ({Math.round(message.confidence * 100)}%)
                            </Badge>
                          )}
                          {message.processingTime && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {message.processingTime}ms
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>

                    {/* Message Actions */}
                    {message.role === "assistant" && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-green-600">
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-red-600">
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-gray-500"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Details for Assistant Messages */}
                  {message.role === "assistant" && (
                    <div className="mt-3 space-y-3">
                      {/* Thinking Process */}
                      {message.thinkingProcess && message.thinkingProcess.length > 0 && (
                        <Card className="bg-blue-50/50 border-blue-200">
                          <CardContent className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-blue-700 hover:text-blue-900"
                              onClick={() => toggleThinking(message.id)}
                            >
                              <div className="flex items-center space-x-2">
                                {showThinking[message.id] ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <Brain className="w-4 h-4" />
                                <span className="text-sm font-medium">Thinking Process</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.thinkingProcess.length} steps
                                </Badge>
                              </div>
                            </Button>

                            {showThinking[message.id] && (
                              <div className="mt-3 space-y-2">
                                {message.thinkingProcess.map((step, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-blue-800 leading-relaxed">{step}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Math Analysis */}
                      {message.mathAnalysis && (
                        <Card className="bg-green-50/50 border-green-200">
                          <CardContent className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-green-700 hover:text-green-900"
                              onClick={() => toggleMathAnalysis(message.id)}
                            >
                              <div className="flex items-center space-x-2">
                                {showMathAnalysis[message.id] ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <Calculator className="w-4 h-4" />
                                <span className="text-sm font-medium">Mathematical Analysis</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.mathAnalysis.operation}
                                </Badge>
                              </div>
                            </Button>

                            {showMathAnalysis[message.id] && (
                              <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-xs font-medium text-green-700">Method:</span>
                                    <p className="text-sm text-green-800">{message.mathAnalysis.method}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-green-700">Confidence:</span>
                                    <p className="text-sm text-green-800">
                                      {Math.round(message.mathAnalysis.confidence * 100)}%
                                    </p>
                                  </div>
                                </div>

                                {message.mathAnalysis.steps && message.mathAnalysis.steps.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-green-700">Steps:</span>
                                    <div className="mt-1 space-y-1">
                                      {message.mathAnalysis.steps.map((step, index) => (
                                        <div key={index} className="flex items-start space-x-2">
                                          <span className="text-xs text-green-600 mt-0.5">{index + 1}.</span>
                                          <p className="text-sm text-green-800">{step}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Knowledge Sources */}
                      {message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                        <Card className="bg-purple-50/50 border-purple-200">
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Search className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-700">Knowledge Sources</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {message.knowledgeUsed.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-purple-700 bg-purple-100">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <Card className="bg-yellow-50/50 border-yellow-200">
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-700">Try these next:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs text-yellow-700 border-yellow-300 hover:bg-yellow-100 bg-transparent"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && currentThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border rounded-2xl p-4 max-w-[85%] mr-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 italic">{currentThinking}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && !isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl p-4 max-w-[85%] mr-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
                    <span className="text-sm text-gray-600">ZacAI is processing your message...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything - math, definitions, or just chat!"
                disabled={isProcessing}
                className="min-h-[48px] text-base resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {inputMessage.trim() && (
            <div className="mt-2 text-xs text-gray-500">Press Enter to send, or click the send button</div>
          )}
        </form>
      </div>
    </div>
  )
}
