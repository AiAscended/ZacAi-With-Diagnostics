import type { ModuleInterface, SystemStats, ModuleStats } from "@/types/global"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import { reasoningEngine } from "@/engines/reasoning"
import { learningEngine } from "@/engines/learning"
import { contextManager } from "@/core/context/manager"
import { storageManager } from "@/core/storage/manager"

export class SystemManager {
  private initialized = false
  private modules: Map<string, ModuleInterface> = new Map()
  private startTime = Date.now()
  private totalQueries = 0
  private totalResponseTime = 0

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System...")

    try {
      // Initialize core components
      await storageManager.initialize()
      await contextManager.createContext()

      // Initialize engines
      await reasoningEngine.initialize()
      await learningEngine.initialize()

      // Initialize modules
      await this.initializeModules()

      this.initialized = true
      console.log("✅ ZacAI System initialized successfully")
    } catch (error) {
      console.error("❌ System initialization failed:", error)
      throw error
    }
  }

  private async initializeModules(): Promise<void> {
    const moduleList = [
      vocabularyModule,
      mathematicsModule,
      factsModule,
      codingModule,
      philosophyModule,
      userInfoModule,
    ]

    for (const module of moduleList) {
      try {
        await module.initialize()
        this.modules.set(module.name, module)
        console.log(`✅ ${module.name} module initialized`)
      } catch (error) {
        console.error(`❌ Failed to initialize ${module.name} module:`, error)
      }
    }
  }

  async processInput(input: string, context?: any): Promise<any> {
    if (!this.initialized) {
      throw new Error("System not initialized")
    }

    const startTime = Date.now()
    this.totalQueries++

    try {
      // Analyze intent
      const analysis = await reasoningEngine.analyze(input)

      // Add to context
      contextManager.addMessage({
        role: "user",
        content: input,
        metadata: { timestamp: Date.now() },
      })

      // Get context for processing
      const currentContext = contextManager.extractContext(input)

      // Process with relevant modules
      const moduleResponses = await this.processWithModules(input, analysis, currentContext)

      // Synthesize response
      const finalResponse = await reasoningEngine.synthesize(input, analysis, moduleResponses)

      // Add response to context
      contextManager.addMessage({
        role: "assistant",
        content: finalResponse.response,
        metadata: {
          confidence: finalResponse.confidence,
          sources: finalResponse.sources,
          timestamp: Date.now(),
        },
      })

      // Learn from interaction
      await learningEngine.learn(input, finalResponse)

      // Update stats
      const responseTime = Date.now() - startTime
      this.totalResponseTime += responseTime

      return {
        ...finalResponse,
        processingTime: responseTime,
        analysis,
        moduleResponses: moduleResponses.length,
      }
    } catch (error) {
      console.error("Error processing input:", error)
      return {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0.1,
        sources: ["system-error"],
        reasoning: ["System error occurred during processing"],
        error: error.message,
      }
    }
  }

  private async processWithModules(input: string, analysis: any, context: any): Promise<any[]> {
    const responses = []
    const suggestedModules = analysis.suggestedModules || []

    // If no specific modules suggested, try all active modules
    const modulesToTry = suggestedModules.length > 0 ? suggestedModules : Array.from(this.modules.keys())

    for (const moduleName of modulesToTry) {
      const module = this.modules.get(moduleName)
      if (module) {
        try {
          const response = await module.process(input, context)
          if (response && response.success) {
            responses.push(response)
          }
        } catch (error) {
          console.error(`Error in ${moduleName} module:`, error)
        }
      }
    }

    return responses
  }

  getSystemStats(): SystemStats {
    const moduleStats: { [key: string]: ModuleStats } = {}

    for (const [name, module] of this.modules) {
      moduleStats[name] = module.getStats()
    }

    return {
      initialized: this.initialized,
      modules: moduleStats,
      learning: learningEngine.getStats(),
      cognitive: reasoningEngine.getStats(),
      uptime: Date.now() - this.startTime,
      totalQueries: this.totalQueries,
      averageResponseTime: this.totalQueries > 0 ? this.totalResponseTime / this.totalQueries : 0,
    }
  }

  getModule(name: string): ModuleInterface | undefined {
    return this.modules.get(name)
  }

  getActiveModules(): string[] {
    return Array.from(this.modules.keys())
  }

  async shutdown(): Promise<void> {
    console.log("🔄 Shutting down ZacAI System...")

    // Clean up modules
    for (const module of this.modules.values()) {
      try {
        // If module has cleanup method, call it
        if ("cleanup" in module && typeof module.cleanup === "function") {
          await (module as any).cleanup()
        }
      } catch (error) {
        console.error("Error during module cleanup:", error)
      }
    }

    // Clean up engines
    if ("destroy" in learningEngine && typeof learningEngine.destroy === "function") {
      learningEngine.destroy()
    }

    this.modules.clear()
    this.initialized = false

    console.log("✅ System shutdown complete")
  }

  isInitialized(): boolean {
    return this.initialized
  }

  async reinitialize(): Promise<void> {
    await this.shutdown()
    await this.initialize()
  }
}

export const systemManager = new SystemManager()
