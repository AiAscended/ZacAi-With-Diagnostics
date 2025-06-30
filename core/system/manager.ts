import type { SystemConfig } from "@/types/global"
import { APP_CONFIG } from "@/config/app"
import { cognitiveEngine } from "@/engines/cognitive"
import { learningEngine } from "@/engines/learning"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"

export class SystemManager {
  private config: SystemConfig
  private initialized = false
  private modules: Map<string, any> = new Map()

  constructor() {
    this.config = APP_CONFIG
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing ZacAI System...")

    try {
      // Initialize core engines
      await this.initializeEngines()

      // Initialize modules
      await this.initializeModules()

      // Register modules with cognitive engine
      this.registerModules()

      this.initialized = true
      console.log("✅ ZacAI System initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing ZacAI System:", error)
      throw error
    }
  }

  private async initializeEngines(): Promise<void> {
    console.log("Initializing engines...")

    await cognitiveEngine.initialize()
    await learningEngine.initialize()

    console.log("Engines initialized")
  }

  private async initializeModules(): Promise<void> {
    console.log("Initializing modules...")

    const modulePromises = []

    if (this.config.features.vocabulary) {
      modulePromises.push(vocabularyModule.initialize())
      this.modules.set("vocabulary", vocabularyModule)
    }

    if (this.config.features.mathematics) {
      modulePromises.push(mathematicsModule.initialize())
      this.modules.set("mathematics", mathematicsModule)
    }

    if (this.config.features.facts) {
      modulePromises.push(factsModule.initialize())
      this.modules.set("facts", factsModule)
    }

    await Promise.all(modulePromises)
    console.log(`Initialized ${this.modules.size} modules`)
  }

  private registerModules(): void {
    console.log("Registering modules with cognitive engine...")

    for (const [name, module] of this.modules) {
      cognitiveEngine.registerModule(module)
    }

    console.log("Modules registered")
  }

  async processInput(input: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize()
    }

    return await cognitiveEngine.processInput(input)
  }

  getSystemStats(): any {
    const moduleStats: any = {}

    for (const [name, module] of this.modules) {
      if (module.getStats) {
        moduleStats[name] = module.getStats()
      }
    }

    return {
      initialized: this.initialized,
      config: this.config,
      modules: moduleStats,
      cognitive: cognitiveEngine.getStats(),
      learning: learningEngine.getLearningStats(),
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }

  getConfig(): SystemConfig {
    return { ...this.config }
  }
}

export const systemManager = new SystemManager()
