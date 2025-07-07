export type ModulePriority = "critical" | "high" | "medium" | "low"
export type ModuleStatus = "pending" | "loading" | "loaded" | "failed" | "bypassed"

export interface ModuleDefinition {
  name: string
  loader: () => Promise<any>
  priority: ModulePriority
  essential: boolean
  dependencies?: string[]
  timeout?: number
}

export interface ModuleLoadResult {
  name: string
  status: ModuleStatus
  priority: ModulePriority
  essential: boolean
  loadTime?: number
  error?: string
  timestamp: number
}

export interface LoaderProgress {
  current: number
  total: number
  stage: string
  percentage: number
}

export class OptimizedLoader {
  private modules: Map<string, ModuleDefinition> = new Map()
  private loadResults: Map<string, ModuleLoadResult> = new Map()
  private loadedInstances: Map<string, any> = new Map()
  private isLoading = false
  private startTime = 0

  constructor() {
    // Register minimal core modules only
    this.registerCoreModules()
  }

  private registerCoreModules() {
    // Only register the absolute essentials
    this.register("storageManager", () => this.loadStorageManager(), "critical", true)
    this.register("userMemory", () => this.loadUserMemory(), "critical", true)
    this.register("cognitiveEngine", () => this.loadCognitiveEngine(), "high", false)
  }

  register(
    name: string,
    loader: () => Promise<any>,
    priority: ModulePriority,
    essential = false,
    dependencies: string[] = [],
    timeout = 5000,
  ) {
    this.modules.set(name, {
      name,
      loader,
      priority,
      essential,
      dependencies,
      timeout,
    })

    this.loadResults.set(name, {
      name,
      status: "pending",
      priority,
      essential,
      timestamp: Date.now(),
    })
  }

  async load(progressCallback?: (progress: number, stage: string) => void): Promise<void> {
    if (this.isLoading) {
      throw new Error("Loader is already running")
    }

    this.isLoading = true
    this.startTime = Date.now()

    try {
      const moduleArray = Array.from(this.modules.values())
      const sortedModules = this.sortModulesByPriority(moduleArray)

      let completed = 0
      const total = sortedModules.length

      for (const module of sortedModules) {
        const progress = Math.round((completed / total) * 100)
        const stage = `Loading ${module.name}...`

        progressCallback?.(progress, stage)

        await this.loadModule(module)
        completed++

        // Add small delay for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      progressCallback?.(100, "System ready!")
    } finally {
      this.isLoading = false
    }
  }

  private sortModulesByPriority(modules: ModuleDefinition[]): ModuleDefinition[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

    return modules.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      if (a.essential && !b.essential) return -1
      if (!a.essential && b.essential) return 1

      return a.name.localeCompare(b.name)
    })
  }

  private async loadModule(module: ModuleDefinition): Promise<void> {
    const result = this.loadResults.get(module.name)!

    try {
      result.status = "loading"
      const loadStart = Date.now()

      const instance = await Promise.race([
        module.loader(),
        this.createTimeout(module.timeout || 5000, `${module.name} load timeout`),
      ])

      const loadTime = Date.now() - loadStart

      this.loadedInstances.set(module.name, instance)

      result.status = "loaded"
      result.loadTime = loadTime
      result.timestamp = Date.now()

      console.log(`✅ ${module.name} loaded successfully (${loadTime}ms)`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      result.status = "failed"
      result.error = errorMessage
      result.timestamp = Date.now()

      console.error(`❌ ${module.name} failed to load:`, errorMessage)

      if (module.essential) {
        throw new Error(`Critical module ${module.name} failed: ${errorMessage}`)
      } else {
        result.status = "bypassed"
        console.warn(`⚠️ Non-essential module ${module.name} bypassed`)
      }
    }
  }

  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    })
  }

  // Simple fallback implementations
  private async loadStorageManager(): Promise<any> {
    return {
      initialize: async () => {},
      get: (key: string) => {
        try {
          return JSON.parse(localStorage.getItem(key) || "null")
        } catch {
          return null
        }
      },
      set: (key: string, value: any) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          console.warn("Storage not available")
        }
      },
      has: (key: string) => localStorage.getItem(key) !== null,
    }
  }

  private async loadUserMemory(): Promise<any> {
    return {
      initialize: async () => {},
      store: (key: string, value: any) => {
        try {
          localStorage.setItem(`zacai_memory_${key}`, JSON.stringify(value))
        } catch {
          console.warn("Memory storage not available")
        }
      },
      retrieve: (key: string) => {
        try {
          const item = localStorage.getItem(`zacai_memory_${key}`)
          return item ? JSON.parse(item) : null
        } catch {
          return null
        }
      },
      extractPersonalInfo: (input: string) => {
        // Simple name extraction
        const nameMatch = input.match(/my name is (\w+)/i)
        if (nameMatch) {
          try {
            localStorage.setItem("zacai_memory_name", JSON.stringify({ value: nameMatch[1] }))
          } catch {}
        }
      },
    }
  }

  private async loadCognitiveEngine(): Promise<any> {
    return {
      initialize: async () => {},
      processInput: async (input: string) => {
        // Simple processing logic
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

        // Default response
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
      },
      registerModules: () => {},
    }
  }

  // Public API methods
  getLoadingStatus(): ModuleLoadResult[] {
    return Array.from(this.loadResults.values())
  }

  getModule<T = any>(name: string): T | undefined {
    return this.loadedInstances.get(name) as T
  }

  getLoadedModules(): Map<string, any> {
    return new Map(this.loadedInstances)
  }

  isModuleLoaded(name: string): boolean {
    const result = this.loadResults.get(name)
    return result?.status === "loaded"
  }

  getFailedModules(): ModuleLoadResult[] {
    return Array.from(this.loadResults.values()).filter(
      (result) => result.status === "failed" || result.status === "bypassed",
    )
  }

  getCriticalFailures(): ModuleLoadResult[] {
    return this.getFailedModules().filter((result) => result.essential)
  }

  getLoadingSummary() {
    const results = Array.from(this.loadResults.values())
    const totalTime = Date.now() - this.startTime

    return {
      total: results.length,
      loaded: results.filter((r) => r.status === "loaded").length,
      failed: results.filter((r) => r.status === "failed").length,
      bypassed: results.filter((r) => r.status === "bypassed").length,
      totalLoadTime: totalTime,
      averageLoadTime:
        results.filter((r) => r.loadTime).reduce((sum, r) => sum + (r.loadTime || 0), 0) /
          results.filter((r) => r.loadTime).length || 0,
    }
  }
}
