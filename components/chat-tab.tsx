// components/chat-tab.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import type { CognitiveEngine } from "@/lib/cognitive-engine"
import type { ChatMessage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, BrainCircuit, User, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface ChatTabProps {
  engine: CognitiveEngine
}

export default function ChatTab({ engine }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(engine.getConversationHistory())
  }, [engine])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setIsThinking(true)
    const currentInput = input
    setInput("")

    // Add user message immediately for better UX
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: currentInput,
        timestamp: Date.now(),
      },
    ])

    await engine.processQuery(currentInput)
    setMessages([...engine.getConversationHistory()])
    setIsThinking(false)
  }

  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className={`max-w-xl w-full ${message.role === "user" ? "text-right" : ""}`}>
                <Card
                  className={`p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  <ReactMarkdown className="prose dark:prose-invert max-w-none">{message.content}</ReactMarkdown>
                </Card>
                {message.role === "assistant" && message.reasoning && (
                  <Card className="mt-2 p-3 bg-muted/50 border-dashed">
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
                        <BrainCircuit className="h-4 w-4" />
                        Reasoning Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {message.reasoning.map((step, i) => (
                          <li key={i}>- {step}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
              {message.role === "user" && (
                <div className="p-2 bg-secondary rounded-full">
                  <User className="h-6 w-6 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isThinking && handleSend()}
          placeholder="Ask me to define a word or calculate something..."
          disabled={isThinking}
        />
        <Button onClick={handleSend} disabled={isThinking}>
          {isThinking ? "Thinking..." : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
