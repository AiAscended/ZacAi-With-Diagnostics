import { CognitiveRouter } from "./CognitiveRouter"
import { ThinkingEngine } from "../engines/ThinkingEngine"
import { MathEngine } from "../engines/MathEngine"
import { KnowledgeEngine } from "../engines/KnowledgeEngine"
import { LanguageEngine } from "../engines/LanguageEngine"
import { MemoryEngine } from "../engines/MemoryEngine"
import { DiagnosticEngine } from "../engines/DiagnosticEngine"
import { KnowledgeManager } from "../managers/KnowledgeManager"
import { StorageManager } from "../managers/StorageManager"
import { ContextManager } from "../managers/ContextManager"
import type { SystemConfig } from "./config"

export interface SystemResponse {
  content: string
  confidence: number
  reasoning: string[]
  pathways: string[]
  synthesis: any
  mathAnalysis?: any
}

export class SystemManager {
  private cognitiveRouter: CognitiveRouter
  private thinkingEngine: ThinkingEngine
  private mathEngine: MathEngine
  private knowledgeEngine: KnowledgeEngine
  private languageEngine: LanguageEngine
  private memoryEngine: MemoryEngine
  private diagnosticEngine: DiagnosticEngine
  private knowledgeManager: KnowledgeManager
  private storageManager: StorageManager
  private contextManager: ContextManager
  private isInitialized = false
  private config: SystemConfig

  constructor(config: SystemConfig) {
    this.config = config

    // Initialize managers first
    this.storageManager = new StorageManager()
    this.knowledgeManager = new KnowledgeManager()
    this.contextManager = new ContextManager()

    // Initialize engines
    this.thinkingEngine = new ThinkingEngine()
    this.mathEngine = new MathEngine()
    this.knowledgeEngine = new KnowledgeEngine(this.knowledgeManager)
    this.languageEngine = new LanguageEngine()
    this.memoryEngine = new MemoryEngine(this.storageManager)
    this.diagnosticEngine = new DiagnosticEngine()

    // Initialize cognitive router with all engines
    this.cognitiveRouter = new CognitiveRouter({
      thinkingEngine: this.thinkingEngine,
      mathEngine: this.mathEngine,
      knowledgeEngine: this.knowledgeEngine,
      languageEngine: this.languageEngine,
      memoryEngine: this.memoryEngine,
      diagnosticEngine: this.diagnosticEngine,
    })
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 Initializing ZacAI System Manager...")

    try {
      // Initialize all components in proper order
      await this.storageManager.initialize()
      await this.knowledgeManager.initialize()
      await this.contextManager.initialize()

      await this.memoryEngine.initialize()
      await this.knowledgeEngine.initialize()
      await this.languageEngine.initialize()
      await this.mathEngine.initialize()
      await this.thinkingEngine.initialize()
      await this.diagnosticEngine.initialize()

      await this.cognitiveRouter.initialize()

      this.isInitialized = true
      console.log("✅ ZacAI System Manager initialized successfully!")
    } catch (error) {
      console.error("❌ System Manager initialization failed:", error)
      throw error
    }
  }

  public async processMessage(userMessage: string): Promise<SystemResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 Processing message through System Manager:", userMessage)

    try {
      // Get conversation context
      const context = await this.contextManager.getContext()

      // Route through cognitive router
      const response = await this.cognitiveRouter.route(userMessage, context)

      // Update context with new interaction
      await this.contextManager.updateContext(userMessage, response)

      // Log diagnostics
      this.diagnosticEngine.logInteraction(userMessage, response)

      return response
    } catch (error) {
      console.error("❌ Error processing message:", error)
      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.1,
        reasoning: [`Error: ${error}`],
        pathways: ["error"],
        synthesis: null,
      }
    }
  }

  public getStats(): any {
    return {
      isInitialized: this.isInitialized,
      memoryStats: this.memoryEngine.getStats(),
      knowledgeStats: this.knowledgeEngine.getStats(),
      languageStats: this.languageEngine.getStats(),
      mathStats: this.mathEngine.getStats(),
      diagnosticStats: this.diagnosticEngine.getStats(),
      systemConfig: this.config,
    }
  }

  public async exportData(): Promise<any> {
    return {
      memory: await this.memoryEngine.exportData(),
      knowledge: await this.knowledgeEngine.exportData(),
      context: await this.contextManager.exportData(),
      diagnostics: this.diagnosticEngine.exportData(),
      timestamp: Date.now(),
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.memory) await this.memoryEngine.importData(data.memory)
    if (data.knowledge) await this.knowledgeEngine.importData(data.knowledge)
    if (data.context) await this.contextManager.importData(data.context)
    if (data.diagnostics) this.diagnosticEngine.importData(data.diagnostics)
  }

  public async clearAllData(): Promise<void> {
    await this.memoryEngine.clearData()
    await this.knowledgeEngine.clearData()
    await this.contextManager.clearData()
    this.diagnosticEngine.clearData()
  }
}
