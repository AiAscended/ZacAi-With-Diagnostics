"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { KnowledgeManagerV2 } from "@/lib/knowledge-manager-v2"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { ChevronDown, Cloud, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const EnhancedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: string; content: string; thinking?: string; suggestions?: string[] }[]
  >([])
  const [input, setInput] = useState("")
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...")
  const [isSystemReady, setIsSystemReady] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinking, setCurrentThinking] = useState("")
  const [knowledgeManager] = useState(() => new KnowledgeManagerV2())
  const [aiSystem] = useState(() => new ReliableAISystem())

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setLoadingStatus("Loading core systems...")

        // Load session data first
        knowledgeManager.loadSessionFromLocalStorage()

        // Load knowledge from IndexedDB
        await knowledgeManager.loadFromIndexedDB()

        // Load seed data
        await knowledgeManager.loadSeedData()

        // Initialize AI system
        await aiSystem.initialize()

        setLoadingStatus("System ready!")
        setIsSystemReady(true)

        setTimeout(() => setLoadingStatus(""), 2000)
      } catch (error) {
        console.error("Failed to initialize AI system:", error)
        setLoadingStatus("System initialization failed")
      }
    }

    initializeSystem()
  }, [knowledgeManager, aiSystem])

  const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
    const suggestions = []

    if (userMessage.toLowerCase().includes("what") || userMessage.toLowerCase().includes("how")) {
      suggestions.push("Can you explain that in more detail?")
      suggestions.push("What are some examples?")
    }

    if (userMessage.toLowerCase().includes("remember")) {
      suggestions.push("What else should I remember about you?")
      suggestions.push("Show me what you've learned about me")
    }

    suggestions.push("Tell me something interesting")
    suggestions.push("What can you help me with?")

    return suggestions.slice(0, 3)
  }

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim()
    if (userMessage === "" || !isSystemReady) return

    if (!messageText) setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsThinking(true)
    setCurrentThinking("Analyzing your message and searching knowledge base...")

    try {
      // Simulate thinking process
      setTimeout(() => setCurrentThinking("Processing context and generating response..."), 1000)

      // Get AI response using the reliable AI system
      const response = await aiSystem.processMessage(userMessage)

      // Generate suggestions
      const suggestions = generateSuggestions(userMessage, response.content)

      setIsThinking(false)
      setCurrentThinking("")

      // Learn from the interaction
      await knowledgeManager.learnFromMessage(userMessage, response.content)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          thinking:
            "I analyzed your message, searched my knowledge base, and generated a contextual response based on what I've learned.",
          suggestions,
        },
      ])
    } catch (error) {
      console.error("Error processing message:", error)
      setIsThinking(false)
      setCurrentThinking("")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your message." },
      ])
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">ZacAI Enhanced Chat</h1>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {loadingStatus && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 text-sm">{loadingStatus}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isThinking && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-yellow-600 animate-pulse" />
                <span className="text-yellow-700 text-sm">{currentThinking}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <Card
              className={`${message.role === "user" ? "bg-blue-100 border-blue-200 ml-12" : "bg-white border-gray-200 mr-12"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      message.role === "user" ? "bg-blue-500" : "bg-gray-500"
                    }`}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{message.content}</p>

                    {message.thinking && (
                      <Collapsible className="mt-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                            <Brain className="h-3 w-3 mr-1" />
                            Show AI thinking
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 border-l-2 border-gray-300">
                            <strong>AI Thinking Process:</strong>
                            <p className="mt-1">{message.thinking}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {message.suggestions && message.suggestions.length > 0 && (
              <div className="flex items-center space-x-2 ml-12">
                <Cloud className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, suggestionIndex) => (
                    <Button
                      key={suggestionIndex}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white hover:bg-gray-50"
                      onClick={() => sendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="p-4 bg-white border-t shadow-sm">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            disabled={!isSystemReady || isThinking}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!isSystemReady || isThinking || input.trim() === ""}
            className="px-6"
          >
            {isThinking ? "Thinking..." : "Send"}
          </Button>
        </div>
        {!isSystemReady && (
          <div className="text-red-500 text-sm mt-2 text-center">System is initializing. Please wait...</div>
        )}
      </footer>
    </div>
  )
}

export default EnhancedAIChat
