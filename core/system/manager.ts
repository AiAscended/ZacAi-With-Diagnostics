import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { userMemory } from "@/core/memory/user-memory"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

interface ChatLogEntry {
  id: string
  input: string
  response: string
  confidence: number
  sources: string[]
  timestamp: number
  processingTime: number
  thinkingSteps?: any[]
}

interface SystemStats {
  initialized: boolean
  totalQueries: number
  successfulQueries: number
  averageResponseTime: number
  uptime: number
  successRate: number
  modules: { [module: string]: any }
}

class SystemManager {
  private initialized = false
  private chatLog: ChatLogEntry[] = []
  private startTime = Date.now()
  private stats: SystemStats = {
    initialized: false,
    totalQueries: 0,
    successfulQueries: 0,
    averageResponseTime: 0,
    uptime: 0,
    successRate: 0,
    modules: {},
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Initialize core systems
      await storageManager.initialize()
      await userMemory.initialize()

      // Initialize modules
      await vocabularyModule.initialize()
      await mathematicsModule.initialize()

      // Load chat history
      this.loadChatHistory()

      this.initialized = true
      this.stats.initialized = true
      console.log("✅ ZacAI System Manager initialized successfully")
    } catch (error) {
      console.error("❌ System Manager initialization failed:", error)
      throw error
    }
  }

  async processQuery(input: string): Promise<any> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Check for personal information first
      await this.extractPersonalInfo(input)

      // Determine which modules to use
      const modules = this.determineModules(input)
      const results: any[] = []

      // Process with each relevant module
      for (const moduleName of modules) {
        let moduleResult = null

        switch (moduleName) {
          case "vocabulary":
            moduleResult = await vocabularyModule.process(input)
            break
          case "mathematics":
            moduleResult = await mathematicsModule.process(input)
            break
        }

        if (moduleResult && moduleResult.success) {
          results.push(moduleResult)
        }
      }

      // Generate response
      const response = this.synthesizeResponse(input, results)
      const processingTime = Date.now() - startTime

      // Log the interaction
      const logEntry: ChatLogEntry = {
        id: generateId(),
        input,
        response: response.text,
        confidence: response.confidence,
        sources: response.sources,
        timestamp: Date.now(),
        processingTime,
      }

      this.chatLog.push(logEntry)
      this.saveChatHistory()

      this.stats.successfulQueries++
      this.updateStats(processingTime)

      return {
        response: response.text,
        confidence: response.confidence,
        sources: response.sources,
        processingTime,
      }
    } catch (error) {
      console.error("Error processing query:", error)
      this.updateStats(Date.now() - startTime)

      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["error"],
        processingTime: Date.now() - startTime,
      }
    }
  }

  private async extractPersonalInfo(input: string): Promise<void> {
    // Extract name from "Hi I'm [name]" patterns
    const nameMatch = input.match(/(?:hi|hello|hey),?\s+i'?m\s+([a-zA-Z]+)/i)
    if (nameMatch) {
      const name = nameMatch[1]
      userMemory.store("name", name, "personal", 0.9, `User introduced themselves as ${name}`)
      console.log(`👋 Learned user's name: ${name}`)
    }

    // Extract other personal preferences
    const preferencePatterns = [
      { pattern: /i\s+like\s+([^.!?]+)/i, type: "preference" },
      { pattern: /my\s+favorite\s+([^.!?]+)/i, type: "preference" },
      { pattern: /i\s+am\s+([^.!?]+)/i, type: "personal" },
    ]

    preferencePatterns.forEach(({ pattern, type }) => {
      const match = input.match(pattern)
      if (match) {
        const key = `${type}_${Date.now()}`
        userMemory.store(key, match[1].trim(), type as any, 0.7, input)
      }
    })
  }

  private determineModules(input: string): string[] {
    const modules: string[] = []
    const lowerInput = input.toLowerCase()

    // Vocabulary indicators
    if (
      lowerInput.includes("define") ||
      lowerInput.includes("meaning") ||
      lowerInput.includes("synonym") ||
      lowerInput.includes("pronounce") ||
      lowerInput.includes("spell")
    ) {
      modules.push("vocabulary")
    }

    // Mathematics indicators
    if (
      /[\d+\-*/()=]/.test(input) ||
      lowerInput.includes("calculate") ||
      lowerInput.includes("solve") ||
      lowerInput.includes("math") ||
      lowerInput.includes("equation")
    ) {
      modules.push("mathematics")
    }

    // If no specific module detected, try vocabulary first
    if (modules.length === 0) {
      modules.push("vocabulary")
    }

    return modules
  }

  private synthesizeResponse(input: string, results: any[]): any {
    if (results.length === 0) {
      return {
        text: "I'm not sure how to help with that. Could you try rephrasing your question?",
        confidence: 0.1,
        sources: [],
      }
    }

    // Get user's name for personalization
    const userName = userMemory.retrieve("name")?.value

    // Combine results from multiple modules
    let responseText = ""
    let totalConfidence = 0
    const sources: string[] = []

    // Add personalized greeting if user name is known
    if (userName && results.length > 0) {
      responseText += `Hi ${userName}! `
    }

    results.forEach((result, index) => {
      if (result.data) {
        if (index > 0) responseText += "\n\n"
        responseText += result.data
      }
      totalConfidence += result.confidence || 0
      if (result.source) sources.push(result.source)
    })

    const averageConfidence = results.length > 0 ? totalConfidence / results.length : 0

    return {
      text: responseText,
      confidence: averageConfidence,
      sources: [...new Set(sources)],
    }
  }

  private updateStats(processingTime: number): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + processingTime) / this.stats.totalQueries
    this.stats.uptime = Date.now() - this.startTime
    this.stats.successRate = this.stats.totalQueries > 0 ? this.stats.successfulQueries / this.stats.totalQueries : 0
  }

  private loadChatHistory(): void {
    try {
      const stored = localStorage.getItem("zacai_chat_history")
      if (stored) {
        this.chatLog = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }

  private saveChatHistory(): void {
    try {
      // Keep only last 100 entries
      const recentLog = this.chatLog.slice(-100)
      localStorage.setItem("zacai_chat_history", JSON.stringify(recentLog))
    } catch (error) {
      console.error("Failed to save chat history:", error)
    }
  }

  getSystemStats(): SystemStats {
    return {
      ...this.stats,
      modules: {
        vocabulary: vocabularyModule.getStats(),
        mathematics: mathematicsModule.getStats(),
      },
    }
  }

  getChatLog(): ChatLogEntry[] {
    return [...this.chatLog]
  }

  clearChatHistory(): void {
    this.chatLog = []
    localStorage.removeItem("zacai_chat_history")
  }

  async exportData(): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      version: "3.0.0",
      chatLog: this.chatLog,
      userMemory: userMemory.getPersonalInfo(),
      systemStats: this.getSystemStats(),
      moduleData: await storageManager.exportData(),
    }
  }
}

export const systemManager = new SystemManager()
