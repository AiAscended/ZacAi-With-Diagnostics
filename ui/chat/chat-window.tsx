"use client"
import { useState, useEffect, useRef } from "react"
import { systemManager } from "@/core/system/manager"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, Bot, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatWindowProps {
  onToggleAdmin: () => void
}

export function ChatWindow({ onToggleAdmin }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "ZacAI is online. How can I assist you?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim()) return
    const userInput = input
    setInput("")
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userInput }])
    setIsLoading(true)

    const result = await systemManager.processQuery(userInput)
    setMessages((prev) => [...prev, { id: Date.now().toString() + "a", role: "assistant", content: result.response }])
    setIsLoading(false)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <CardHeader className="flex-shrink-0 bg-white border-b">
        <div className="flex justify-between items-center">
          <CardTitle>ZacAI Chat</CardTitle>
          <Button onClick={onToggleAdmin} variant="outline">
            Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef as any}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && <Bot className="w-6 h-6" />}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-white"}`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && <User className="w-6 h-6" />}
            </div>
          ))}
          {isLoading && <Loader2 className="animate-spin" />}
        </div>
      </CardContent>
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  )
}
