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
import { SystemConfig } from "./config"

export interface SystemResponse {
  content: string
  confidence: number
  thinkingProcess?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
  memoryUpdates?: string[]
  diagnostics?: any
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
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

  constructor() {
    console.log("🚀 SystemManager initializing...")

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

    console.log("🔧 SystemManager: Starting full system initialization...")
    const startTime = performance.now()

    try {
      // Initialize in dependency order
      await this.storageManager.initialize()
      await this.knowledgeManager.initialize()
      await this.contextManager.initialize()

      // Initialize engines
      await this.languageEngine.initialize()
      await this.knowledgeEngine.initialize()
      await this.memoryEngine.initialize()
      await this.mathEngine.initialize()
      await this.thinkingEngine.initialize()
      await this.diagnosticEngine.initialize()

      // Initialize cognitive router
      await this.cognitiveRouter.initialize()

      this.isInitialized = true
      const duration = performance.now() - startTime

      console.log(`✅ SystemManager: Full initialization completed in ${duration.toFixed(2)}ms`)

      // Log system status
      this.logSystemStatus()
    } catch (error) {
      console.error("❌ SystemManager initialization failed:", error)
      throw error
    }
  }

  public async processMessage(userMessage: string): Promise<SystemResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log(`🤖 SystemManager: Processing message: "${userMessage}"`)
    const startTime = performance.now()

    try {
      // Update context with user message
      await this.contextManager.addMessage({
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      })

      // Route message through cognitive router
      const response = await this.cognitiveRouter.processMessage(userMessage)

      // Update context with AI response
      await this.contextManager.addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
      })

      // Learn from the interaction
      await this.knowledgeManager.learnFromMessage(userMessage, response.content)

      const duration = performance.now() - startTime
      console.log(`✅ SystemManager: Message processed in ${duration.toFixed(2)}ms`)

      return {
        ...response,
        diagnostics: {
          processingTime: duration,
          systemStatus: this.getSystemStatus(),
        },
      }
    } catch (error) {
      console.error("❌ SystemManager: Error processing message:", error)

      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.1,
        diagnostics: {
          error: error.message,
          systemStatus: this.getSystemStatus(),
        },
      }
    }
  }

  public async getConversationHistory(): Promise<ChatMessage[]> {
    return await this.contextManager.getConversationHistory()
  }

  public async exportData(): Promise<any> {
    return {
      knowledge: await this.knowledgeManager.exportKnowledge(),
      memory: await this.memoryEngine.exportMemory(),
      context: await this.contextManager.exportContext(),
      diagnostics: this.diagnosticEngine.getSystemStats(),
      exportDate: new Date().toISOString(),
      version: SystemConfig.VERSION,
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.knowledge) {
      await this.knowledgeManager.importKnowledge(data.knowledge)
    }
    if (data.memory) {
      await this.memoryEngine.importMemory(data.memory)
    }
    if (data.context) {
      await this.contextManager.importContext(data.context)
    }
    console.log("✅ SystemManager: Data import completed")
  }

  public async clearAllData(): Promise<void> {
    await this.knowledgeManager.clearAllKnowledge()
    await this.memoryEngine.clearMemory()
    await this.contextManager.clearContext()
    await this.storageManager.clearAllData()
    console.log("✅ SystemManager: All data cleared")
  }

  public getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      engines: {
        thinking: this.thinkingEngine.getStatus(),
        math: this.mathEngine.getStatus(),
        knowledge: this.knowledgeEngine.getStatus(),
        language: this.languageEngine.getStatus(),
        memory: this.memoryEngine.getStatus(),
        diagnostic: this.diagnosticEngine.getStatus(),
      },
      managers: {
        knowledge: this.knowledgeManager.getStats(),
        storage: this.storageManager.getStats(),
        context: this.contextManager.getStats(),
      },
      config: SystemConfig,
    }
  }

  private logSystemStatus(): void {
    const status = this.getSystemStatus()
    console.log("📊 System Status:", {
      version: SystemConfig.VERSION,
      engines: Object.keys(status.engines).length,
      managers: Object.keys(status.managers).length,
      memoryUsage: status.managers.storage,
      knowledgeBase: status.managers.knowledge,
    })
  }

  public async optimizeSystem(): Promise<void> {
    console.log("🔧 SystemManager: Starting system optimization...")

    await this.knowledgeManager.optimizeKnowledge()
    await this.memoryEngine.optimizeMemory()
    await this.contextManager.optimizeContext()
    await this.storageManager.optimize()

    console.log("✅ SystemManager: System optimization completed")
  }

  public async retrain(): Promise<void> {
    console.log("🔄 SystemManager: Starting system retraining...")

    // Reload seed data
    await this.knowledgeManager.loadSeedData()

    // Retrain engines
    await this.languageEngine.retrain()
    await this.thinkingEngine.retrain()

    console.log("✅ SystemManager: System retraining completed")
  }
}
