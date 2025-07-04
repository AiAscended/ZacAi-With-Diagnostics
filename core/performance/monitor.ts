export interface PerformanceMetrics {
  loadingStages: { [stage: string]: number }
  moduleInitTimes: { [module: string]: number }
  memoryUsage: {
    used: number
    total: number
    limit: number
  }
  networkRequests: {
    count: number
    totalTime: number
    failed: number
  }
  bundleSize: number
  renderTime: number
  totalLoadTime: number
}

export interface LoadingBottleneck {
  type: "module" | "network" | "storage" | "computation" | "render"
  name: string
  duration: number
  impact: "high" | "medium" | "low"
  recommendation: string
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadingStages: {},
    moduleInitTimes: {},
    memoryUsage: { used: 0, total: 0, limit: 0 },
    networkRequests: { count: 0, totalTime: 0, failed: 0 },
    bundleSize: 0,
    renderTime: 0,
    totalLoadTime: 0,
  }

  private startTimes: Map<string, number> = new Map()
  private bottlenecks: LoadingBottleneck[] = []

  startTimer(name: string): void {
    this.startTimes.set(name, performance.now())
  }

  endTimer(name: string): number {
    const startTime = this.startTimes.get(name)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.startTimes.delete(name)
    return duration
  }

  recordStage(stage: string, duration: number): void {
    this.metrics.loadingStages[stage] = duration

    // Identify bottlenecks
    if (duration > 1000) {
      // > 1 second
      this.bottlenecks.push({
        type: "computation",
        name: stage,
        duration,
        impact: duration > 3000 ? "high" : "medium",
        recommendation: `Optimize ${stage} - consider lazy loading or caching`,
      })
    }
  }

  recordModuleInit(module: string, duration: number): void {
    this.metrics.moduleInitTimes[module] = duration

    if (duration > 500) {
      // > 500ms
      this.bottlenecks.push({
        type: "module",
        name: module,
        duration,
        impact: duration > 1500 ? "high" : "medium",
        recommendation: `Lazy load ${module} module or optimize initialization`,
      })
    }
  }

  recordNetworkRequest(duration: number, failed = false): void {
    this.metrics.networkRequests.count++
    this.metrics.networkRequests.totalTime += duration
    if (failed) this.metrics.networkRequests.failed++

    if (duration > 2000) {
      // > 2 seconds
      this.bottlenecks.push({
        type: "network",
        name: "API Request",
        duration,
        impact: "high",
        recommendation: "Implement request caching or optimize API response",
      })
    }
  }

  updateMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      }

      const usagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100
      if (usagePercent > 70) {
        this.bottlenecks.push({
          type: "computation",
          name: "Memory Usage",
          duration: usagePercent,
          impact: usagePercent > 85 ? "high" : "medium",
          recommendation: "Optimize memory usage - clear unused data, implement garbage collection",
        })
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage()
    this.metrics.totalLoadTime = Object.values(this.metrics.loadingStages).reduce((a, b) => a + b, 0)
    return { ...this.metrics }
  }

  getBottlenecks(): LoadingBottleneck[] {
    return [...this.bottlenecks].sort((a, b) => b.duration - a.duration)
  }

  generateReport(): string {
    const metrics = this.getMetrics()
    const bottlenecks = this.getBottlenecks()

    let report = `# Performance Analysis Report\n\n`

    report += `## Current Metrics\n`
    report += `- **Total Load Time**: ${metrics.totalLoadTime.toFixed(2)}ms\n`
    report += `- **Memory Usage**: ${metrics.memoryUsage.used}MB / ${metrics.memoryUsage.limit}MB (${((metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100).toFixed(1)}%)\n`
    report += `- **Network Requests**: ${metrics.networkRequests.count} (${metrics.networkRequests.failed} failed)\n`
    report += `- **Average Request Time**: ${(metrics.networkRequests.totalTime / metrics.networkRequests.count || 0).toFixed(2)}ms\n\n`

    report += `## Loading Stage Breakdown\n`
    Object.entries(metrics.loadingStages).forEach(([stage, time]) => {
      report += `- **${stage}**: ${time.toFixed(2)}ms\n`
    })
    report += `\n`

    report += `## Module Initialization Times\n`
    Object.entries(metrics.moduleInitTimes).forEach(([module, time]) => {
      report += `- **${module}**: ${time.toFixed(2)}ms\n`
    })
    report += `\n`

    if (bottlenecks.length > 0) {
      report += `## Identified Bottlenecks\n`
      bottlenecks.forEach((bottleneck, index) => {
        report += `### ${index + 1}. ${bottleneck.name} (${bottleneck.impact.toUpperCase()} IMPACT)\n`
        report += `- **Type**: ${bottleneck.type}\n`
        report += `- **Duration**: ${bottleneck.duration.toFixed(2)}ms\n`
        report += `- **Recommendation**: ${bottleneck.recommendation}\n\n`
      })
    }

    return report
  }

  clear(): void {
    this.metrics = {
      loadingStages: {},
      moduleInitTimes: {},
      memoryUsage: { used: 0, total: 0, limit: 0 },
      networkRequests: { count: 0, totalTime: 0, failed: 0 },
      bundleSize: 0,
      renderTime: 0,
      totalLoadTime: 0,
    }
    this.bottlenecks = []
    this.startTimes.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()
