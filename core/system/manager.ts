// Central system manager that orchestrates all components
import type { SystemStats, ModuleInterface } from "@/types/global"
import { reasoningEngine } from "@/engines/reasoning"
import { learningEngine } from "@/engines/learning"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import { contextManager } from "@/core/context/manager"

export class SystemManager {
  private modules: Map<string, ModuleInterface> = new Map()
  private initialized = false
  private startTime = Date.now()

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Initialize core engines
      await reasoningEngine.initialize()
      await learningEngine.initialize()

      // Initialize context manager
      contextManager.createContext()

      // Register and initialize modules
      await this.registerModule(vocabularyModule)
      await this.registerModule(mathematicsModule)
      await this.registerModule(factsModule)
      await this.registerModule(codingModule)
      await this.registerModule(philosophyModule)
      await this.registerModule(userInfoModule)

      this.initialized = true
      console.log("✅ ZacAI System Manager initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize System Manager:", error)
      throw error
    }
  }

  private async registerModule(module: ModuleInterface): Promise<void> {
    try {
      console.log(`📦 Initializing ${module.name} module...`)
      await module.initialize()
      this.modules.set(module.name, module)
      console.log(`✅ ${module.name} module initialized`)
    } catch (error) {
      console.error(`❌ Failed to initialize ${module.name} module:`, error)
      // Continue with other modules even if one fails
    }
  }

  async processInput(input: string): Promise<any> {
    if (!this.initialized) {
      throw new Error("System not initialized")
    }

    try {
      // Add user message to context
      contextManager.addMessage({
        role: "user",
        content: input,
      })

      // Extract context for processing
      const context = contextManager.extractContext(input)

      // Create reasoning chain
      const reasoningChain = await reasoningEngine.createReasoningChain(input, context, [])

      // Determine which modules to query based on reasoning
      const modulesToQuery = reasoningChain.steps[0]?.output?.suggestedModules || ["facts"]

      // Query relevant modules
      const moduleResponses = []
      for (const moduleName of modulesToQuery) {
        const module = this.modules.get(moduleName)
        if (module) {
          try {
            const response = await module.process(input, context)
            if (response.success) {
              moduleResponses.push(response)
            }
          } catch (error) {
            console.error(`Error processing with ${moduleName} module:`, error)
          }
        }
      }

      // Update reasoning chain with module responses
      const finalReasoningChain = await reasoningEngine.createReasoningChain(input, context, moduleResponses)

      // Select best response
      let bestResponse = null
      let confidence = 0

      if (moduleResponses.length > 0) {
        const sortedResponses = moduleResponses.sort((a, b) => b.confidence - a.confidence)
        bestResponse = sortedResponses[0]
        confidence = bestResponse.confidence
      }

      // Generate final response
      const finalResponse = bestResponse
        ? bestResponse.data
        : "I'm not sure how to help with that. Could you please rephrase your question or ask about something else?"

      // Add assistant message to context
      contextManager.addMessage({
        role: "assistant",
        content: finalResponse,
        metadata: {
          confidence,
          sources: moduleResponses.map((r) => r.source),
          reasoning: finalReasoningChain.steps.map((s) => s.reasoning),
        },
      })

      // Learn from this interaction
      if (bestResponse) {
        await learningEngine.learnFromInteraction(input, finalResponse, confidence, bestResponse.source, context)
      }

      return {
        response: finalResponse,
        confidence,
        sources: moduleResponses.map((r) => r.source),
        reasoning: finalReasoningChain.steps.map((s) => s.reasoning),
        moduleResponses: moduleResponses.length,
        processingTime: Date.now() - this.startTime, // This would be calculated properly
      }
    } catch (error) {
      console.error("Error processing input:", error)
      return {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: [],
        reasoning: ["Error occurred during processing"],
        moduleResponses: 0,
        processingTime: 0,
      }
    }
  }

  getSystemStats(): SystemStats {
    const moduleStats: { [key: string]: any } = {}

    for (const [name, module] of this.modules.entries()) {
      moduleStats[name] = module.getStats()
    }

    return {
      initialized: this.initialized,
      modules: moduleStats,
      learning: learningEngine.getLearningStats(),
      cognitive: {
        initialized: true,
        registeredModules: Array.from(this.modules.keys()),
        contextStats: contextManager.getContextStats(),
      },
      uptime: Date.now() - this.startTime,
      totalQueries: Object.values(moduleStats).reduce((sum: number, stats: any) => sum + stats.totalQueries, 0),
      averageResponseTime:
        Object.values(moduleStats).reduce((sum: number, stats: any) => sum + stats.averageResponseTime, 0) /
        this.modules.size,
    }
  }

  getModule(name: string): ModuleInterface | undefined {
    return this.modules.get(name)
  }

  getModules(): ModuleInterface[] {
    return Array.from(this.modules.values())
  }

  async exportData(): Promise<any> {
    const data: any = {
      system: {
        version: "2.0.0",
        exportDate: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
      },
      modules: {},
      context: contextManager.exportContext(),
      learning: learningEngine.getLearningStats(),
      reasoning: reasoningEngine.getStats(),
    }

    // Export module-specific data
    for (const [name, module] of this.modules.entries()) {
      data.modules[name] = {
        stats: module.getStats(),
        // Additional module-specific export data could be added here
      }
    }

    return data
  }

  async importData(data: any): Promise<void> {
    if (data.context) {
      contextManager.importContext(data.context)
    }

    // Additional import logic could be added here
    console.log("Data import completed")
  }

  isInitialized(): boolean {
    return this.initialized
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  async shutdown(): Promise<void> {
    console.log("🔄 Shutting down ZacAI System Manager...")

    // Save any pending learning data
    await learningEngine.forceProcessQueue()

    // Cleanup resources
    learningEngine.destroy()

    this.initialized = false
    console.log("✅ ZacAI System Manager shutdown complete")
  }
}

export const systemManager = new SystemManager()
