"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { KnowledgeManager } from "../lib/knowledge-manager"

const knowledgeManager = new KnowledgeManager()

const EnhancedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...")
  const [isSystemReady, setIsSystemReady] = useState(false)

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setLoadingStatus("Loading core systems...")
        await knowledgeManager.loadSeedData()
        await knowledgeManager.loadFromIndexedDB()
        knowledgeManager.loadSessionFromLocalStorage()

        setLoadingStatus("System ready!")
        setIsSystemReady(true)

        setTimeout(() => setLoadingStatus(""), 2000)
      } catch (error) {
        console.error("Failed to initialize AI system:", error)
        setLoadingStatus("System initialization failed")
      }
    }

    initializeSystem()
  }, [])

  const sendMessage = async () => {
    if (input.trim() === "") return

    setMessages([...messages, { role: "user", content: input }])
    const response = await knowledgeManager.query(input)
    setMessages([...messages, { role: "user", content: input }, { role: "assistant", content: response }])
    setInput("")
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4">
        <h1 className="text-xl font-semibold">Enhanced AI Chat</h1>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {loadingStatus && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 text-sm">{loadingStatus}</span>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg ${message.role === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
          >
            <strong className="capitalize">{message.role}:</strong> {message.content}
          </div>
        ))}
      </main>

      <footer className="p-4 bg-gray-100">
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage()
              }
            }}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring focus:blue-300"
            onClick={sendMessage}
            disabled={!isSystemReady}
          >
            Send
          </button>
        </div>
        {!isSystemReady && <div className="text-red-500 text-sm mt-1">System is initializing. Please wait...</div>}
      </footer>
    </div>
  )
}

export default EnhancedAIChat
