"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Cog, Search, Calculator, BookOpen, Database, Wifi, Save, CheckCircle, BrainCircuit } from "lucide-react"

const iconMap = {
  Cog,
  Search,
  Calculator,
  BookOpen,
  Database,
  Wifi,
  Save,
  CheckCircle,
  BrainCircuit,
}

interface ThinkingStep {
  step: string
  details?: string
  status: "processing" | "completed" | "failed"
  icon?: keyof typeof iconMap
}

interface EnhancedAISystemInterface {
  processInput: (input: string) => Promise<string>
}

class EnhancedAISystem implements EnhancedAISystemInterface {
  private thinkingProcessCallback: (step: ThinkingStep) => void

  constructor(thinkingProcessCallback: (step: ThinkingStep) => void) {
    this.thinkingProcessCallback = thinkingProcessCallback
  }

  async processInput(input: string): Promise<string> {
    this.thinkingProcessCallback({ step: "Analyzing input", status: "processing", icon: "Cog" })
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.thinkingProcessCallback({ step: "Input analyzed", status: "completed", icon: "Cog" })

    this.thinkingProcessCallback({ step: "Searching for relevant information", status: "processing", icon: "Search" })
    await new Promise((resolve) => setTimeout(resolve, 800))
    this.thinkingProcessCallback({ step: "Information found", status: "completed", icon: "Search" })

    this.thinkingProcessCallback({ step: "Performing calculations", status: "processing", icon: "Calculator" })
    await new Promise((resolve) => setTimeout(resolve, 600))
    this.thinkingProcessCallback({ step: "Calculations complete", status: "completed", icon: "Calculator" })

    this.thinkingProcessCallback({ step: "Consulting knowledge base", status: "processing", icon: "BookOpen" })
    await new Promise((resolve) => setTimeout(resolve, 700))
    this.thinkingProcessCallback({ step: "Knowledge base consulted", status: "completed", icon: "BookOpen" })

    this.thinkingProcessCallback({ step: "Accessing database", status: "processing", icon: "Database" })
    await new Promise((resolve) => setTimeout(resolve, 900))
    this.thinkingProcessCallback({ step: "Database accessed", status: "completed", icon: "Database" })

    this.thinkingProcessCallback({ step: "Connecting to network", status: "processing", icon: "Wifi" })
    await new Promise((resolve) => setTimeout(resolve, 400))
    this.thinkingProcessCallback({ step: "Network connected", status: "completed", icon: "Wifi" })

    const result = "AI response based on your input."
    this.thinkingProcessCallback({ step: "Saving result", status: "processing", icon: "Save" })
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.thinkingProcessCallback({ step: "Result saved", status: "completed", icon: "Save" })

    this.thinkingProcessCallback({ step: "Finalizing response", status: "processing", icon: "BrainCircuit" })
    await new Promise((resolve) => setTimeout(resolve, 300))
    this.thinkingProcessCallback({ step: "Response finalized", status: "completed", icon: "BrainCircuit" })

    return result
  }
}

interface EnhancedAIChatProps {
  initialInput?: string
}

const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({ initialInput = "" }) => {
  const [input, setInput] = useState(initialInput)
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingProcess, setThinkingProcess] = useState<ThinkingStep[]>([])
  const [aiSystem] = useState(
    () =>
      new EnhancedAISystem((step) => {
        setThinkingProcess((prev) => [...prev, step])
      }),
  )

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput)
    }
  }, [initialInput])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setThinkingProcess([])

    try {
      const aiResponse = await aiSystem.processInput(input)
      setResponse(aiResponse)
    } catch (error) {
      console.error("Error processing input:", error)
      setResponse("An error occurred while processing your request.")
      setThinkingProcess((prev) => [...prev, { step: "Error occurred", status: "failed", icon: "Cog" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Enhanced AI Chat</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your query..."
          className="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-4 bg-green-50 border rounded-lg">
          <h3 className="font-semibold text-lg">Response:</h3>
          <p>{response}</p>
        </div>
      )}

      {thinkingProcess.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
          <h4 className="font-semibold text-sm mb-3">Thinking Process...</h4>
          <div className="space-y-2">
            {thinkingProcess.map((item, index) => {
              const Icon = iconMap[item.icon || "Cog"] || Cog
              return (
                <div key={index} className="flex items-start text-xs">
                  <Icon
                    className={`w-3.5 h-3.5 mt-0.5 mr-2 flex-shrink-0 ${
                      item.status === "completed"
                        ? "text-green-500"
                        : item.status === "processing"
                          ? "text-blue-500 animate-spin"
                          : item.status === "failed"
                            ? "text-red-500"
                            : "text-gray-500"
                    }`}
                  />
                  <div className="flex-grow">
                    <span className="font-medium">{item.step}</span>
                    {item.details && <span className="text-gray-500 ml-2">{item.details}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedAIChat
