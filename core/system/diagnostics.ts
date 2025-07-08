export interface SystemDiagnostics {
  timestamp: number
  uptime: number
  memoryUsage: MemoryInfo
  performance: PerformanceMetrics
  engines: EngineStatus
  errors: ErrorLog[]
  warnings: WarningLog[]
}

export interface MemoryInfo {
  totalEntries: number
  vocabularySize: number
  conversationHistory: number
  knowledgeBase: number
  cacheSize: number
}

export interface PerformanceMetrics {
  averageResponseTime: number
  totalRequests: number
  successRate: number
  errorRate: number
  lastResponseTime: number
}

export interface EngineStatus {
  thinking: boolean
  math: boolean
  knowledge: boolean
  language: boolean
  memory: boolean
  diagnostic: boolean
}

export interface ErrorLog {
  timestamp: number
  level: "error" | "warning" | "info"
  message: string
  stack?: string
  engine?: string
}

export interface WarningLog {
  timestamp: number
  message: string
  engine?: string
}

export class SystemDiagnostics {
  private startTime: number = Date.now()
  private performanceLog: Array<{ operation: string; duration: number; timestamp: number }> = []
  private errorLog: ErrorLog[] = []
  private warningLog: WarningLog[] = []
  private requestCount = 0
  private successCount = 0

  constructor() {
    console.log("📊 SystemDiagnostics: Initialized")
  }

  public logPerformance(operation: string, duration: number): void {
    this.performanceLog.push({
      operation,
      duration,
      timestamp: Date.now(),
    })

    // Keep only recent performance data
    if (this.performanceLog.length > 1000) {
      this.performanceLog = this.performanceLog.slice(-500)
    }
  }

  public logRequest(success: boolean): void {
    this.requestCount++
    if (success) {
      this.successCount++
    }
  }

  public logError(message: string, stack?: string, engine?: string): void {
    this.errorLog.push({
      timestamp: Date.now(),
      level: "error",
      message,
      stack,
      engine,
    })

    // Keep only recent errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50)
    }

    console.error(`❌ ${engine || "System"}: ${message}`)
  }

  public logWarning(message: string, engine?: string): void {
    this.warningLog.push({
      timestamp: Date.now(),
      message,
      engine,
    })

    // Keep only recent warnings
    if (this.warningLog.length > 100) {
      this.warningLog = this.warningLog.slice(-50)
    }

    console.warn(`⚠️ ${engine || "System"}: ${message}`)
  }

  public getSystemHealth(): SystemDiagnostics {
    const now = Date.now()
    const uptime = now - this.startTime

    return {
      timestamp: now,
      uptime,
      memoryUsage: this.getMemoryInfo(),
      performance: this.getPerformanceMetrics(),
      engines: this.getEngineStatus(),
      errors: [...this.errorLog],
      warnings: [...this.warningLog],
    }
  }

  private getMemoryInfo(): MemoryInfo {
    // This would be populated by the actual system components
    return {
      totalEntries: 0,
      vocabularySize: 0,
      conversationHistory: 0,
      knowledgeBase: 0,
      cacheSize: 0,
    }
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    const recentPerformance = this.performanceLog.slice(-100)
    const averageResponseTime =
      recentPerformance.length > 0
        ? recentPerformance.reduce((sum, log) => sum + log.duration, 0) / recentPerformance.length
        : 0

    const successRate = this.requestCount > 0 ? this.successCount / this.requestCount : 1
    const errorRate = 1 - successRate

    const lastResponseTime = recentPerformance.length > 0 ? recentPerformance[recentPerformance.length - 1].duration : 0

    return {
      averageResponseTime,
      totalRequests: this.requestCount,
      successRate,
      errorRate,
      lastResponseTime,
    }
  }

  private getEngineStatus(): EngineStatus {
    // This would check actual engine status
    return {
      thinking: true,
      math: true,
      knowledge: true,
      language: true,
      memory: true,
      diagnostic: true,
    }
  }

  public getHealthScore(): number {
    const performance = this.getPerformanceMetrics()
    const recentErrors = this.errorLog.filter(
      (error) => Date.now() - error.timestamp < 300000, // Last 5 minutes
    ).length

    let score = 100

    // Deduct for errors
    score -= recentErrors * 10

    // Deduct for poor performance
    if (performance.averageResponseTime > 5000) score -= 20
    if (performance.errorRate > 0.1) score -= 30

    return Math.max(0, Math.min(100, score))
  }

  public generateReport(): string {
    const health = this.getSystemHealth()
    const healthScore = this.getHealthScore()

    return `
🏥 SYSTEM HEALTH REPORT
======================
Health Score: ${healthScore}/100
Uptime: ${Math.round(health.uptime / 1000)}s
Average Response Time: ${health.performance.averageResponseTime.toFixed(2)}ms
Success Rate: ${(health.performance.successRate * 100).toFixed(1)}%
Recent Errors: ${health.errors.length}
Recent Warnings: ${health.warnings.length}

🔧 ENGINE STATUS
================
Thinking Engine: ${health.engines.thinking ? "✅" : "❌"}
Math Engine: ${health.engines.math ? "✅" : "❌"}
Knowledge Engine: ${health.engines.knowledge ? "✅" : "❌"}
Language Engine: ${health.engines.language ? "✅" : "❌"}
Memory Engine: ${health.engines.memory ? "✅" : "❌"}
Diagnostic Engine: ${health.engines.diagnostic ? "✅" : "❌"}

📊 MEMORY USAGE
===============
Total Entries: ${health.memoryUsage.totalEntries}
Vocabulary Size: ${health.memoryUsage.vocabularySize}
Conversation History: ${health.memoryUsage.conversationHistory}
Knowledge Base: ${health.memoryUsage.knowledgeBase}
Cache Size: ${health.memoryUsage.cacheSize}
    `.trim()
  }
}
