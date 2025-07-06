"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Settings, Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant" | "thinking"
  content: string
  timestamp: number
  thinking?: {
    steps: string[]
    currentStep: number
    isComplete: boolean
  }
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm ZacAI, your advanced AI assistant. I can help you with questions, calculations, creative tasks, and much more. What would you like to explore today?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinking, setCurrentThinking] = useState<Message | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking])

  const simulateThinking = async (userInput: string): Promise<string> => {
    const thinkingSteps = [
      "Analyzing your question...",
      "Processing context and meaning...",
      "Considering multiple approaches...",
      "Formulating comprehensive response...",
      "Finalizing answer...",
    ]

    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      type: "thinking",
      content: "Let me think about this...",
      timestamp: Date.now(),
      thinking: {
        steps: thinkingSteps,
        currentStep: 0,
        isComplete: false,
      },
    }

    setCurrentThinking(thinkingMessage)

    // Simulate thinking process
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setCurrentThinking((prev) =>
        prev
          ? {
              ...prev,
              thinking: {
                ...prev.thinking!,
                currentStep: i,
              },
            }
          : null,
      )
    }

    // Complete thinking
    setCurrentThinking((prev) =>
      prev
        ? {
            ...prev,
            thinking: {
              ...prev.thinking!,
              isComplete: true,
            },
          }
        : null,
    )

    await new Promise((resolve) => setTimeout(resolve, 500))
    setCurrentThinking(null)

    // Generate response based on input
    return generateResponse(userInput)
  }

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! It's great to meet you. I'm here to help with any questions or tasks you might have. What's on your mind today?"
    }

    if (lowerInput.includes("help")) {
      return "I can assist you with a wide variety of tasks including:\n\n• Answering questions and providing explanations\n• Mathematical calculations and problem-solving\n• Creative writing and brainstorming\n• Code analysis and programming help\n• Research and information gathering\n• General conversation and advice\n\nWhat specific area would you like help with?"
    }

    if (lowerInput.includes("math") || /\d+[\s]*[+\-*/][\s]*\d+/.test(input)) {
      try {
        const mathExpression = input.match(/\d+[\s]*[+\-*/][\s]*\d+/)?.[0]
        if (mathExpression) {
          const result = eval(mathExpression.replace(/[^0-9+\-*/().]/g, ""))
          return `I can help with that calculation!\n\n${mathExpression} = ${result}\n\nWould you like me to explain the steps or help with more complex mathematics?`
        }
      } catch {
        return "I can see you're interested in mathematics! While I couldn't parse that specific expression, I'm great at helping with math problems. Try giving me a clear equation like '25 + 17' or ask me about mathematical concepts."
      }
    }

    if (lowerInput.includes("code") || lowerInput.includes("programming")) {
      return "I'd be happy to help with programming and code-related questions! I can assist with:\n\n• Debugging and troubleshooting\n• Code review and optimization\n• Explaining programming concepts\n• Writing code snippets\n• Architecture and design patterns\n\nWhat programming challenge are you working on?"
    }

    if (lowerInput.includes("creative") || lowerInput.includes("write") || lowerInput.includes("story")) {
      return "I love creative projects! I can help you with:\n\n• Creative writing and storytelling\n• Brainstorming ideas\n• Character development\n• Plot structure\n• Poetry and prose\n• Content creation\n\nWhat kind of creative project are you working on?"
    }

    // Default response
    return `That's an interesting question about "${input}". I'm processing your request and thinking through the best way to help you. Could you provide a bit more context or let me know what specific aspect you'd like me to focus on?`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await simulateThinking(input.trim())

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ZacAI Assistant</h1>
                <p className="text-sm text-gray-600">Advanced AI Chat Interface</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
            </div>
            <Button onClick={onToggleAdmin} variant="outline" className="gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-full flex flex-col shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Chat Session</CardTitle>
            <Separator />
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thinking Process Display */}
                {currentThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Thinking...</span>
                      </div>
                      <div className="space-y-1">
                        {currentThinking.thinking?.steps.map((step, index) => (
                          <div
                            key={index}
                            className={`text-xs flex items-center gap-2 ${
                              index <= currentThinking.thinking!.currentStep ? "text-orange-700" : "text-orange-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                index < currentThinking.thinking!.currentStep
                                  ? "bg-green-500"
                                  : index === currentThinking.thinking!.currentStep
                                    ? "bg-orange-500 animate-pulse"
                                    : "bg-gray-300"
                              }`}
                            />
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && !currentThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gray-50/50 p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... I can help with questions, math, coding, creative tasks, and more!"
                  className="flex-1 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
