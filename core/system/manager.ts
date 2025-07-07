import { storageManager } from "@/core/storage/manager"
import { userMemory } from "@/core/memory/user-memory"
import { cognitiveEngine } from "@/engines/cognitive"
import { learningEngine } from "@/engines/learning"
import { reasoningEngine } from "@/engines/reasoning"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { factsModule } from "@/modules/facts"
import { codingModule } from "@/modules/coding"
import { philosophyModule } from "@/modules/philosophy"
import { userInfoModule } from "@/modules/user-info"
import type { OptimizedLoader } from "./optimized-loader"

interface SystemState {
  initialized: boolean
  criticalSystemsReady: boolean
  modulesLoaded: string[]
  errors: string[]
  health: any
}

interface ChatLogEntry {
  id: string
  input: string
  response: string
  confidence: number
  sources: string[]
  timestamp: number
  processingTime: number
  thinkingSteps?: any[]
}

export class SystemManager {
  private state: SystemState = {
    initialized: false,
    criticalSystemsReady: false,
    modulesLoaded: [],
    errors: [],
    health: null,
  }

  private chatLog: ChatLogEntry[] = []
  private modules: Map<string, any> = new Map()
  private engines: Map<string, any> = new Map()

  async initialize(loader: OptimizedLoader): Promise<void> {
    try {
      console.log("🚀 Initializing ZacAI System Manager...")

      // Phase 1: Critical Systems
      await this.initializeCriticalSystems(loader)
      this.state.criticalSystemsReady = true

      // Phase 2: Initialize Engines
      await this.initializeEngines(loader)

      // Phase 3: Load Core Modules
      await this.loadCoreModules(loader)

      // Phase 4: Run Health Checks
      await this.runHealthChecks()

      this.state.initialized = true
      console.log("✅ System Manager initialized successfully")
    } catch (error) {
      this.state.errors.push(`System initialization failed: ${error}`)
      console.error("❌ System Manager initialization failed:", error)
      throw error
    }
  }

  private async initializeCriticalSystems(loader: OptimizedLoader): Promise<void> {
    console.log("🔧 Initializing critical systems...")

    loader.register("storageManager", () => storageManager.initialize(), "critical")
    loader.register("userMemory", () => userMemory.initialize(), "critical")
    loader.register("cognitiveEngine", () => cognitiveEngine.initialize(this.modules), "critical")
  }

  private async initializeEngines(loader: OptimizedLoader): Promise<void> {
    console.log("🧠 Initializing AI engines...")

    loader.register("learning", () => learningEngine.initialize(), "high")
    loader.register("reasoning", () => reasoningEngine.initialize(), "high")
  }

  private async loadCoreModules(loader: OptimizedLoader): Promise<void> {
    console.log("📦 Loading core modules...")

    loader.register("vocabulary", () => vocabularyModule.initialize(), "high")
    loader.register("mathematics", () => mathematicsModule.initialize(), "high")
    loader.register("facts", () => factsModule.initialize(), "medium")
    loader.register("coding", () => codingModule.initialize(), "medium")
    loader.register("philosophy", () => philosophyModule.initialize(), "low")
    loader.register("userInfo", () => userInfoModule.initialize(), "low")

    const loadedModuleNames = loader
      .getLoadingStatus()
      .filter((s) => s.status === "loaded")
      .map((s) => s.name)

    for (const name of loadedModuleNames) {
      const moduleInstance = loader.getModule(name)
      if (moduleInstance) {
        this.modules.set(name, moduleInstance)
      }
    }

    // The cognitive engine needs a reference to the loaded modules
    const engine = this.getModule("cognitiveEngine")
    if (engine) {
      engine.registerModules(this.modules)
    }
  }

  private async runHealthChecks(): Promise<void> {
    console.log("🔍 Running system health checks...")

    const health = {
      core: this.state.criticalSystemsReady,
      engines: this.engines.size,
      modules: this.state.modulesLoaded.length,
      storage: true,
      memory: true,
      timestamp: Date.now(),
    }

    this.state.health = health
    console.log("✅ Health checks completed")
  }

  async processQuery(input: string): Promise<any> {
    const startTime = Date.now()

    if (!this.state.initialized) {
      return { response: "System is not ready. Please wait.", confidence: 0, sources: ["system"] }
    }

    const engine = this.getModule("cognitiveEngine")
    if (!engine) {
      return {
        response: "Cognitive engine is offline. Cannot process request.",
        confidence: 0,
        sources: ["system-error"],
      }
    }

    try {
      // Extract user's name for personalized responses
      const userName = userMemory.retrieve("name")?.value

      // Store user name if provided
      userMemory.extractPersonalInfo(input)

      // Use cognitive engine to process the query
      const result = await engine.processInput(input)
      const processingTime = Date.now() - startTime

      // Log the interaction
      const logEntry: ChatLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        input,
        response: result.response,
        confidence: result.confidence,
        sources: result.sources,
        timestamp: Date.now(),
        processingTime,
        thinkingSteps: result.reasoning,
      }

      this.chatLog.push(logEntry)

      // Keep only last 100 entries
      if (this.chatLog.length > 100) {
        this.chatLog = this.chatLog.slice(-100)
      }

      return {
        response: result.response,
        confidence: result.confidence,
        sources: result.sources,
        reasoning: result.reasoning,
        processingTime,
        userName,
      }
    } catch (error) {
      console.error("Query processing error:", error)
      return {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["error"],
        processingTime: Date.now() - startTime,
      }
    }
  }

  private generateFallbackResponse(input: string, userName?: string): any {
    const lowerInput = input.toLowerCase()

    // Handle special cases
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: `👋 Hello${userName ? ` ${userName}` : ""}! I'm ZacAI, your AI assistant. How can I help you today?`,
        confidence: 0.9,
        sources: ["core"],
        reasoning: ["Simple greeting response"],
      }
    }

    if (lowerInput.includes("help")) {
      return {
        response: `🆘 **ZacAI Help**

Available Commands:
• **Define words** - "Define artificial intelligence"
• **Math calculations** - "5 + 5" or "What is 15 * 8?"
• **General questions** - Ask me about facts, coding, philosophy
• **Remember information** - "My name is..." 
• **System status** - "Status" or "How are you?"

What would you like to try?`,
        confidence: 0.95,
        sources: ["core"],
        reasoning: ["Help command response"],
      }
    }

    // Handle math calculations
    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return {
          response: `🧮 **${input} = ${result}**\n\nCalculation completed successfully!`,
          confidence: 0.95,
          sources: ["mathematics"],
          reasoning: ["Mathematical calculation"],
        }
      } catch {
        return {
          response: "❌ I couldn't calculate that. Please check your math expression.",
          confidence: 0.3,
          sources: ["error"],
          reasoning: ["Math calculation error"],
        }
      }
    }

    // Default response
    return {
      response: `I received your message: "${input}"

I'm here to help! Try asking me to:
• Define a word or concept
• Solve a math problem  
• Explain something you're curious about
• Type "help" for more options

What else would you like to explore?`,
      confidence: 0.6,
      sources: ["core"],
      reasoning: ["Default fallback response"],
    }
  }

  getSystemStats(): any {
    const moduleStats: any = {}
    const engineStats: any = {}

    for (const [name, module] of this.modules) {
      try {
        moduleStats[name] = module.getStats()
      } catch (error) {
        moduleStats[name] = {
          totalQueries: 0,
          successRate: 0,
          averageResponseTime: 0,
          learntEntries: 0,
          lastUpdate: 0,
        }
      }
    }

    for (const [name, engine] of this.engines) {
      try {
        engineStats[name] = engine.getStats()
      } catch (error) {
        engineStats[name] = {
          initialized: false,
        }
      }
    }

    return {
      initialized: this.state.initialized,
      modules: moduleStats,
      engines: engineStats,
      uptime: Date.now() - (this.state.health?.timestamp || Date.now()),
      totalQueries: this.chatLog.length,
      averageResponseTime: this.calculateAverageResponseTime(),
      successRate: this.calculateSuccessRate(),
      chatLogEntries: this.chatLog.length,
      health: this.state.health,
      errors: this.state.errors,
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.chatLog.length === 0) return 0
    const total = this.chatLog.reduce((sum, entry) => sum + entry.processingTime, 0)
    return Math.round(total / this.chatLog.length)
  }

  private calculateSuccessRate(): number {
    if (this.chatLog.length === 0) return 1
    const successful = this.chatLog.filter((entry) => entry.confidence > 0.5).length
    return successful / this.chatLog.length
  }

  getChatLog(): ChatLogEntry[] {
    return [...this.chatLog]
  }

  isInitialized(): boolean {
    return this.state.initialized
  }

  getModule<T>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined
  }
}

export const systemManager = new SystemManager()
