"use client"
import { useState } from "react"
import type { ThinkingStep } from "@/components/thinking-process"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  processingTime?: number
  thinkingSteps?: ThinkingStep[]
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export default function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]
