import { performanceMonitor } from "@/core/performance/monitor"

type LoadingPriority = "critical" | "high" | "medium" | "low"

interface LoadableItem {
  name: string
  loader: () => Promise<any>
  priority: LoadingPriority
  status: "pending" | "loading" | "loaded" | "failed"
  error?: any
  module?: any
}

export class OptimizedLoader {
  private queue: LoadableItem[] = []
  private loadedModules = new Map<string, any>()
  public logs: string[] = []

  private log(message: string) {
    console.log(message)
    this.logs.push(message)
  }

  register(name: string, loader: () => Promise<any>, priority: LoadingPriority) {
    this.queue.push({ name, loader, priority, status: "pending" })
  }

  async load(onProgress: (progress: number, stage: string) => void): Promise<void> {
    this.log("🚀 Starting optimized loading sequence...")
    performanceMonitor.startTimer("total-load-time")

    const priorities: LoadingPriority[] = ["critical", "high", "medium", "low"]
    const totalItems = this.queue.length
    let loadedCount = 0

    for (const priority of priorities) {
      const itemsToLoad = this.queue.filter((item) => item.priority === priority)
      if (itemsToLoad.length === 0) continue

      this.log(`- Loading ${priority} priority items...`)
      onProgress((loadedCount / totalItems) * 100, `Loading ${priority} priority modules...`)

      const promises = itemsToLoad.map(async (item) => {
        item.status = "loading"
        performanceMonitor.startTimer(item.name)
        try {
          const module = await item.loader()
          item.module = module
          item.status = "loaded"
          this.loadedModules.set(item.name, module)
          const duration = performanceMonitor.endTimer(item.name)
          performanceMonitor.recordModuleInit(item.name, duration)
          this.log(`  ✅ ${item.name} loaded successfully in ${duration.toFixed(2)}ms.`)
        } catch (error) {
          item.status = "failed"
          item.error = error
          performanceMonitor.endTimer(item.name)
          this.log(`  ❌ ${item.name} failed to load. Bypassing. Error: ${error}`)
          if (priority === "critical") {
            // If a critical module fails, we must stop and throw the error.
            throw new Error(`Critical module "${item.name}" failed to load.`)
          }
        }
        loadedCount++
        onProgress((loadedCount / totalItems) * 100, `${item.name} ${item.status}`)
      })
      await Promise.all(promises)
    }

    const totalTime = performanceMonitor.endTimer("total-load-time")
    this.log(`🏁 Loading sequence complete in ${totalTime.toFixed(2)}ms.`)
    performanceMonitor.recordStage("total-load-time", totalTime)
  }

  getModule<T>(name: string): T | undefined {
    return this.loadedModules.get(name) as T | undefined
  }

  getLoadingStatus(): LoadableItem[] {
    return this.queue.map(({ loader, ...rest }) => rest) // Don't expose the loader function itself
  }
}
