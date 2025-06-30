"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { CognitiveEngine } from "@/lib/cognitive-engine"

interface Message {
  text: string
  isUser: boolean
}

const EnhancedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const aiSystem = useRef<CognitiveEngine | null>(null)

  useEffect(() => {
    if (!aiSystem.current) {
      aiSystem.current = new CognitiveEngine()
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { text: input, isUser: true }
    setMessages((prevMessages) => [...prevMessages, userMessage])

    const aiResponse = await aiSystem.current?.process(input)

    if (aiResponse) {
      const aiMessage: Message = { text: aiResponse, isUser: false }
      setMessages((prevMessages) => [...prevMessages, aiMessage])
    } else {
      const errorMessage: Message = { text: "Error processing your request.", isUser: false }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    }

    setInput("")
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.isUser ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded ${message.isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            className="flex-grow focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
            placeholder="Enter your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage()
            }}
          />
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAIChat
