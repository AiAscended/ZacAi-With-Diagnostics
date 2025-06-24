"use client"

import type React from "react"
import { useState, useCallback } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send } from "lucide-react"
import { CognitiveAISystem } from "@/lib/cognitive-ai-system"

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
}

const EnhancedAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSystem] = useState(() => new CognitiveAISystem())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const aiResponse = await aiSystem.sendMessage(input)

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
      }

      setMessages((prevMessages) => [...prevMessages, aiMessage])
    } catch (error) {
      console.error("Error during AI interaction:", error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, aiSystem])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`mb-2 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={cn(
                "flex items-center space-x-2 rounded-lg border px-4 py-2 text-sm",
                message.isUser ? "bg-blue-100 border-blue-200" : "bg-gray-100 border-gray-200",
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.isUser ? "/avatars/01.png" : "/avatars/02.png"}
                  alt={message.isUser ? "User" : "AI"}
                />
                <AvatarFallback>{message.isUser ? "U" : "AI"}</AvatarFallback>
              </Avatar>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-2 flex justify-start">
            <div className="flex items-center space-x-2 rounded-lg border px-4 py-2 text-sm bg-gray-100 border-gray-200">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/02.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            Send
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAIChat
