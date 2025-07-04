import { optimizedLoader } from "./optimized-loader"
import { performanceMonitor } from "@/core/performance/monitor"
import { userMemory } from "@/core/memory/user-memory"
import { storageManager } from "@/core/storage/manager"

interface SystemState {
  initialized: boolean
  criticalSystemsReady: boolean
  modulesLoaded: string[]
  errors: string[]
  performance: any
}

export class OptimizedSystemManager {
  private state: SystemState = {
    initialized: false,
    criticalSystemsReady: false,
    modulesLoaded: [],
    errors: [],
    performance: null,
  }

  async initialize(): Promise<void> {
    performanceMonitor.startTimer("total-initialization")

    try {
      // Register all loaders with optimized strategies
      this.registerLoaders()

      // Phase 1: Critical systems (blocking)
      await this.loadCriticalSystems()

      // Phase 2: High priority systems (blocking)
      await this.loadHighPrioritySystems()

      // Phase 3: Background loading (non-blocking)
      this.startBackgroundLoading()

      this.state.initialized = true

      const totalTime = performanceMonitor.endTimer("total-initialization")
      performanceMonitor.recordStage("total-initialization", totalTime)

      console.log(`🚀 System initialized in ${totalTime.toFixed(2)}ms`)
    } catch (error) {
      this.state.errors.push(`Initialization failed: ${error}`)
      console.error("System initialization failed:", error)
      throw error
    }
  }

  private registerLoaders(): void {
    // Critical systems - must load first
    optimizedLoader.registerLoader("safe-mode", async () => {
      const { SafeModeSystem } = await import("@/core/system/safe-mode")
      const safeMode = new SafeModeSystem()
      await safeMode.initialize()
      return safeMode
    })

    optimizedLoader.registerLoader("storage-manager", async () => {
      await storageManager.initialize()
      return storageManager
    })

    optimizedLoader.registerLoader("user-memory", async () => {
      await userMemory.initialize()
      return userMemory
    })

    // High priority modules - load early but can be lazy
    optimizedLoader.registerLoader(
      "vocabulary",
      async () => {
        const { vocabularyModule } = await import("@/modules/vocabulary")
        await vocabularyModule.initialize()
        return vocabularyModule
      },
      { priority: "high", lazy: false },
    )

    optimizedLoader.registerLoader(
      "mathematics",
      async () => {
        const { mathematicsModule } = await import("@/modules/mathematics")
        await mathematicsModule.initialize()
        return mathematicsModule
      },
      { priority: "high", lazy: false },
    )

    // Medium priority modules - lazy load
    optimizedLoader.registerLoader("facts", async () => {
      const { factsModule } = await import("@/modules/facts")
      await factsModule.initialize()
      return factsModule
    })

    optimizedLoader.registerLoader("coding", async () => {
      const { codingModule } = await import("@/modules/coding")
      await codingModule.initialize()
      return codingModule
    })

    // Low priority modules - lazy load only when needed
    optimizedLoader.registerLoader("philosophy", async () => {
      const { philosophyModule } = await import("@/modules/philosophy")
      await philosophyModule.initialize()
      return philosophyModule
    })
  }

  private async loadCriticalSystems(): Promise<void> {
    performanceMonitor.startTimer("critical-phase")

    await optimizedLoader.loadCriticalSystems()
    this.state.criticalSystemsReady = true

    const duration = performanceMonitor.endTimer("critical-phase")
    performanceMonitor.recordStage("critical-phase", duration)
  }

  private async loadHighPrioritySystems(): Promise<void> {
    performanceMonitor.startTimer("high-priority-phase")

    await optimizedLoader.loadHighPrioritySystems()
    this.state.modulesLoaded = optimizedLoader.getLoadedModules()

    const duration = performanceMonitor.endTimer("high-priority-phase")
    performanceMonitor.recordStage("high-priority-phase", duration)
  }

  private startBackgroundLoading(): void {
    // Start preloading remaining modules in background
    optimizedLoader.preloadModules()
  }

  async getModule(moduleName: string): Promise<any> {
    try {
      return await optimizedLoader.loadModuleOnDemand(moduleName)
    } catch (error) {
      this.state.errors.push(`Failed to load module ${moduleName}: ${error}`)
      throw error
    }
  }

  async processQuery(input: string): Promise<any> {
    performanceMonitor.startTimer("query-processing")

    try {
      // Determine which modules are needed
      const requiredModules = this.determineRequiredModules(input)

      // Load modules on demand if not already loaded
      const modulePromises = requiredModules.map((moduleName) =>
        this.getModule(moduleName).catch((error) => {
          console.warn(`Module ${moduleName} failed to load:`, error)
          return null
        }),
      )

      const modules = await Promise.all(modulePromises)
      const loadedModules = modules.filter(Boolean)

      // Process with available modules
      const results = await Promise.all(
        loadedModules.map((module) =>
          module.process(input).catch((error) => {
            console.warn("Module processing error:", error)
            return null
          }),
        ),
      )

      const validResults = results.filter((result) => result && result.success)

      const duration = performanceMonitor.endTimer("query-processing")
      performanceMonitor.recordStage("query-processing", duration)

      return this.synthesizeResponse(input, validResults)
    } catch (error) {
      const duration = performanceMonitor.endTimer("query-processing")
      performanceMonitor.recordStage("query-processing", duration)

      console.error("Query processing failed:", error)
      return {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["error"],
        processingTime: duration,
      }
    }
  }

  private determineRequiredModules(input: string): string[] {
    const modules: string[] = []
    const lowerInput = input.toLowerCase()

    // Quick pattern matching to determine modules
    if (lowerInput.includes("define") || lowerInput.includes("meaning") || lowerInput.includes("word")) {
      modules.push("vocabulary")
    }

    if (/[\d+\-*/()=]/.test(input) || lowerInput.includes("calculate") || lowerInput.includes("math")) {
      modules.push("mathematics")
    }

    if (lowerInput.includes("fact") || lowerInput.includes("information") || lowerInput.includes("tell me about")) {
      modules.push("facts")
    }

    if (lowerInput.includes("code") || lowerInput.includes("program") || lowerInput.includes("function")) {
      modules.push("coding")
    }

    if (lowerInput.includes("philosophy") || lowerInput.includes("ethics") || lowerInput.includes("moral")) {
      modules.push("philosophy")
    }

    // If no specific modules detected, use vocabulary as default
    if (modules.length === 0) {
      modules.push("vocabulary")
    }

    return modules
  }

  private synthesizeResponse(input: string, results: any[]): any {
    if (results.length === 0) {
      return {
        response: "I'm not sure how to help with that. Could you try rephrasing your question?",
        confidence: 0.1,
        sources: [],
        processingTime: 0,
      }
    }

    // Get best result
    const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0]

    return {
      response: bestResult.data || "I found some information but couldn't format it properly.",
      confidence: bestResult.confidence,
      sources: results.map((r) => r.source),
      processingTime: 0,
    }
  }

  getSystemState(): SystemState {
    return {
      ...this.state,
      performance: performanceMonitor.getMetrics(),
    }
  }

  getPerformanceReport(): string {
    return performanceMonitor.generateReport()
  }

  clearPerformanceData(): void {
    performanceMonitor.clear()
  }
}

export const optimizedSystemManager = new OptimizedSystemManager()
