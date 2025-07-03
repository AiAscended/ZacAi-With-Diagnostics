import type { ModuleInterface, ModuleResponse, SystemStats } from "@/types/global"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"

interface ChatLogEntry {
  id: string
  input: string
  response: string
  confidence: number
  sources: string[]
  processingTime: number
  timestamp: number
}

interface ModuleHealth {
  name: string
  status: "healthy" | "degraded" | "failed"
  lastError?: string
  lastSuccess?: number
  failureCount: number
  consecutiveFailures: number
}

class SystemManager {
  private modules: Map<string, ModuleInterface> = new Map()
  private chatLog: ChatLogEntry[] = []
  private systemStats: SystemStats = {
    initialized: false,
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    uptime: Date.now(),
    modules: {},
  }
  private moduleHealth: Map<string, { status: string; lastCheck: number; failures: number }> = new Map()

  async initialize(): Promise<void> {
    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Register modules with proper error handling
      await this.registerModule("vocab", vocabularyModule)
      await this.registerModule("mathematics", mathematicsModule)
      await this.registerModule("facts", factsModule)
      await this.registerModule("coding", codingModule)
      await this.registerModule("philosophy", philosophyModule)
      await this.registerModule("user-info", userInfoModule)

      this.systemStats.initialized = true
      this.startHealthMonitoring()

      console.log("✅ ZacAI System Manager initialized successfully")
    } catch (error) {
      console.error("❌ System Manager initialization failed:", error)
      // System can still run with partial functionality
      this.systemStats.initialized = true
    }
  }

  private async registerModule(name: string, module: ModuleInterface): Promise<void> {
    try {
      await module.initialize()
      this.modules.set(name, module)
      this.moduleHealth.set(name, { status: "healthy", lastCheck: Date.now(), failures: 0 })
      this.systemStats.modules[name] = module.getStats()
      console.log(`✅ Module '${name}' registered successfully`)
    } catch (error) {
      console.error(`❌ Failed to register module '${name}':`, error)
      this.moduleHealth.set(name, { status: "failed", lastCheck: Date.now(), failures: 1 })
      // Continue with other modules
    }
  }

  async processInput(input: string): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning?: string[]
    processingTime: number
  }> {
    const startTime = Date.now()
    this.systemStats.totalQueries++

    try {
      const responses: ModuleResponse[] = []
      const activeModules = Array.from(this.modules.entries()).filter(
        ([name]) => this.moduleHealth.get(name)?.status !== "failed",
      )

      // Process input through all healthy modules
      for (const [name, module] of activeModules) {
        try {
          const response = await Promise.race([
            module.process(input),
            new Promise<ModuleResponse>((_, reject) => setTimeout(() => reject(new Error("Module timeout")), 10000)),
          ])

          if (response.success && response.confidence > 0.3) {
            responses.push({ ...response, source: name })
          }

          // Update module health
          const health = this.moduleHealth.get(name)!
          health.status = "healthy"
          health.failures = 0
          health.lastCheck = Date.now()
        } catch (error) {
          console.error(`Module '${name}' failed:`, error)
          this.handleModuleFailure(name)
        }
      }

      const processingTime = Date.now() - startTime
      let finalResponse: string
      let confidence: number
      let sources: string[]

      if (responses.length > 0) {
        // Find best response
        const bestResponse = responses.reduce((best, current) =>
          current.confidence > best.confidence ? current : best,
        )

        finalResponse = bestResponse.data
        confidence = bestResponse.confidence
        sources = responses.map((r) => r.source)

        this.updateSuccessStats(processingTime, true)
      } else {
        // Fallback response
        finalResponse = this.generateFallbackResponse(input)
        confidence = 0.1
        sources = ["fallback"]

        this.updateSuccessStats(processingTime, false)
      }

      // Log the interaction
      this.logInteraction({
        id: Date.now().toString(),
        input,
        response: finalResponse,
        confidence,
        sources,
        processingTime,
        timestamp: Date.now(),
      })

      return {
        response: finalResponse,
        confidence,
        sources,
        processingTime,
      }
    } catch (error) {
      console.error("System processing error:", error)
      const processingTime = Date.now() - startTime
      this.updateSuccessStats(processingTime, false)

      return {
        response: "I apologize, but I'm experiencing technical difficulties. Please try again.",
        confidence: 0,
        sources: ["error"],
        processingTime,
      }
    }
  }

  // Alias for backward compatibility
  async processQuery(input: string) {
    return this.processInput(input)
  }

  private handleModuleFailure(moduleName: string): void {
    const health = this.moduleHealth.get(moduleName)
    if (health) {
      health.failures++
      health.lastCheck = Date.now()

      if (health.failures >= 3) {
        health.status = "failed"
        console.warn(`⚠️ Module '${moduleName}' marked as failed after ${health.failures} consecutive failures`)
      } else {
        health.status = "degraded"
      }
    }
  }

  private generateFallbackResponse(input: string): string {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("define") || lowerInput.includes("meaning")) {
      return "I'm having trouble accessing my vocabulary module right now. Please try again in a moment, or check the admin panel for system status."
    }

    if (lowerInput.match(/\d+\s*[+\-*/]\s*\d+/)) {
      return "My mathematics module is currently unavailable. Please try again shortly, or check the admin panel for system diagnostics."
    }

    if (lowerInput.includes("what is") || lowerInput.includes("tell me about")) {
      return "I'm experiencing connectivity issues with my knowledge modules. Please try again in a moment."
    }

    return "I'm currently experiencing some technical difficulties. Please try rephrasing your question or check the admin panel for system status."
  }

  private logInteraction(entry: ChatLogEntry): void {
    this.chatLog.unshift(entry) // Add to beginning for recent-first order

    // Keep only last 100 entries
    if (this.chatLog.length > 100) {
      this.chatLog = this.chatLog.slice(0, 100)
    }
  }

  private updateSuccessStats(responseTime: number, success: boolean): void {
    // Update average response time
    this.systemStats.averageResponseTime =
      (this.systemStats.averageResponseTime * (this.systemStats.totalQueries - 1) + responseTime) /
      this.systemStats.totalQueries

    // Update success rate
    const currentSuccesses = Math.round(this.systemStats.successRate * (this.systemStats.totalQueries - 1))
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses
    this.systemStats.successRate = newSuccesses / this.systemStats.totalQueries

    // Update module stats
    for (const [name, module] of this.modules) {
      this.systemStats.modules[name] = module.getStats()
    }
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Check every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    for (const [name, module] of this.modules) {
      const health = this.moduleHealth.get(name)
      if (health && health.status === "degraded") {
        try {
          // Try a simple test query
          const testResponse = await module.process("test")
          if (testResponse.success) {
            health.status = "healthy"
            health.failures = 0
            console.log(`✅ Module '${name}' recovered`)
          }
        } catch (error) {
          console.log(`⚠️ Module '${name}' still degraded`)
        }
        health.lastCheck = Date.now()
      }
    }
  }

  getSystemStats(): SystemStats {
    return {
      ...this.systemStats,
      uptime: Date.now() - this.systemStats.uptime,
      moduleHealth: Object.fromEntries(this.moduleHealth),
    }
  }

  getChatLog(): ChatLogEntry[] {
    return [...this.chatLog]
  }

  clearChatLog(): void {
    this.chatLog = []
  }

  async exportData(): Promise<any> {
    const exportData = {
      timestamp: new Date().toISOString(),
      systemStats: this.getSystemStats(),
      chatLog: this.getChatLog(),
      moduleData: {},
    }

    // Export data from each module
    for (const [name, module] of this.modules) {
      try {
        exportData.moduleData[name] = module.getStats()
      } catch (error) {
        console.error(`Failed to export data from module '${name}':`, error)
      }
    }

    return exportData
  }

  async recoverModule(moduleName: string): Promise<boolean> {
    const module = this.modules.get(moduleName)
    if (!module) return false

    try {
      await module.initialize()
      this.moduleHealth.set(moduleName, { status: "healthy", lastCheck: Date.now(), failures: 0 })
      console.log(`✅ Module '${moduleName}' recovered manually`)
      return true
    } catch (error) {
      console.error(`❌ Failed to recover module '${moduleName}':`, error)
      return false
    }
  }
}

export const systemManager = new SystemManager()
