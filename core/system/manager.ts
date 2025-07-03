import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import { userMemory } from "@/core/memory/user-memory"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

interface SystemStats {
  initialized: boolean
  totalQueries: number
  successRate: number
  averageResponseTime: number
  moduleStats: { [module: string]: any }
  uptime: number
  lastQuery: number
}

interface QueryResponse {
  response: string
  confidence: number
  sources: string[]
  processingTime: number
  thinkingSteps?: any[]
}

class SystemManager {
  private modules = new Map()
  private initialized = false
  private startTime = Date.now()
  private chatLog: any[] = []
  private stats: SystemStats = {
    initialized: false,
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    moduleStats: {},
    uptime: 0,
    lastQuery: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Initialize storage and memory first
      await storageManager.initialize()
      await userMemory.initialize()

      // Initialize all modules
      this.modules.set("vocabulary", vocabularyModule)
      this.modules.set("mathematics", mathematicsModule)
      this.modules.set("facts", factsModule)
      this.modules.set("coding", codingModule)
      this.modules.set("philosophy", philosophyModule)
      this.modules.set("user-info", userInfoModule)

      // Initialize each module
      for (const [name, module] of this.modules) {
        try {
          await module.initialize()
          console.log(`✅ ${name} module initialized`)
        } catch (error) {
          console.error(`❌ Failed to initialize ${name} module:`, error)
        }
      }

      this.initialized = true
      this.stats.initialized = true
      console.log("🎉 ZacAI System Manager initialized successfully!")
    } catch (error) {
      console.error("❌ System Manager initialization failed:", error)
      throw error
    }
  }

  async processQuery(input: string): Promise<QueryResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Process user introduction first
      const isIntroduction = userMemory.processUserIntroduction(input)
      if (isIntroduction) {
        const name = userMemory.retrieve("name")?.value
        return {
          response: `Nice to meet you, ${name}! I'm ZacAI, your enhanced AI assistant. I can help you with vocabulary, mathematics, facts, coding, and philosophy. What would you like to explore?`,
          confidence: 0.95,
          sources: ["user-info"],
          processingTime: Date.now() - startTime,
        }
      }

      // Determine which modules to use
      const relevantModules = this.determineRelevantModules(input)
      const results: any[] = []

      // Process query through relevant modules
      for (const moduleName of relevantModules) {
        const module = this.modules.get(moduleName)
        if (module) {
          try {
            const result = await module.process(input, { originalInput: input })
            if (result.success) {
              results.push({
                module: moduleName,
                ...result,
              })
            }
          } catch (error) {
            console.error(`Error in ${moduleName} module:`, error)
          }
        }
      }

      // Generate response
      const response = this.synthesizeResponse(input, results)
      const processingTime = Date.now() - startTime

      // Update stats
      this.updateStats(processingTime, results.length > 0)

      // Log the interaction
      this.logInteraction(input, response, results, processingTime)

      return response
    } catch (error) {
      console.error("Error processing query:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["error"],
        processingTime: Date.now() - startTime,
      }
    }
  }

  private determineRelevantModules(input: string): string[] {
    const modules: string[] = []
    const lowerInput = input.toLowerCase()

    // Vocabulary patterns
    if (
      lowerInput.includes("define") ||
      lowerInput.includes("meaning") ||
      lowerInput.includes("synonym") ||
      lowerInput.includes("pronounce") ||
      lowerInput.includes("spell")
    ) {
      modules.push("vocabulary")
    }

    // Mathematics patterns
    if (
      /[\d+\-*/()=]/.test(input) ||
      lowerInput.includes("calculate") ||
      lowerInput.includes("math") ||
      lowerInput.includes("equation") ||
      lowerInput.includes("solve")
    ) {
      modules.push("mathematics")
    }

    // Facts patterns
    if (
      lowerInput.includes("what is") ||
      lowerInput.includes("who is") ||
      lowerInput.includes("when") ||
      lowerInput.includes("where") ||
      lowerInput.includes("fact") ||
      lowerInput.includes("information")
    ) {
      modules.push("facts")
    }

    // Coding patterns
    if (
      lowerInput.includes("code") ||
      lowerInput.includes("program") ||
      lowerInput.includes("javascript") ||
      lowerInput.includes("react") ||
      lowerInput.includes("nextjs") ||
      lowerInput.includes("function")
    ) {
      modules.push("coding")
    }

    // Philosophy patterns
    if (
      lowerInput.includes("philosophy") ||
      lowerInput.includes("ethics") ||
      lowerInput.includes("meaning of life") ||
      lowerInput.includes("existence") ||
      lowerInput.includes("consciousness")
    ) {
      modules.push("philosophy")
    }

    // User info patterns
    if (
      lowerInput.includes("my name") ||
      lowerInput.includes("i am") ||
      lowerInput.includes("remember") ||
      lowerInput.includes("about me")
    ) {
      modules.push("user-info")
    }

    // Default to vocabulary if no specific patterns found
    if (modules.length === 0) {
      modules.push("vocabulary")
    }

    return modules
  }

  private synthesizeResponse(input: string, results: any[]): QueryResponse {
    if (results.length === 0) {
      return {
        response: "I'm not sure how to help with that. Could you try rephrasing your question?",
        confidence: 0,
        sources: [],
        processingTime: 0,
      }
    }

    // If single result, return it directly
    if (results.length === 1) {
      const result = results[0]
      return {
        response: result.data || "I found some information but couldn't format it properly.",
        confidence: result.confidence || 0,
        sources: [result.module],
        processingTime: 0,
      }
    }

    // Multiple results - synthesize
    let response = ""
    const sources: string[] = []
    let totalConfidence = 0

    results.forEach((result, index) => {
      if (result.data) {
        if (index > 0) response += "\n\n"
        response += result.data
        sources.push(result.module)
        totalConfidence += result.confidence || 0
      }
    })

    return {
      response: response || "I found multiple pieces of information but couldn't format them properly.",
      confidence: results.length > 0 ? totalConfidence / results.length : 0,
      sources,
      processingTime: 0,
    }
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }

    this.stats.uptime = Date.now() - this.startTime
    this.stats.lastQuery = Date.now()

    // Update module stats
    this.modules.forEach((module, name) => {
      if (module.getStats) {
        this.stats.moduleStats[name] = module.getStats()
      }
    })
  }

  private logInteraction(input: string, response: QueryResponse, results: any[], processingTime: number): void {
    const logEntry = {
      id: generateId(),
      timestamp: Date.now(),
      input,
      response: response.response,
      confidence: response.confidence,
      sources: response.sources,
      processingTime,
      results: results.map((r) => ({
        module: r.module,
        success: r.success,
        confidence: r.confidence,
      })),
    }

    this.chatLog.push(logEntry)

    // Keep only last 100 interactions
    if (this.chatLog.length > 100) {
      this.chatLog = this.chatLog.slice(-100)
    }
  }

  getSystemStats(): SystemStats {
    return { ...this.stats }
  }

  getChatLog(): any[] {
    return [...this.chatLog]
  }

  getModuleStats(moduleName: string): any {
    const module = this.modules.get(moduleName)
    return module?.getStats ? module.getStats() : null
  }

  async clearModuleData(moduleName: string): Promise<void> {
    await storageManager.clearModuleData(moduleName)
  }

  async exportData(): Promise<any> {
    const systemData = await storageManager.exportData()
    const memoryData = userMemory.export()

    return {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      system: systemData,
      memory: memoryData,
      stats: this.stats,
      chatLog: this.chatLog,
    }
  }

  async importData(data: any): Promise<void> {
    if (data.system) {
      await storageManager.importData(data.system)
    }
    if (data.memory) {
      userMemory.import(data.memory)
    }
    if (data.chatLog) {
      this.chatLog = data.chatLog
    }
  }

  async resetSystem(): Promise<void> {
    // Clear all module data
    for (const moduleName of this.modules.keys()) {
      await this.clearModuleData(moduleName)
    }

    // Clear user memory
    userMemory.clear()

    // Reset stats
    this.stats = {
      initialized: true,
      totalQueries: 0,
      successRate: 0,
      averageResponseTime: 0,
      moduleStats: {},
      uptime: Date.now() - this.startTime,
      lastQuery: 0,
    }

    // Clear chat log
    this.chatLog = []

    console.log("🔄 System reset completed")
  }
}

export const systemManager = new SystemManager()
