// Central system manager that orchestrates all components
import { cognitiveEngine } from "@/engines/cognitive"
import { reasoningEngine } from "@/engines/reasoning"
import { learningEngine } from "@/engines/learning"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"

export class SystemManager {
  private initialized = false
  private modules: any[] = []
  private engines: any[] = []

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing ZacAI System...")

    try {
      // Initialize all modules
      const modulePromises = [
        vocabularyModule.initialize(),
        mathematicsModule.initialize(),
        factsModule.initialize(),
        codingModule.initialize(),
        philosophyModule.initialize(),
        userInfoModule.initialize(),
      ]

      await Promise.all(modulePromises)

      // Register modules with cognitive engine
      cognitiveEngine.registerModule(vocabularyModule)
      cognitiveEngine.registerModule(mathematicsModule)
      cognitiveEngine.registerModule(factsModule)
      cognitiveEngine.registerModule(codingModule)
      cognitiveEngine.registerModule(philosophyModule)
      cognitiveEngine.registerModule(userInfoModule)

      // Initialize engines
      await cognitiveEngine.initialize()
      await learningEngine.initialize()

      this.modules = [vocabularyModule, mathematicsModule, factsModule, codingModule, philosophyModule, userInfoModule]

      this.engines = [cognitiveEngine, reasoningEngine, learningEngine]

      this.initialized = true
      console.log("ZacAI System initialized successfully")
    } catch (error) {
      console.error("Failed to initialize ZacAI System:", error)
      throw error
    }
  }

  async processInput(input: string): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  }> {
    if (!this.initialized) {
      throw new Error("System not initialized")
    }

    try {
      // Process with cognitive engine
      const result = await cognitiveEngine.processInput(input)

      // Learn from the interaction
      await learningEngine.learnFromInteraction(
        input,
        result.response,
        result.confidence,
        result.sources.join(", "),
        {},
      )

      return result
    } catch (error) {
      console.error("Error processing input:", error)
      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: [],
        reasoning: ["System error occurred during processing"],
      }
    }
  }

  getSystemStats(): any {
    const moduleStats: any = {}

    this.modules.forEach((module) => {
      moduleStats[module.name] = module.getStats()
    })

    return {
      initialized: this.initialized,
      modules: moduleStats,
      cognitive: cognitiveEngine.getStats(),
      learning: learningEngine.getLearningStats(),
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

export const systemManager = new SystemManager()
