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
import { defaultConfig, type SystemConfig } from "./config"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  thinkingProcess?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
}

export interface SystemResponse {
  content: string
  confidence: number
  reasoning?: string[]
  pathways?: string[]
  synthesis?: any
  mathAnalysis?: any
  thinkingProcess?: string[]
  knowledgeUsed?: string[]
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
  private conversationHistory: ChatMessage[] = []
  private knowledgeBase: string[] = []
  private isInitialized = false
  private config: SystemConfig

  constructor(config: SystemConfig = defaultConfig) {
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

    console.log("🚀 SystemManager: Initializing with ThinkingEngine...")
    this.loadFromStorage()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔧 SystemManager: Starting full initialization...")

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
      console.log("✅ SystemManager: Full initialization completed with ThinkingEngine")
    } catch (error) {
      console.error("❌ SystemManager: Initialization failed:", error)
      throw error
    }
  }

  public async processMessage(userMessage: string): Promise<ChatMessage> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log(`🤖 SystemManager: Processing with ThinkingEngine: "${userMessage}"`)

    try {
      // Get conversation context
      const context = await this.contextManager.getContext()

      // Route through cognitive router (which uses ThinkingEngine)
      const response = await this.cognitiveRouter.route(userMessage, context)

      // Add user message to history
      const userMsg: ChatMessage = {
        id: this.generateId(),
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      }
      this.conversationHistory.push(userMsg)

      // Add to knowledge base
      this.knowledgeBase.push(userMessage.toLowerCase())

      // Store memory
      await this.memoryEngine.storeMemory({
        type: "conversation",
        userMessage,
        response: response.content,
      })

      // Add assistant message to history with enhanced data
      const assistantMsg: ChatMessage = {
        id: this.generateId(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        thinkingProcess: response.thinkingProcess,
        mathAnalysis: response.mathAnalysis,
        knowledgeUsed: response.knowledgeUsed,
      }
      this.conversationHistory.push(assistantMsg)

      // Update context with new interaction
      await this.contextManager.updateContext(userMessage, response)

      // Log diagnostics
      this.diagnosticEngine.logInteraction(userMessage, response)

      // Save to storage
      this.saveToStorage()

      console.log(`✅ SystemManager: Message processed with confidence: ${Math.round(response.confidence * 100)}%`)

      return assistantMsg
    } catch (error) {
      console.error("❌ SystemManager: Error processing message:", error)

      const errorMsg: ChatMessage = {
        id: this.generateId(),
        role: "assistant",
        content: "I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.1,
        thinkingProcess: [`Error: ${error}`],
      }

      return errorMsg
    }
  }

  public async getConversationHistory(): Promise<ChatMessage[]> {
    return [...this.conversationHistory]
  }

  public getSystemStatus(): any {
    const thinkingStats = this.isInitialized ? this.thinkingEngine.getThoughtStream().length : 0

    return {
      initialized: this.isInitialized,
      engines: {
        thinking: this.isInitialized,
        math: this.isInitialized,
        knowledge: this.isInitialized,
        language: this.isInitialized,
        memory: this.isInitialized,
        diagnostic: this.isInitialized,
      },
      managers: {
        knowledge: {
          vocabulary: this.knowledgeBase.length,
          totalEntries: this.knowledgeBase.length,
        },
        memory: {
          totalMemories: this.conversationHistory.filter((m) => m.role === "user").length,
        },
        thinking: {
          totalThoughts: thinkingStats,
        },
      },
      config: this.config,
    }
  }

  public async exportData(): Promise<any> {
    return {
      conversations: this.conversationHistory,
      knowledge: this.knowledgeBase,
      memory: await this.memoryEngine.exportData(),
      context: await this.contextManager.exportData(),
      diagnostics: this.diagnosticEngine.exportData(),
      timestamp: Date.now(),
      version: this.config.version,
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.conversations) {
      this.conversationHistory = data.conversations
    }
    if (data.knowledge) {
      this.knowledgeBase = data.knowledge
    }
    if (data.memory) {
      await this.memoryEngine.importData(data.memory)
    }
    if (data.context) {
      await this.contextManager.importData(data.context)
    }
    if (data.diagnostics) {
      this.diagnosticEngine.importData(data.diagnostics)
    }
    this.saveToStorage()
    console.log("✅ SystemManager: Data import completed")
  }

  public async clearAllData(): Promise<void> {
    this.conversationHistory = []
    this.knowledgeBase = []
    await this.memoryEngine.clearData()
    await this.contextManager.clearData()
    this.diagnosticEngine.clearData()
    this.clearStorage()
    console.log("✅ SystemManager: All data cleared")
  }

  public async optimizeSystem(): Promise<void> {
    // Keep only recent history to optimize performance
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }
    if (this.knowledgeBase.length > 200) {
      this.knowledgeBase = this.knowledgeBase.slice(-150)
    }
    this.saveToStorage()
    console.log("✅ SystemManager: System optimization completed")
  }

  public async retrain(): Promise<void> {
    console.log("🔄 SystemManager: Retraining with ThinkingEngine...")
    await this.optimizeSystem()

    // Re-initialize thinking engine
    await this.thinkingEngine.initialize()

    console.log("✅ SystemManager: Retraining completed")
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveToStorage(): void {
    try {
      // Only save recent history to avoid storage issues
      const recentHistory = this.conversationHistory.slice(-20)
      const recentKnowledge = this.knowledgeBase.slice(-50)

      localStorage.setItem(
        "zacai-system-data",
        JSON.stringify({
          history: recentHistory,
          knowledge: recentKnowledge,
          version: this.config.version,
        }),
      )
    } catch (error) {
      console.warn("Could not save to storage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("zacai-system-data")
      if (stored) {
        const data = JSON.parse(stored)
        this.conversationHistory = data.history || []
        this.knowledgeBase = data.knowledge || []
      }
    } catch (error) {
      console.warn("Could not load from storage:", error)
      this.conversationHistory = []
      this.knowledgeBase = []
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem("zacai-system-data")
    } catch (error) {
      console.warn("Could not clear storage:", error)
    }
  }
}
