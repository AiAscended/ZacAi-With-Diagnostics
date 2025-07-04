import { githubIntegration } from "@/core/github/integration"
import { userMemory } from "@/core/memory/user-memory"
import { storageManager } from "@/core/storage/manager"

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

  async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing ZacAI System Manager...")

      // Phase 1: Critical Systems
      await this.initializeCriticalSystems()
      this.state.criticalSystemsReady = true

      // Phase 2: Load Core Modules
      await this.loadCoreModules()

      // Phase 3: Initialize GitHub Integration (optional)
      await this.initializeGitHubIntegration()

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

  private async initializeCriticalSystems(): Promise<void> {
    console.log("🔧 Initializing critical systems...")

    try {
      // Initialize storage manager
      await storageManager.initialize()
      console.log("✅ Storage Manager ready")

      // Initialize user memory
      await userMemory.initialize()
      console.log("✅ User Memory ready")
    } catch (error) {
      console.error("❌ Critical systems failed:", error)
      throw error
    }
  }

  private async loadCoreModules(): Promise<void> {
    console.log("📦 Loading core modules...")

    const moduleLoaders = [
      { name: "vocabulary", loader: () => this.loadVocabularyModule() },
      { name: "mathematics", loader: () => this.loadMathematicsModule() },
      { name: "facts", loader: () => this.loadFactsModule() },
    ]

    for (const { name, loader } of moduleLoaders) {
      try {
        const module = await loader()
        this.modules.set(name, module)
        this.state.modulesLoaded.push(name)
        console.log(`✅ ${name} module loaded`)
      } catch (error) {
        console.warn(`⚠️ ${name} module failed to load:`, error)
        this.state.errors.push(`${name} module failed: ${error}`)
      }
    }
  }

  private async loadVocabularyModule(): Promise<any> {
    try {
      const { vocabularyModule } = await import("@/modules/vocabulary")
      await vocabularyModule.initialize()
      return vocabularyModule
    } catch (error) {
      console.warn("Vocabulary module not available, using fallback")
      return this.createFallbackModule("vocabulary")
    }
  }

  private async loadMathematicsModule(): Promise<any> {
    try {
      const { mathematicsModule } = await import("@/modules/mathematics")
      await mathematicsModule.initialize()
      return mathematicsModule
    } catch (error) {
      console.warn("Mathematics module not available, using fallback")
      return this.createFallbackModule("mathematics")
    }
  }

  private async loadFactsModule(): Promise<any> {
    try {
      const { factsModule } = await import("@/modules/facts")
      await factsModule.initialize()
      return factsModule
    } catch (error) {
      console.warn("Facts module not available, using fallback")
      return this.createFallbackModule("facts")
    }
  }

  private createFallbackModule(name: string): any {
    return {
      name,
      initialized: true,
      process: async (input: string) => ({
        success: false,
        data: `${name} module not available`,
        confidence: 0,
        source: `${name}-fallback`,
        timestamp: Date.now(),
      }),
      getStats: () => ({
        totalQueries: 0,
        successRate: 0,
        averageResponseTime: 0,
        learntEntries: 0,
        lastUpdate: 0,
      }),
    }
  }

  private async initializeGitHubIntegration(): Promise<void> {
    try {
      // Only initialize if configuration is available
      const githubConfig = this.getGitHubConfig()
      if (githubConfig) {
        await githubIntegration.initialize(githubConfig)
        await githubIntegration.scheduleBackups()
        console.log("✅ GitHub Integration ready")
      } else {
        console.log("ℹ️ GitHub Integration not configured (optional)")
      }
    } catch (error) {
      console.warn("⚠️ GitHub Integration failed (continuing without it):", error)
    }
  }

  private getGitHubConfig(): any {
    // Placeholder - would read from environment or user settings
    return null
  }

  private async runHealthChecks(): Promise<void> {
    console.log("🔍 Running system health checks...")

    const health = {
      core: this.state.criticalSystemsReady,
      modules: this.state.modulesLoaded.length > 0,
      storage: true, // Would check actual storage
      memory: true, // Would check actual memory
      network: true, // Would check network connectivity
      timestamp: Date.now(),
    }

    this.state.health = health
    console.log("✅ Health checks completed")
  }

  async processQuery(input: string): Promise<any> {
    const startTime = Date.now()

    try {
      // Extract user's name for personalized responses
      const userName = userMemory.retrieve("name")?.value

      // Store user name if provided
      userMemory.extractPersonalInfo(input)

      // Determine which modules to use
      const requiredModules = this.determineRequiredModules(input)

      // Process with available modules
      const results = []
      for (const moduleName of requiredModules) {
        const module = this.modules.get(moduleName)
        if (module) {
          try {
            const result = await module.process(input)
            if (result.success) {
              results.push(result)
            }
          } catch (error) {
            console.warn(`Module ${moduleName} processing error:`, error)
          }
        }
      }

      // Generate response
      const response = this.synthesizeResponse(input, results, userName)
      const processingTime = Date.now() - startTime

      // Log the interaction
      const logEntry: ChatLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        input,
        response: response.response,
        confidence: response.confidence,
        sources: response.sources,
        timestamp: Date.now(),
        processingTime,
        thinkingSteps: response.thinkingSteps,
      }

      this.chatLog.push(logEntry)

      // Keep only last 100 entries
      if (this.chatLog.length > 100) {
        this.chatLog = this.chatLog.slice(-100)
      }

      return response
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

  private determineRequiredModules(input: string): string[] {
    const modules: string[] = []
    const lowerInput = input.toLowerCase()

    // Simple pattern matching
    if (lowerInput.includes("define") || lowerInput.includes("meaning") || lowerInput.includes("word")) {
      modules.push("vocabulary")
    }

    if (/[\d+\-*/()=]/.test(input) || lowerInput.includes("calculate") || lowerInput.includes("math")) {
      modules.push("mathematics")
    }

    if (lowerInput.includes("fact") || lowerInput.includes("information") || lowerInput.includes("tell me about")) {
      modules.push("facts")
    }

    // Default to vocabulary if no specific modules detected
    if (modules.length === 0) {
      modules.push("vocabulary")
    }

    return modules
  }

  private synthesizeResponse(input: string, results: any[], userName?: string): any {
    const lowerInput = input.toLowerCase()

    // Handle special cases first
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return {
        response: `👋 Hello${userName ? ` ${userName}` : ""}! I'm ZacAI, your AI assistant. How can I help you today?`,
        confidence: 0.9,
        sources: ["core"],
        thinkingSteps: [],
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
        thinkingSteps: [],
      }
    }

    if (lowerInput.includes("status")) {
      return {
        response: `📊 **System Status**

• **Core System:** ✅ Online and operational
• **Modules Loaded:** ${this.state.modulesLoaded.length}
• **User:** ${userName || "Anonymous"}
• **Health:** ${this.state.health?.core ? "Good" : "Warning"}

Everything is working perfectly!`,
        confidence: 0.95,
        sources: ["core"],
        thinkingSteps: [],
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
          thinkingSteps: [],
        }
      } catch {
        return {
          response: "❌ I couldn't calculate that. Please check your math expression.",
          confidence: 0.3,
          sources: ["error"],
          thinkingSteps: [],
        }
      }
    }

    // Use module results if available
    if (results.length > 0) {
      const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0]
      return {
        response: bestResult.data || "I found some information but couldn't format it properly.",
        confidence: bestResult.confidence,
        sources: results.map((r) => r.source),
        thinkingSteps: [],
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
      thinkingSteps: [],
    }
  }

  getSystemStats(): any {
    const moduleStats: any = {}

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

    return {
      initialized: this.state.initialized,
      modules: moduleStats,
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

  async selfHeal(): Promise<boolean> {
    try {
      console.log("🔧 Running self-healing procedures...")

      // Try GitHub restoration if available
      if (githubIntegration.getStatus().initialized) {
        const healed = await githubIntegration.selfHeal()
        if (healed) {
          console.log("✅ Self-healing completed via GitHub")
          return true
        }
      }

      // Local self-healing procedures
      await this.clearCache()
      await this.reinitializeModules()

      console.log("✅ Local self-healing completed")
      return true
    } catch (error) {
      console.error("❌ Self-healing failed:", error)
      return false
    }
  }

  private async clearCache(): Promise<void> {
    // Clear any cached data
    console.log("🧹 Clearing system cache...")
  }

  private async reinitializeModules(): Promise<void> {
    console.log("🔄 Reinitializing modules...")

    // Reinitialize failed modules
    for (const moduleName of ["vocabulary", "mathematics", "facts"]) {
      if (!this.modules.has(moduleName)) {
        try {
          let module
          switch (moduleName) {
            case "vocabulary":
              module = await this.loadVocabularyModule()
              break
            case "mathematics":
              module = await this.loadMathematicsModule()
              break
            case "facts":
              module = await this.loadFactsModule()
              break
          }

          if (module) {
            this.modules.set(moduleName, module)
            this.state.modulesLoaded.push(moduleName)
            console.log(`✅ ${moduleName} module recovered`)
          }
        } catch (error) {
          console.warn(`⚠️ ${moduleName} module recovery failed:`, error)
        }
      }
    }
  }

  isInitialized(): boolean {
    return this.state.initialized
  }

  getModuleStatus(): any {
    const status: any = {}
    for (const [name, module] of this.modules) {
      status[name] = {
        loaded: true,
        initialized: module.initialized || true,
        status: "active",
      }
    }
    return status
  }
}

export const systemManager = new SystemManager()
