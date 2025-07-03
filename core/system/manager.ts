import type { ModuleInterface, SystemResponse } from "@/types/global"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import { userMemory } from "@/core/memory/user-memory"

interface ModuleHealth {
  name: string
  status: "healthy" | "degraded" | "failed"
  lastError?: string
  lastSuccess?: number
  failureCount: number
  consecutiveFailures: number
}

export class SystemManager {
  private modules: Map<string, ModuleInterface> = new Map()
  private moduleHealth: Map<string, ModuleHealth> = new Map()
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
    errors?: string[]
  }> = []

  // Self-healing and fallback responses
  private fallbackResponses = {
    vocabulary: "I'm having trouble accessing the dictionary right now, but I can still help with other topics.",
    mathematics: "The math module is temporarily unavailable, but I can assist with other subjects.",
    facts: "I can't access external fact sources at the moment, but I can help with other questions.",
    coding: "The coding assistance is temporarily down, but I'm still here to help with other topics.",
    philosophy: "Philosophy discussions are temporarily unavailable, but I can help with other subjects.",
    "user-info": "Personal memory is temporarily unavailable, but I can still assist you.",
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System Manager with fault tolerance...")

    try {
      // Register modules with health monitoring
      const moduleList = [
        { name: "vocabulary", module: vocabularyModule },
        { name: "mathematics", module: mathematicsModule },
        { name: "facts", module: factsModule },
        { name: "coding", module: codingModule },
        { name: "philosophy", module: philosophyModule },
        { name: "user-info", module: userInfoModule },
      ]

      // Initialize modules with individual error handling
      for (const { name, module } of moduleList) {
        try {
          this.modules.set(name, module)
          this.moduleHealth.set(name, {
            name,
            status: "healthy",
            failureCount: 0,
            consecutiveFailures: 0,
          })

          await module.initialize()
          console.log(`✅ ${name} module initialized successfully`)
        } catch (error) {
          console.error(`⚠️ Failed to initialize ${name} module:`, error)
          this.moduleHealth.set(name, {
            name,
            status: "failed",
            lastError: error instanceof Error ? error.message : String(error),
            failureCount: 1,
            consecutiveFailures: 1,
          })
          // Continue with other modules - don't let one failure stop the system
        }
      }

      this.initialized = true
      console.log("✅ ZacAI System Manager initialized with fault tolerance")

      // Load chat log from storage
      this.loadChatLog()

      // Start health monitoring
      this.startHealthMonitoring()
    } catch (error) {
      console.error("❌ Critical system initialization failure:", error)
      // Even if initialization fails, mark as initialized so the system can still respond
      this.initialized = true
      throw error
    }
  }

  private startHealthMonitoring(): void {
    // Check module health every 30 seconds
    setInterval(() => {
      this.performHealthCheck()
    }, 30000)
  }

  private async performHealthCheck(): Promise<void> {
    for (const [name, module] of this.modules.entries()) {
      const health = this.moduleHealth.get(name)
      if (!health) continue

      try {
        // Simple health check - try to process a basic query
        const testInput = name === "mathematics" ? "1+1" : `test ${name}`
        await module.process(testInput)

        // Reset health if it was previously failed
        if (health.status !== "healthy") {
          health.status = "healthy"
          health.consecutiveFailures = 0
          health.lastSuccess = Date.now()
          console.log(`✅ ${name} module recovered`)
        }
      } catch (error) {
        health.failureCount++
        health.consecutiveFailures++
        health.lastError = error instanceof Error ? error.message : String(error)

        if (health.consecutiveFailures >= 3) {
          health.status = "failed"
          console.error(`❌ ${name} module marked as failed after ${health.consecutiveFailures} consecutive failures`)
        } else {
          health.status = "degraded"
          console.warn(`⚠️ ${name} module degraded (${health.consecutiveFailures} failures)`)
        }
      }
    }
  }

  async processInput(input: string): Promise<SystemResponse> {
    const startTime = Date.now()
    this.systemStats.totalQueries++
    const errors: string[] = []

    try {
      // Always try to extract personal information (this should never fail)
      try {
        userMemory.extractPersonalInfo(input)
      } catch (error) {
        errors.push(`Memory extraction failed: ${error}`)
      }

      // Process input through healthy modules only
      const moduleResponses = await this.processWithHealthyModules(input, errors)

      // Always provide some response, even if all modules fail
      if (moduleResponses.length === 0) {
        const fallbackResponse = this.generateSystemFallbackResponse(input, errors)
        const processingTime = Date.now() - startTime

        this.updateStats(processingTime, false)
        this.addToChatLog(input, fallbackResponse.response, fallbackResponse.confidence, [], processingTime, errors)

        return fallbackResponse
      }

      // Combine successful responses
      const combinedResponse = this.combineResponses(moduleResponses)
      const processingTime = Date.now() - startTime

      // Add to user memory (with error handling)
      try {
        userMemory.addConversation(input, combinedResponse.response)
      } catch (error) {
        errors.push(`Memory storage failed: ${error}`)
      }

      this.updateStats(processingTime, true)
      this.addToChatLog(
        input,
        combinedResponse.response,
        combinedResponse.confidence,
        combinedResponse.sources,
        processingTime,
        errors,
      )

      return combinedResponse
    } catch (error) {
      console.error("❌ Critical error in processInput:", error)
      const processingTime = Date.now() - startTime
      this.updateStats(processingTime, false)
      errors.push(`System error: ${error}`)

      const criticalFallback = {
        response:
          "I'm experiencing some technical difficulties, but I'm still here to help. Please try rephrasing your question or ask about something else.",
        confidence: 0.1,
        sources: ["system-fallback"],
        reasoning: ["Critical system error occurred", "Using emergency fallback response"],
        timestamp: Date.now(),
      }

      this.addToChatLog(
        input,
        criticalFallback.response,
        criticalFallback.confidence,
        criticalFallback.sources,
        processingTime,
        errors,
      )
      return criticalFallback
    }
  }

  private async processWithHealthyModules(input: string, errors: string[]): Promise<any[]> {
    const responses: any[] = []

    for (const [name, module] of this.modules.entries()) {
      const health = this.moduleHealth.get(name)

      // Skip failed modules
      if (health?.status === "failed") {
        errors.push(`${name} module is currently unavailable`)
        continue
      }

      try {
        const response = await Promise.race([
          module.process(input),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Module timeout")), 10000)),
        ])

        if (response && response.success && response.confidence > 0.1) {
          responses.push({ ...response, moduleName: name })

          // Update health on success
          if (health) {
            health.consecutiveFailures = 0
            health.lastSuccess = Date.now()
            if (health.status !== "healthy") {
              health.status = "healthy"
              console.log(`✅ ${name} module recovered during processing`)
            }
          }
        }
      } catch (error) {
        console.error(`Module ${name} failed during processing:`, error)
        errors.push(`${name} module error: ${error}`)

        // Update health on failure
        if (health) {
          health.failureCount++
          health.consecutiveFailures++
          health.lastError = error instanceof Error ? error.message : String(error)

          if (health.consecutiveFailures >= 2) {
            health.status = health.consecutiveFailures >= 3 ? "failed" : "degraded"
          }
        }
      }
    }

    return responses
  }

  private generateSystemFallbackResponse(input: string, errors: string[]): SystemResponse {
    // Analyze input to provide contextual fallback
    const lowerInput = input.toLowerCase()
    let fallbackMessage =
      "I'm having some technical difficulties with my modules right now, but I'm still here to help. "

    // Provide specific fallbacks based on input type
    if (lowerInput.match(/define|meaning|what is/)) {
      fallbackMessage += "For word definitions, you might try searching online dictionaries while I recover."
    } else if (lowerInput.match(/\d+|\+|-|\*|\/|calculate/)) {
      fallbackMessage += "For calculations, you can use a calculator app while my math module recovers."
    } else if (lowerInput.match(/code|program|function/)) {
      fallbackMessage += "For coding help, you might check documentation sites while my coding module recovers."
    } else {
      fallbackMessage += "Please try asking a different type of question, or try again in a few moments."
    }

    // Add system status info
    const healthyModules = Array.from(this.moduleHealth.values()).filter((h) => h.status === "healthy")
    if (healthyModules.length > 0) {
      fallbackMessage += `\n\nCurrently available: ${healthyModules.map((h) => h.name).join(", ")}`
    }

    return {
      response: fallbackMessage,
      confidence: 0.3,
      sources: ["system-fallback"],
      reasoning: [
        "Multiple module failures detected",
        `Errors: ${errors.slice(0, 3).join(", ")}`,
        "Using intelligent fallback response",
      ],
      timestamp: Date.now(),
    }
  }

  private combineResponses(responses: any[]): SystemResponse {
    if (responses.length === 0) {
      return this.generateSystemFallbackResponse("", ["No module responses"])
    }

    // Sort by confidence
    responses.sort((a, b) => b.confidence - a.confidence)

    const primaryResponse = responses[0]
    const sources = responses.map((r) => r.moduleName)
    const reasoning = responses
      .filter((r) => r.data)
      .map(
        (r) => `${r.moduleName}: ${typeof r.data === "string" ? r.data.substring(0, 100) : "Processed successfully"}`,
      )

    // Combine high-confidence responses
    if (responses.length > 1 && responses[1].confidence > 0.6) {
      const combinedData = responses
        .filter((r) => r.confidence > 0.6)
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
      response: primaryResponse.data || "I processed your request but couldn't generate a proper response.",
      confidence: primaryResponse.confidence,
      sources,
      reasoning,
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
    errors?: string[],
  ): void {
    const logEntry = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      input,
      response,
      confidence,
      sources,
      processingTime,
      errors: errors && errors.length > 0 ? errors : undefined,
    }

    this.chatLog.push(logEntry)

    // Keep only last 1000 entries
    if (this.chatLog.length > 1000) {
      this.chatLog = this.chatLog.slice(-1000)
    }

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

  // Public methods for system diagnostics
  getSystemHealth(): any {
    const moduleHealthStatus = Array.from(this.moduleHealth.entries()).map(([name, health]) => ({
      name,
      status: health.status,
      failureCount: health.failureCount,
      consecutiveFailures: health.consecutiveFailures,
      lastError: health.lastError,
      lastSuccess: health.lastSuccess,
    }))

    return {
      systemStatus: this.initialized ? "online" : "offline",
      totalModules: this.modules.size,
      healthyModules: moduleHealthStatus.filter((m) => m.status === "healthy").length,
      degradedModules: moduleHealthStatus.filter((m) => m.status === "degraded").length,
      failedModules: moduleHealthStatus.filter((m) => m.status === "failed").length,
      modules: moduleHealthStatus,
      uptime: Date.now() - this.systemStats.startTime,
    }
  }

  getSystemStats(): any {
    const moduleStats: { [key: string]: any } = {}

    for (const [name, module] of this.modules.entries()) {
      try {
        moduleStats[name] = {
          ...module.getStats(),
          health: this.moduleHealth.get(name),
        }
      } catch (error) {
        moduleStats[name] = {
          error: "Failed to get stats",
          health: this.moduleHealth.get(name),
        }
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
      systemHealth: this.getSystemHealth(),
      memoryStats: this.getMemoryStats(),
    }
  }

  private getMemoryStats(): any {
    try {
      return userMemory.getStats()
    } catch (error) {
      return { error: "Memory stats unavailable" }
    }
  }

  getChatLog(): any[] {
    return [...this.chatLog].reverse()
  }

  async exportData(): Promise<any> {
    return {
      timestamp: Date.now(),
      systemStats: this.getSystemStats(),
      systemHealth: this.getSystemHealth(),
      chatLog: this.chatLog,
      moduleHealth: Array.from(this.moduleHealth.entries()),
    }
  }

  clearChatLog(): void {
    this.chatLog = []
    localStorage.removeItem("zacai_chat_log")
  }

  // Manual module recovery
  async recoverModule(moduleName: string): Promise<boolean> {
    const module = this.modules.get(moduleName)
    const health = this.moduleHealth.get(moduleName)

    if (!module || !health) return false

    try {
      await module.initialize()
      health.status = "healthy"
      health.consecutiveFailures = 0
      health.lastSuccess = Date.now()
      console.log(`✅ Manually recovered ${moduleName} module`)
      return true
    } catch (error) {
      health.lastError = error instanceof Error ? error.message : String(error)
      console.error(`❌ Failed to recover ${moduleName} module:`, error)
      return false
    }
  }
}

export const systemManager = new SystemManager()
