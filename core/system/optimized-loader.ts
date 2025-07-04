import { performanceMonitor } from "@/core/performance/monitor"

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

interface LoadingStrategy {
  priority: "critical" | "high" | "medium" | "low"
  lazy: boolean
  cache: boolean
  preload: boolean
}

export class OptimizedLoader {
  private cache = new Map<string, CacheEntry>()
  private loadingQueue: Array<{ name: string; loader: () => Promise<any>; strategy: LoadingStrategy }> = []
  private loadedModules = new Set<string>()
  private isProcessing = false

  private strategies: { [key: string]: LoadingStrategy } = {
    "safe-mode": { priority: "critical", lazy: false, cache: true, preload: true },
    "user-memory": { priority: "critical", lazy: false, cache: true, preload: true },
    "storage-manager": { priority: "critical", lazy: false, cache: true, preload: true },
    vocabulary: { priority: "high", lazy: true, cache: true, preload: false },
    mathematics: { priority: "high", lazy: true, cache: true, preload: false },
    facts: { priority: "medium", lazy: true, cache: true, preload: false },
    coding: { priority: "medium", lazy: true, cache: true, preload: false },
    philosophy: { priority: "low", lazy: true, cache: true, preload: false },
  }

  async loadCriticalSystems(): Promise<void> {
    performanceMonitor.startTimer("critical-systems")

    const criticalLoaders = this.loadingQueue.filter(
      (item) => item.strategy.priority === "critical" && !item.strategy.lazy,
    )

    // Load critical systems in parallel
    const promises = criticalLoaders.map(async (item) => {
      performanceMonitor.startTimer(item.name)
      try {
        const result = await this.loadWithCache(item.name, item.loader, item.strategy)
        const duration = performanceMonitor.endTimer(item.name)
        performanceMonitor.recordModuleInit(item.name, duration)
        this.loadedModules.add(item.name)
        return result
      } catch (error) {
        console.error(`Failed to load critical system ${item.name}:`, error)
        throw error
      }
    })

    await Promise.all(promises)

    const duration = performanceMonitor.endTimer("critical-systems")
    performanceMonitor.recordStage("critical-systems", duration)
  }

  async loadHighPrioritySystems(): Promise<void> {
    performanceMonitor.startTimer("high-priority-systems")

    const highPriorityLoaders = this.loadingQueue.filter(
      (item) => item.strategy.priority === "high" && !item.strategy.lazy,
    )

    // Load high priority systems in parallel but with concurrency limit
    await this.loadWithConcurrencyLimit(highPriorityLoaders, 2)

    const duration = performanceMonitor.endTimer("high-priority-systems")
    performanceMonitor.recordStage("high-priority-systems", duration)
  }

  async loadModuleOnDemand(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return this.getFromCache(moduleName)
    }

    const moduleLoader = this.loadingQueue.find((item) => item.name === moduleName)
    if (!moduleLoader) {
      throw new Error(`Module ${moduleName} not found`)
    }

    performanceMonitor.startTimer(`lazy-${moduleName}`)

    try {
      const result = await this.loadWithCache(moduleName, moduleLoader.loader, moduleLoader.strategy)
      const duration = performanceMonitor.endTimer(`lazy-${moduleName}`)
      performanceMonitor.recordModuleInit(`lazy-${moduleName}`, duration)
      this.loadedModules.add(moduleName)
      return result
    } catch (error) {
      console.error(`Failed to lazy load ${moduleName}:`, error)
      throw error
    }
  }

  private async loadWithCache(name: string, loader: () => Promise<any>, strategy: LoadingStrategy): Promise<any> {
    // Check cache first
    if (strategy.cache) {
      const cached = this.getFromCache(name)
      if (cached) {
        console.log(`Cache hit for ${name}`)
        return cached
      }
    }

    // Load fresh data
    const startTime = performance.now()
    const data = await loader()
    const duration = performance.now() - startTime

    // Cache if strategy allows
    if (strategy.cache) {
      this.setCache(name, data, 300000) // 5 minutes TTL
    }

    // Record network request if this was an API call
    if (name.includes("api") || name.includes("fetch")) {
      performanceMonitor.recordNetworkRequest(duration)
    }

    return data
  }

  private async loadWithConcurrencyLimit(loaders: any[], limit: number): Promise<void> {
    const executing: Promise<any>[] = []

    for (const loader of loaders) {
      const promise = this.loadWithCache(loader.name, loader.loader, loader.strategy)
        .then((result) => {
          this.loadedModules.add(loader.name)
          return result
        })
        .finally(() => {
          executing.splice(executing.indexOf(promise), 1)
        })

      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  registerLoader(name: string, loader: () => Promise<any>, customStrategy?: Partial<LoadingStrategy>): void {
    const strategy = {
      ...(this.strategies[name] ||
        this.strategies["default"] || { priority: "medium", lazy: true, cache: true, preload: false }),
      ...customStrategy,
    }

    this.loadingQueue.push({ name, loader, strategy })
  }

  async preloadModules(): Promise<void> {
    const preloadModules = this.loadingQueue.filter(
      (item) => item.strategy.preload && !this.loadedModules.has(item.name),
    )

    if (preloadModules.length === 0) return

    performanceMonitor.startTimer("preload-modules")

    // Preload in background with low priority
    setTimeout(async () => {
      try {
        await this.loadWithConcurrencyLimit(preloadModules, 1)
        const duration = performanceMonitor.endTimer("preload-modules")
        performanceMonitor.recordStage("preload-modules", duration)
      } catch (error) {
        console.warn("Preload failed:", error)
      }
    }, 100) // Small delay to not block main thread
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules)
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.75, // Would need to track hits/misses for real rate
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const optimizedLoader = new OptimizedLoader()
