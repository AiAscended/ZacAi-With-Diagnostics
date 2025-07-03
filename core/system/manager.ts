import type { ModuleInterface, SystemResponse } from "@/types/global"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import { userMemory } from "@/core/memory/user-memory"

export class SystemManager {
  private modules: Map<string, ModuleInterface> = new Map()
  private initialized = false
  private systemStats = {
    startTime: Date.now(),
    totalQueries: 0,
    averageResponseTime: 0,
    successfulResponses: 0,
    failedResponses: 0,
  }
  private chatLog: Array<{
    id: string
    timestamp: number
    input: string
    response: string
    confidence: number
    sources: string[]
    processingTime: number
  }> = []

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Register modules
      this.modules.set("vocabulary", vocabularyModule)
      this.modules.set("mathematics", mathematicsModule)
      this.modules.set("facts", factsModule)
      this.modules.set("coding", codingModule)
      this.modules.set("philosophy", philosophyModule)
      this.modules.set("user-info", userInfoModule)

      // Initialize all modules
      const initPromises = Array.from(this.modules.values()).map((module) => module.initialize())
      await Promise.all(initPromises)

      this.initialized = true
      console.log("✅ ZacAI System Manager initialized successfully")

      // Load chat log from storage
      this.loadChatLog()
    } catch (error) {
      console.error("❌ Failed to initialize System Manager:", error)
      throw error
    }
  }

  async processInput(input: string): Promise<SystemResponse> {
    const startTime = Date.now()
    this.systemStats.totalQueries++

    try {
      // Extract personal information first
      userMemory.extractPersonalInfo(input)

      // Process input through all modules
      const moduleResponses = await this.processWithModules(input)

      // Filter successful responses
      const successfulResponses = moduleResponses.filter((response) => response.success && response.confidence > 0.3)

      if (successfulResponses.length === 0) {
        const fallbackResponse = this.generateFallbackResponse(input)
        const processingTime = Date.now() - startTime

        this.updateStats(processingTime, false)
        this.addToChatLog(input, fallbackResponse.response, fallbackResponse.confidence, [], processingTime)

        return fallbackResponse
      }

      // Combine responses intelligently
      const combinedResponse = this.combineResponses(successfulResponses)
      const processingTime = Date.now() - startTime

      // Add to user memory
      userMemory.addConversation(input, combinedResponse.response)

      this.updateStats(processingTime, true)
      this.addToChatLog(
        input,
        combinedResponse.response,
        combinedResponse.confidence,
        combinedResponse.sources,
        processingTime,
      )

      return combinedResponse
    } catch (error) {
      console.error("❌ Error processing input:", error)
      const processingTime = Date.now() - startTime
      this.updateStats(processingTime, false)

      const errorResponse = {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["system-error"],
        reasoning: [`Error: ${error}`],
        timestamp: Date.now(),
      }

      this.addToChatLog(input, errorResponse.response, errorResponse.confidence, errorResponse.sources, processingTime)
      return errorResponse
    }
  }

  private async processWithModules(input: string): Promise<any[]> {
    const promises = Array.from(this.modules.entries()).map(async ([name, module]) => {
      try {
        const response = await module.process(input)
        return { ...response, moduleName: name }
      } catch (error) {
        console.error(`Module ${name} failed:`, error)
        return { success: false, moduleName: name, error }
      }
    })

    return await Promise.all(promises)
  }

  private combineResponses(responses: any[]): SystemResponse {
    // Sort by confidence
    responses.sort((a, b) => b.confidence - a.confidence)

    const primaryResponse = responses[0]
    const sources = responses.map((r) => r.moduleName)
    const reasoning = responses
      .filter((r) => r.data)
      .map(
        (r) => `${r.moduleName}: ${typeof r.data === "string" ? r.data.substring(0, 100) : "Processed successfully"}`,
      )

    // If we have multiple high-confidence responses, combine them
    if (responses.length > 1 && responses[1].confidence > 0.7) {
      const combinedData = responses
        .filter((r) => r.confidence > 0.7)
        .map((r) => r.data)
        .join("\n\n---\n\n")

      return {
        response: combinedData,
        confidence: Math.min(1, responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length),
        sources,
        reasoning,
        timestamp: Date.now(),
      }
    }

    return {
      response: primaryResponse.data || "I processed your request but couldn't generate a response.",
      confidence: primaryResponse.confidence,
      sources,
      reasoning,
      timestamp: Date.now(),
    }
  }

  private generateFallbackResponse(input: string): SystemResponse {
    const suggestions = [
      "Try asking about vocabulary, mathematics, coding, or general facts",
      "You can ask me to define words, solve math problems, or explain concepts",
      "I can help with Next.js coding questions and Tesla mathematics",
      "Ask me about scientific facts or philosophical concepts",
    ]

    return {
      response: `I'm not sure how to help with that specific request. Here are some things I can help you with:\n\n• ${suggestions.join("\n• ")}\n\nFeel free to ask me anything about these topics!`,
      confidence: 0.3,
      sources: ["system-fallback"],
      reasoning: ["No modules provided confident responses", "Generated helpful suggestions"],
      timestamp: Date.now(),
    }
  }

  private updateStats(processingTime: number, success: boolean): void {
    this.systemStats.averageResponseTime =
      (this.systemStats.averageResponseTime * (this.systemStats.totalQueries - 1) + processingTime) /
      this.systemStats.totalQueries

    if (success) {
      this.systemStats.successfulResponses++
    } else {
      this.systemStats.failedResponses++
    }
  }

  private addToChatLog(
    input: string,
    response: string,
    confidence: number,
    sources: string[],
    processingTime: number,
  ): void {
    const logEntry = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      input,
      response,
      confidence,
      sources,
      processingTime,
    }

    this.chatLog.push(logEntry)

    // Keep only last 1000 entries
    if (this.chatLog.length > 1000) {
      this.chatLog = this.chatLog.slice(-1000)
    }

    // Save to localStorage
    this.saveChatLog()
  }

  private loadChatLog(): void {
    try {
      const stored = localStorage.getItem("zacai_chat_log")
      if (stored) {
        this.chatLog = JSON.parse(stored)
        console.log(`✅ Loaded ${this.chatLog.length} chat log entries`)
      }
    } catch (error) {
      console.warn("Failed to load chat log:", error)
    }
  }

  private saveChatLog(): void {
    try {
      localStorage.setItem("zacai_chat_log", JSON.stringify(this.chatLog))
    } catch (error) {
      console.warn("Failed to save chat log:", error)
    }
  }

  getSystemStats(): any {
    const moduleStats: { [key: string]: any } = {}

    for (const [name, module] of this.modules.entries()) {
      try {
        moduleStats[name] = module.getStats()
      } catch (error) {
        moduleStats[name] = { error: "Failed to get stats" }
      }
    }

    return {
      initialized: this.initialized,
      uptime: Date.now() - this.systemStats.startTime,
      totalQueries: this.systemStats.totalQueries,
      successfulResponses: this.systemStats.successfulResponses,
      failedResponses: this.systemStats.failedResponses,
      averageResponseTime: this.systemStats.averageResponseTime,
      successRate:
        this.systemStats.totalQueries > 0 ? this.systemStats.successfulResponses / this.systemStats.totalQueries : 0,
      modules: moduleStats,
      chatLogEntries: this.chatLog.length,
      memoryStats: userMemory.getStats(),
    }
  }

  getChatLog(): any[] {
    return [...this.chatLog].reverse() // Most recent first
  }

  async exportData(): Promise<any> {
    const exportData = {
      timestamp: Date.now(),
      systemStats: this.getSystemStats(),
      chatLog: this.chatLog,
      userMemory: userMemory.getStats(),
      modules: {},
    }

    // Export module-specific data
    for (const [name, module] of this.modules.entries()) {
      try {
        exportData.modules[name] = {
          stats: module.getStats(),
          // Add module-specific export data if available
        }
      } catch (error) {
        exportData.modules[name] = { error: "Export failed" }
      }
    }

    return exportData
  }

  clearChatLog(): void {
    this.chatLog = []
    localStorage.removeItem("zacai_chat_log")
  }
}

export const systemManager = new SystemManager()
