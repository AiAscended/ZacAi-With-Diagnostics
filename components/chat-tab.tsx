// components/chat-tab.tsx
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { CognitiveEngine } from "@/lib/cognitive-engine"
import type { ChatMessage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Bot, BrainCircuit, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface ChatTabProps {
  engine: CognitiveEngine
}

export default function ChatTab({ engine }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Hello! I am ZacAI, a modular cognitive engine. How can I help you today?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsThinking(true)

    const response = await engine.processQuery(input)

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.answer,
      reasoning: response.reasoning,
      confidence: response.confidence,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsThinking(false)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <div className="p-2 bg-primary rounded-full text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </div>
              )}
              <Card
                className={`max-w-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <CardContent className="p-4">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.role === "assistant" && message.reasoning && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-muted-foreground flex items-center gap-1">
                        <BrainCircuit className="h-3 w-3" />
                        Show Reasoning
                      </summary>
                      <div className="mt-2 p-3 bg-background/50 rounded-md space-y-1 text-muted-foreground">
                        <p className="font-bold flex items-center gap-2">
                          {message.confidence && message.confidence > 0.7 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          Confidence: {(message.confidence! * 100).toFixed(0)}%
                        </p>
                        <ul className="list-disc list-inside">
                          {message.reasoning.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
              {message.role === "user" && (
                <div className="p-2 bg-secondary rounded-full text-secondary-foreground">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary rounded-full text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <Card className="max-w-2xl bg-secondary text-secondary-foreground">
                <CardContent className="p-4 flex items-center gap-2 text-muted-foreground">
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                  <span>ZacAI is thinking...</span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ZacAI anything..."
            className="flex-grow"
            disabled={isThinking}
          />
          <Button type="submit" disabled={isThinking || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
