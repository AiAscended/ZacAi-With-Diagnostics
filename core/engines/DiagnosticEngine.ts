import { SystemDiagnostics } from "../system/diagnostics"

export interface DiagnosticResult {
  response: string
  confidence: number
  diagnostics: any
  healthScore: number
}

export class DiagnosticEngine {
  private systemDiagnostics: SystemDiagnostics
  private performanceHistory: Array<{ timestamp: number; metrics: any }> = []

  constructor() {
    console.log("🔧 DiagnosticEngine: Initializing...")
    this.systemDiagnostics = new SystemDiagnostics()
  }

  public async initialize(): Promise<void> {
    console.log("🔧 DiagnosticEngine: Loading diagnostic systems...")
    // Diagnostic engine is ready
  }

  public async processDiagnostic(input: string): Promise<DiagnosticResult> {
    console.log(`🔧 DiagnosticEngine: Processing diagnostic: "${input}"`)

    try {
      const healthData = this.systemDiagnostics.getSystemHealth()
      const healthScore = this.systemDiagnostics.getHealthScore()

      // Determine what kind of diagnostic info is requested
      if (this.isStatusRequest(input)) {
        return this.handleStatusRequest(healthData, healthScore)
      }

      if (this.isPerformanceRequest(input)) {
        return this.handlePerformanceRequest(healthData, healthScore)
      }

      if (this.isHealthRequest(input)) {
        return this.handleHealthRequest(healthData, healthScore)
      }

      // General diagnostic response
      return this.handleGeneralDiagnostic(healthData, healthScore)
    } catch (error) {
      console.error("❌ DiagnosticEngine: Error processing diagnostic:", error)
      return {
        response: "I encountered an error while running diagnostics.",
        confidence: 0.1,
        diagnostics: { error: error.message },
        healthScore: 0,
      }
    }
  }

  private isStatusRequest(input: string): boolean {
    return /status|state|condition|how are you/i.test(input)
  }

  private isPerformanceRequest(input: string): boolean {
    return /performance|speed|response time|efficiency/i.test(input)
  }

  private isHealthRequest(input: string): boolean {
    return /health|diagnostic|check|system/i.test(input)
  }

  private handleStatusRequest(healthData: any, healthScore: number): DiagnosticResult {
    const response = `System Status Report:
🏥 Health Score: ${healthScore}/100
⏱️ Uptime: ${Math.round(healthData.uptime / 1000)}s
📊 Average Response Time: ${healthData.performance.averageResponseTime.toFixed(2)}ms
✅ Success Rate: ${(healthData.performance.successRate * 100).toFixed(1)}%
🔧 All engines operational: ${this.areAllEnginesOperational(healthData.engines) ? "Yes" : "No"}`

    return {
      response,
      confidence: 0.95,
      diagnostics: healthData,
      healthScore,
    }
  }

  private handlePerformanceRequest(healthData: any, healthScore: number): DiagnosticResult {
    const perf = healthData.performance
    const response = `Performance Metrics:
⚡ Average Response Time: ${perf.averageResponseTime.toFixed(2)}ms
📈 Total Requests: ${perf.totalRequests}
✅ Success Rate: ${(perf.successRate * 100).toFixed(1)}%
❌ Error Rate: ${(perf.errorRate * 100).toFixed(1)}%
🕐 Last Response Time: ${perf.lastResponseTime.toFixed(2)}ms

${
  perf.averageResponseTime < 1000
    ? "🟢 Performance is excellent!"
    : perf.averageResponseTime < 3000
      ? "🟡 Performance is good"
      : "🔴 Performance needs optimization"
}`

    return {
      response,
      confidence: 0.9,
      diagnostics: healthData,
      healthScore,
    }
  }

  private handleHealthRequest(healthData: any, healthScore: number): DiagnosticResult {
    const report = this.systemDiagnostics.generateReport()

    return {
      response: `Complete System Health Report:\n\n${report}`,
      confidence: 0.95,
      diagnostics: healthData,
      healthScore,
    }
  }

  private handleGeneralDiagnostic(healthData: any, healthScore: number): DiagnosticResult {
    let status = "🟢 Excellent"
    if (healthScore < 80) status = "🟡 Good"
    if (healthScore < 60) status = "🟠 Fair"
    if (healthScore < 40) status = "🔴 Poor"

    const response = `System Diagnostic Summary:
Overall Health: ${status} (${healthScore}/100)
Recent Errors: ${healthData.errors.length}
Memory Usage: ${healthData.memoryUsage.totalEntries} entries
All Systems: ${this.areAllEnginesOperational(healthData.engines) ? "Operational" : "Some issues detected"}

${healthScore > 80 ? "All systems running optimally!" : "Some areas may need attention."}`

    return {
      response,
      confidence: 0.85,
      diagnostics: healthData,
      healthScore,
    }
  }

  private areAllEnginesOperational(engines: any): boolean {
    return Object.values(engines).every((status) => status === true)
  }

  public logPerformance(operation: string, duration: number): void {
    this.systemDiagnostics.logPerformance(operation, duration)

    // Store performance history
    this.performanceHistory.push({
      timestamp: Date.now(),
      metrics: { operation, duration },
    })

    // Keep history manageable
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-500)
    }
  }

  public logError(message: string, stack?: string, engine?: string): void {
    this.systemDiagnostics.logError(message, stack, engine)
  }

  public logWarning(message: string, engine?: string): void {
    this.systemDiagnostics.logWarning(message, engine)
  }

  public getSystemStats(): any {
    return {
      health: this.systemDiagnostics.getSystemHealth(),
      healthScore: this.systemDiagnostics.getHealthScore(),
      performanceHistory: this.performanceHistory.slice(-10), // Last 10 entries
    }
  }

  public getStatus(): any {
    return {
      initialized: true,
      healthScore: this.systemDiagnostics.getHealthScore(),
      performanceEntries: this.performanceHistory.length,
      monitoringActive: true,
    }
  }
}
