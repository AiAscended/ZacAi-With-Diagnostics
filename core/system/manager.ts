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
  private startTime = Date.now()

  async initialize(loader: OptimizedLoader): Promise<void> {
    try {
      console.log("🚀 Initializing ZacAI System Manager...")

      // Get loaded modules from loader
      const loadedModules = loader.getLoadedModules()
      for (const [name, instance] of loadedModules) {
        this.modules.set(name, instance)
      }

      this.state.criticalSystemsReady = true
      this.state.initialized = true

      console.log("✅ System Manager initialized successfully")
    } catch (error) {
      this.state.errors.push(`System initialization failed: ${error}`)
      console.error("❌ System Manager initialization failed:", error)
      throw error
    }
  }

  async processQuery(input: string): Promise<any> {
    const startTime = Date.now()

    if (!this.state.initialized) {
      return {
        response: "System is not ready. Please wait.",
        confidence: 0,
        sources: ["system"],
      }
    }

    try {
      // Get cognitive engine
      const engine = this.modules.get("cognitiveEngine")

      if (!engine) {
        return this.generateFallbackResponse(input)
      }

      // Process with cognitive engine
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
      }
    } catch (error) {
      console.error("Query processing error:", error)
      return this.generateFallbackResponse(input)
    }
  }

  private generateFallbackResponse(input: string): any {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: "👋 Hello! I'm ZacAI, your AI assistant. How can I help you today?",
        confidence: 0.9,
        sources: ["core"],
        reasoning: ["Simple greeting response"],
      }
    }

    if (lowerInput.includes("help")) {
      return {
        response: `🆘 **ZacAI Help**

Available Commands:
• **Math calculations** - "5 + 5" or "What is 15 * 8?"
• **General questions** - Ask me about anything
• **System status** - "Status" or "How are you?"

What would you like to try?`,
        confidence: 0.95,
        sources: ["core"],
        reasoning: ["Help command response"],
      }
    }

    // Simple math calculation
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

    return {
      response: `I received your message: "${input}"

I'm here to help! Try asking me to:
• Solve a math problem  
• Type "help" for more options

What else would you like to explore?`,
      confidence: 0.6,
      sources: ["core"],
      reasoning: ["Default fallback response"],
    }
  }

  getSystemStats(): any {
    return {
      initialized: this.state.initialized,
      modules: Object.fromEntries(this.modules),
      uptime: Date.now() - this.startTime,
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

  clearChatLog(): void {
    this.chatLog = []
  }

  isInitialized(): boolean {
    return this.state.initialized
  }

  getModule<T>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined
  }

  async exportData(): Promise<any> {
    return {
      chatLog: this.chatLog,
      systemStats: this.getSystemStats(),
      timestamp: new Date().toISOString(),
    }
  }
}

export const systemManager = new SystemManager()
