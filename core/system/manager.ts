import { cognitiveEngine } from "@/engines/cognitive"
import { reasoningEngine } from "@/engines/reasoning"
import { learningEngine } from "@/engines/learning"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { codingModule } from "@/modules/coding"
import { factsModule } from "@/modules/facts"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"

export class SystemManager {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing ZacAI System...")

    try {
      // Initialize engines
      await cognitiveEngine.initialize()
      await reasoningEngine.initialize()
      await learningEngine.initialize()

      // Initialize modules
      await vocabularyModule.initialize()
      await mathematicsModule.initialize()
      await codingModule.initialize()
      await factsModule.initialize()
      await philosophyModule.initialize()
      await userInfoModule.initialize()

      // Register modules with cognitive engine
      cognitiveEngine.registerModule(vocabularyModule)
      cognitiveEngine.registerModule(mathematicsModule)
      cognitiveEngine.registerModule(codingModule)
      cognitiveEngine.registerModule(factsModule)
      cognitiveEngine.registerModule(philosophyModule)
      cognitiveEngine.registerModule(userInfoModule)

      this.initialized = true
      console.log("ZacAI System initialized successfully")
    } catch (error) {
      console.error("Error initializing system:", error)
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
      await this.initialize()
    }

    // Record learning event
    await learningEngine.recordEvent({
      type: "user_input",
      data: { input },
      timestamp: Date.now(),
      source: "user",
      confidence: 1.0,
      verified: true,
    })

    // Process with cognitive engine
    const result = await cognitiveEngine.processInput(input)

    // Record result event
    await learningEngine.recordEvent({
      type: "system_response",
      data: { response: result.response, confidence: result.confidence },
      timestamp: Date.now(),
      source: "cognitive_engine",
      confidence: result.confidence,
      verified: result.confidence > 0.7,
    })

    return result
  }

  getSystemStats(): any {
    return {
      initialized: this.initialized,
      cognitive: cognitiveEngine.getStats(),
      reasoning: reasoningEngine.getStats(),
      learning: learningEngine.getStats(),
      modules: {
        vocabulary: vocabularyModule.getStats(),
        mathematics: mathematicsModule.getStats(),
        coding: codingModule.getStats(),
        facts: factsModule.getStats(),
        philosophy: philosophyModule.getStats(),
        userInfo: userInfoModule.getStats(),
      },
    }
  }
}

export const systemManager = new SystemManager()
