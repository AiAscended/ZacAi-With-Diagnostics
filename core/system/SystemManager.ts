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

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
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
  private responses = [
    "That's really interesting! Tell me more about that.",
    "I understand what you're saying. How does that make you feel?",
    "That's a great point. I'm learning from our conversation.",
    "I see what you mean. Can you give me an example?",
    "That reminds me of something we discussed earlier.",
    "I'm still learning about this topic. What's your experience with it?",
    "That's worth thinking about. What led you to that conclusion?",
    "I appreciate you sharing that with me. It helps me learn.",
    "That's an interesting perspective. I hadn't considered that before.",
    "Thanks for teaching me about this. I'm getting smarter with each conversation!",
  ]

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

    console.log("🚀 SystemManager: Initializing...")
    this.loadFromStorage()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔧 SystemManager: Starting initialization...")

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
      console.log("✅ SystemManager: Initialization completed")
    } catch (error) {
      console.error("❌ SystemManager: Initialization failed:", error)
      throw error
    }
  }

  public async processMessage(userMessage: string): Promise<SystemResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log(`🤖 SystemManager: Processing message: "${userMessage}"`)

    // Get conversation context
    const context = await this.contextManager.getContext()

    // Route through cognitive router
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

    // Add assistant message to history
    const assistantMsg: ChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: response.content,
      timestamp: Date.now(),
      confidence: response.confidence,
    }
    this.conversationHistory.push(assistantMsg)

    // Save to storage
    this.saveToStorage()

    return {
      content: response.content,
      confidence: response.confidence,
      reasoning: response.reasoning,
      pathways: response.pathways,
      synthesis: response.synthesis,
      mathAnalysis: response.mathAnalysis,
      thinkingProcess: [
        `Processed message: "${userMessage}"`,
        "Generated contextual response",
        "Updated conversation history",
      ],
      knowledgeUsed: response.knowledgeUsed,
    }
  }

  private generateResponse(input: string): string {
    const lowerInput = input.toLowerCase()

    // Simple pattern matching (will be enhanced with engines)
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! It's great to chat with you. I'm learning from every conversation we have!"
    }
    if (lowerInput.includes("how are you")) {
      return "I'm doing well, thank you! I'm constantly learning and improving. How are you doing today?"
    }
    if (lowerInput.includes("what can you do")) {
      return "I can have conversations with you and learn from them! Each time we chat, I get a little smarter. I remember our conversations and try to give better responses over time."
    }
    if (lowerInput.includes("remember") || lowerInput.includes("recall")) {
      const recentTopics = this.knowledgeBase.slice(-5).join(", ")
      return `I remember we've talked about: ${recentTopics}. My memory helps me have better conversations with you!`
    }

    // Use knowledge base to make responses more contextual
    const hasContext = this.knowledgeBase.some((item) =>
      item.split(" ").some((word) => lowerInput.includes(word) && word.length > 3),
    )

    if (hasContext) {
      return (
        "I remember we've discussed something similar before! " +
        this.responses[Math.floor(Math.random() * this.responses.length)]
      )
    }

    // Random response
    return this.responses[Math.floor(Math.random() * this.responses.length)]
  }

  public async getConversationHistory(): Promise<ChatMessage[]> {
    return [...this.conversationHistory]
  }

  public getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      engines: {
        thinking: this.isInitialized,
        math: false, // Will be true when MathEngine is integrated
        knowledge: false, // Will be true when KnowledgeEngine is integrated
        language: false, // Will be true when LanguageEngine is integrated
        memory: false, // Will be true when MemoryEngine is integrated
        diagnostic: false, // Will be true when DiagnosticEngine is integrated
      },
      managers: {
        knowledge: {
          vocabulary: this.knowledgeBase.length,
          totalEntries: this.knowledgeBase.length,
        },
        memory: {
          totalMemories: this.conversationHistory.filter((m) => m.role === "user").length,
        },
      },
      config: this.config,
    }
  }

  public async exportData(): Promise<any> {
    return {
      conversations: this.conversationHistory,
      knowledge: this.knowledgeBase,
      timestamp: Date.now(),
      version: "2.0.0",
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.conversations) {
      this.conversationHistory = data.conversations
    }
    if (data.knowledge) {
      this.knowledgeBase = data.knowledge
    }
    this.saveToStorage()
    console.log("✅ SystemManager: Data import completed")
  }

  public async clearAllData(): Promise<void> {
    this.conversationHistory = []
    this.knowledgeBase = []
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
    // Basic retraining - will be enhanced with engines
    console.log("🔄 SystemManager: Retraining...")
    await this.optimizeSystem()
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
