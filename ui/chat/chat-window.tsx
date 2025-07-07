"use client"
import { useState, useEffect, useRef } from "react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `🎉 **ZacAI System v2.0.8 Online!**

I'm your advanced AI assistant with modular intelligence capabilities:

• **Vocabulary & Definitions** - Word meanings, synonyms, etymology
• **Mathematics & Calculations** - Arithmetic, algebra, problem-solving  
• **Facts & Information** - General knowledge and explanations
• **Programming & Code** - JavaScript, React, web development
• **Philosophy & Ethics** - Deep thinking and moral reasoning
• **Personal Memory** - I remember what you tell me about yourself

**What would you like to explore today?**`,
      timestamp: Date.now(),
      confidence: 1.0,
      sources: ["core", "welcome"],
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingSteps])

  const simulateThinking = async (input: string) => {
    const steps = [
      "🔍 Analyzing your question...",
      "🧠 Determining relevant knowledge modules...",
      "📚 Searching knowledge base...",
      "🤔 Processing with AI reasoning...",
      "✨ Formulating comprehensive response...",
    ]

    setIsThinking(true)
    setThinkingSteps([])

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400))
      setThinkingSteps(prev => [...prev, steps[i]])
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    setIsThinking(false)
