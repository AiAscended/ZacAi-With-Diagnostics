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
    this.registerCoreModules()
  }

  private registerCoreModules() {
    // Critical system modules - must load first
    this.register("healthMonitor", () => this.loadHealthMonitor(), "critical", true)
    this.register("storageManager", () => this.loadStorageManager(), "critical", true)
    this.register("userMemory", () => this.loadUserMemory(), "critical", true)

    // High priority engines
    this.register("cognitiveEngine", () => this.loadCognitiveEngine(), "high", true)
    this.register("reasoningEngine", () => this.loadReasoningEngine(), "high", false)
    this.register("learningEngine", () => this.loadLearningEngine(), "high", false)

    // Medium priority modules
    this.register("vocabularyModule", () => this.loadVocabularyModule(), "medium", false)
    this.register("mathematicsModule", () => this.loadMathematicsModule(), "medium", false)
    this.register("factsModule", () => this.loadFactsModule(), "medium", false)

    // Low priority modules
    this.register("codingModule", () => this.loadCodingModule(), "low", false)
    this.register("philosophyModule", () => this.loadPhilosophyModule(), "low", false)
    this.register("userInfoModule", () => this.loadUserInfoModule(), "low", false)
  }

  register(
    name: string,
    loader: () => Promise<any>,
    priority: ModulePriority,
    essential = false,
    dependencies: string[] = [],
    timeout = 10000,
  ) {
    this.modules.set(name, {
      name,
      loader,
      priority,
      essential,
      dependencies,
      timeout,
    })

    // Initialize result entry
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

      // Within same priority, essential modules first
      if (a.essential && !b.essential) return -1
      if (!a.essential && b.essential) return 1

      return a.name.localeCompare(b.name)
    })
  }

  private async loadModule(module: ModuleDefinition): Promise<void> {
    const result = this.loadResults.get(module.name)!

    try {
      // Check dependencies
      if (module.dependencies) {
        for (const dep of module.dependencies) {
          const depResult = this.loadResults.get(dep)
          if (!depResult || depResult.status !== "loaded") {
            throw new Error(`Dependency ${dep} not loaded`)
          }
        }
      }

      result.status = "loading"
      const loadStart = Date.now()

      // Load with timeout
      const instance = await Promise.race([
        module.loader(),
        this.createTimeout(module.timeout || 10000, `${module.name} load timeout`),
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
        // Non-essential module failed, mark as bypassed and continue
        result.status = "bypassed"
        console.warn(`⚠️ Non-essential module ${module.name} bypassed due to error`)
      }
    }
  }

  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    })
  }

  // Module loader implementations
  private async loadHealthMonitor(): Promise<any> {
    try {
      const { HealthMonitor } = await import("@/core/system/health-monitor")
      const instance = new HealthMonitor()
      await instance.initialize()
      return instance
    } catch (error) {
      // Fallback health monitor
      return {
        initialize: async () => {},
        getHealth: () => ({ status: "unknown", checks: [] }),
        isHealthy: () => true,
      }
    }
  }

  private async loadStorageManager(): Promise<any> {
    try {
      const { storageManager } = await import("@/core/storage/manager")
      await storageManager.initialize()
      return storageManager
    } catch (error) {
      // Fallback storage manager
      return {
        initialize: async () => {},
        get: () => null,
        set: () => {},
        has: () => false,
      }
    }
  }

  private async loadUserMemory(): Promise<any> {
    try {
      const { userMemory } = await import("@/core/memory/user-memory")
      await userMemory.initialize()
      return userMemory
    } catch (error) {
      // Fallback user memory
      return {
        initialize: async () => {},
        store: () => {},
        retrieve: () => null,
        extractPersonalInfo: () => {},
      }
    }
  }

  private async loadCognitiveEngine(): Promise<any> {
    try {
      const { cognitiveEngine } = await import("@/engines/cognitive")
      await cognitiveEngine.initialize()
      return cognitiveEngine
    } catch (error) {
      // Fallback cognitive engine
      return {
        initialize: async () => {},
        processInput: async (input: string) => ({
          response: `I received: "${input}". Some modules are still loading.`,
          confidence: 0.5,
          sources: ["fallback"],
          reasoning: ["Using fallback response"],
        }),
        registerModule: () => {},
      }
    }
  }

  private async loadReasoningEngine(): Promise<any> {
    try {
      const { reasoningEngine } = await import("@/engines/reasoning")
      await reasoningEngine.initialize()
      return reasoningEngine
    } catch (error) {
      return this.createFallbackModule("reasoning")
    }
  }

  private async loadLearningEngine(): Promise<any> {
    try {
      const { learningEngine } = await import("@/engines/learning")
      await learningEngine.initialize()
      return learningEngine
    } catch (error) {
      return this.createFallbackModule("learning")
    }
  }

  private async loadVocabularyModule(): Promise<any> {
    try {
      const { vocabularyModule } = await import("@/modules/vocabulary")
      await vocabularyModule.initialize()
      return vocabularyModule
    } catch (error) {
      return this.createFallbackModule("vocabulary")
    }
  }

  private async loadMathematicsModule(): Promise<any> {
    try {
      const { mathematicsModule } = await import("@/modules/mathematics")
      await mathematicsModule.initialize()
      return mathematicsModule
    } catch (error) {
      return this.createFallbackModule("mathematics")
    }
  }

  private async loadFactsModule(): Promise<any> {
    try {
      const { factsModule } = await import("@/modules/facts")
      await factsModule.initialize()
      return factsModule
    } catch (error) {
      return this.createFallbackModule("facts")
    }
  }

  private async loadCodingModule(): Promise<any> {
    try {
      const { codingModule } = await import("@/modules/coding")
      await codingModule.initialize()
      return codingModule
    } catch (error) {
      return this.createFallbackModule("coding")
    }
  }

  private async loadPhilosophyModule(): Promise<any> {
    try {
      const { philosophyModule } = await import("@/modules/philosophy")
      await philosophyModule.initialize()
      return philosophyModule
    } catch (error) {
      return this.createFallbackModule("philosophy")
    }
  }

  private async loadUserInfoModule(): Promise<any> {
    try {
      const { userInfoModule } = await import("@/modules/user-info")
      await userInfoModule.initialize()
      return userInfoModule
    } catch (error) {
      return this.createFallbackModule("user-info")
    }
  }

  private createFallbackModule(name: string): any {
    return {
      name,
      initialize: async () => {},
      process: async (input: string) => ({
        success: false,
        data: `${name} module not available`,
        confidence: 0,
        source: `${name}-fallback`,
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
