export interface DiagnosticData {
  timestamp: number
  operation: string
  duration: number
  success: boolean
  error?: string
  metadata?: any
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "critical"
  components: {
    [key: string]: {
      status: "healthy" | "warning" | "critical"
      lastCheck: number
      metrics: any
    }
  }
  performance: {
    averageResponseTime: number
    successRate: number
    errorRate: number
  }
}

export class SystemDiagnostics {
  private diagnosticLog: DiagnosticData[] = []
  private maxLogSize = 1000
  private healthChecks: Map<string, () => Promise<any>> = new Map()

  public logOperation(operation: string, duration: number, success: boolean, error?: string, metadata?: any): void {
    const diagnostic: DiagnosticData = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      error,
      metadata,
    }

    this.diagnosticLog.push(diagnostic)

    // Keep log size manageable
    if (this.diagnosticLog.length > this.maxLogSize) {
      this.diagnosticLog = this.diagnosticLog.slice(-this.maxLogSize * 0.8)
    }

    // Log to console if debug mode
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 ${operation}: ${duration}ms ${success ? "✅" : "❌"}`)
    }
  }

  public registerHealthCheck(component: string, checkFunction: () => Promise<any>): void {
    this.healthChecks.set(component, checkFunction)
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    const components: SystemHealth["components"] = {}

    // Run health checks for all registered components
    for (const [component, checkFn] of this.healthChecks.entries()) {
      try {
        const metrics = await checkFn()
        components[component] = {
          status: "healthy",
          lastCheck: Date.now(),
          metrics,
        }
      } catch (error) {
        components[component] = {
          status: "critical",
          lastCheck: Date.now(),
          metrics: { error: error.message },
        }
      }
    }

    // Calculate performance metrics
    const recentLogs = this.diagnosticLog.slice(-100) // Last 100 operations
    const successfulOps = recentLogs.filter((log) => log.success)
    const averageResponseTime =
      recentLogs.length > 0 ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length : 0
    const successRate = recentLogs.length > 0 ? successfulOps.length / recentLogs.length : 1
    const errorRate = 1 - successRate

    // Determine overall health
    const criticalComponents = Object.values(components).filter((c) => c.status === "critical").length
    const warningComponents = Object.values(components).filter((c) => c.status === "warning").length

    let overall: SystemHealth["overall"] = "healthy"
    if (criticalComponents > 0 || errorRate > 0.1) {
      overall = "critical"
    } else if (warningComponents > 0 || errorRate > 0.05) {
      overall = "warning"
    }

    return {
      overall,
      components,
      performance: {
        averageResponseTime,
        successRate,
        errorRate,
      },
    }
  }

  public getDiagnosticLog(): DiagnosticData[] {
    return [...this.diagnosticLog]
  }

  public clearDiagnosticLog(): void {
    this.diagnosticLog = []
  }

  public exportDiagnostics(): any {
    return {
      log: this.diagnosticLog,
      timestamp: Date.now(),
      summary: this.getSummaryStats(),
    }
  }

  private getSummaryStats(): any {
    const totalOps = this.diagnosticLog.length
    const successfulOps = this.diagnosticLog.filter((log) => log.success).length
    const avgDuration = totalOps > 0 ? this.diagnosticLog.reduce((sum, log) => sum + log.duration, 0) / totalOps : 0

    const operationCounts = this.diagnosticLog.reduce(
      (counts, log) => {
        counts[log.operation] = (counts[log.operation] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )

    return {
      totalOperations: totalOps,
      successRate: totalOps > 0 ? successfulOps / totalOps : 1,
      averageDuration: avgDuration,
      operationBreakdown: operationCounts,
    }
  }
}
