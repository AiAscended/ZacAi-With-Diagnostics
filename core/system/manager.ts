import { VocabularyModule } from "@/modules/vocabulary"
import { MathematicsModule } from "@/modules/mathematics"
import { FactsModule } from "@/modules/facts"
import { CodingModule } from "@/modules/coding"
import { PhilosophyModule } from "@/modules/philosophy"
import { UserInfoModule } from "@/modules/user-info"
import { ReasoningEngine } from "@/engines/reasoning"
import { LearningEngine } from "@/engines/learning"
import { StorageManager } from "@/core/storage/manager"

interface SystemResponse {
  response: string
  confidence: number
  sources?: string[]
  reasoning?: string[]
  mathAnalysis?: any
}

class SystemManager {
  private modules: Map<string, any> = new Map()
  private reasoningEngine: ReasoningEngine
  private learningEngine: LearningEngine
  private storageManager: StorageManager
  private initialized = false

  constructor() {
    this.reasoningEngine = new ReasoningEngine()
    this.learningEngine = new LearningEngine()
    this.storageManager = new StorageManager()
  }

  async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing ZacAI System Manager...")

      // Initialize storage
      await this.storageManager.initialize()

      // Initialize modules
      this.modules.set("vocabulary", new VocabularyModule())
      this.modules.set("mathematics", new MathematicsModule())
      this.modules.set("facts", new FactsModule())
      this.modules.set("coding", new CodingModule())
      this.modules.set("philosophy", new PhilosophyModule())
      this.modules.set("user-info", new UserInfoModule())

      // Initialize each module
      for (const [name, module] of this.modules) {
        await module.initialize()
        console.log(`✅ ${name} module initialized`)
      }

      // Initialize engines
      await this.reasoningEngine.initialize()
      await this.learningEngine.initialize()

      this.initialized = true
      console.log("✅ ZacAI System Manager fully initialized")
    } catch (error) {
      console.error("❌ System initialization failed:", error)
      throw error
    }
  }

  async processInput(input: string): Promise<SystemResponse> {
    if (!this.initialized) {
      throw new Error("System not initialized")
    }

    try {
      // Use reasoning engine to analyze input
      const analysis = await this.reasoningEngine.analyze(input)

      // Determine which modules to query
      const relevantModules = this.determineRelevantModules(input, analysis)

      // Query modules
      const moduleResponses = await Promise.all(
        relevantModules.map(async (moduleName) => {
          const module = this.modules.get(moduleName)
          if (module) {
            return await module.process(input, analysis)
          }
          return null
        }),
      )

      // Combine responses using reasoning engine
      const finalResponse = await this.reasoningEngine.synthesize(
        input,
        analysis,
        moduleResponses.filter((r) => r !== null),
      )

      // Learn from interaction
      await this.learningEngine.learn(input, finalResponse)

      return finalResponse
    } catch (error) {
      console.error("Error processing input:", error)
      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        confidence: 0.1,
        sources: ["error-handler"],
      }
    }
  }

  private determineRelevantModules(input: string, analysis: any): string[] {
    const modules: string[] = []
    const lowerInput = input.toLowerCase()

    // Math detection
    if (/\d+\s*[+\-*/×÷]\s*\d+|calculate|math|multiply|divide|add|subtract/.test(lowerInput)) {
      modules.push("mathematics")
    }

    // Vocabulary detection
    if (/define|meaning|what is|etymology|synonym|antonym/.test(lowerInput)) {
      modules.push("vocabulary")
    }

    // Facts detection
    if (/who is|what is|when did|where is|tell me about/.test(lowerInput)) {
      modules.push("facts")
    }

    // Coding detection
    if (/code|function|programming|javascript|python|html|css/.test(lowerInput)) {
      modules.push("coding")
    }

    // Philosophy detection
    if (/philosophy|consciousness|meaning of life|ethics|morality/.test(lowerInput)) {
      modules.push("philosophy")
    }

    // User info detection
    if (/my name|i am|remember|personal/.test(lowerInput)) {
      modules.push("user-info")
    }

    // Default to vocabulary if no specific module detected
    if (modules.length === 0) {
      modules.push("vocabulary", "facts")
    }

    return modules
  }

  getSystemStats() {
    const moduleStats: any = {}

    for (const [name, module] of this.modules) {
      moduleStats[name] = {
        learntEntries: module.getLearntCount ? module.getLearntCount() : 0,
        totalQueries: module.getQueryCount ? module.getQueryCount() : 0,
        successRate: module.getSuccessRate ? module.getSuccessRate() : 0.85,
        averageResponseTime: module.getAvgResponseTime ? module.getAvgResponseTime() : 150,
      }
    }

    return {
      initialized: this.initialized,
      modules: moduleStats,
      learning: this.learningEngine.getStats(),
      cognitive: this.reasoningEngine.getStats(),
      uptime: Date.now(),
      totalQueries: Object.values(moduleStats).reduce((sum: number, mod: any) => sum + mod.totalQueries, 0),
      averageResponseTime: 150,
    }
  }

  async exportData() {
    const data: any = {
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      modules: {},
    }

    for (const [name, module] of this.modules) {
      if (module.exportData) {
        data.modules[name] = await module.exportData()
      }
    }

    return data
  }
}

export const systemManager = new SystemManager()
