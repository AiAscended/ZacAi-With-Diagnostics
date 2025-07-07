export interface SystemMetrics {
  memoryUsage: number
  responseTime: number
  errorRate: number
  uptime: number
  activeConnections: number
}

export interface PerformanceAlert {
  type: "memory" | "response_time" | "error_rate" | "connectivity"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: number
  resolved: boolean
}

export class HealthMonitor {
  private metrics: SystemMetrics = {
    memoryUsage: 0,
    responseTime: 0,
    errorRate: 0,
    uptime: Date.now(),
    activeConnections: 0,
  }

  private alerts: PerformanceAlert[] = []
  private monitoringInterval?: NodeJS.Timeout
  private startTime = Date.now()

  async initialize(): Promise<void> {
    console.log("🔍 Initializing Health Monitor...")

    this.startMonitoring()

    console.log("✅ Health Monitor initialized")
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.checkThresholds()
    }, 5000) // Check every 5 seconds
  }

  private collectMetrics(): void {
    // Update uptime
    this.metrics.uptime = Date.now() - this.startTime

    // Collect memory usage if available
    if ("memory" in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
    }

    // Update other metrics would be collected from actual system usage
    // For now, we'll simulate some basic metrics
    this.metrics.responseTime = Math.random() * 1000 + 500 // 500-1500ms
    this.metrics.errorRate = Math.random() * 0.1 // 0-10% error rate
  }

  private checkThresholds(): void {
    // Check memory usage
    if (this.metrics.memoryUsage > 0.9) {
      this.addAlert({
        type: "memory",
        severity: "critical",
        message: `Memory usage critical: ${Math.round(this.metrics.memoryUsage * 100)}%`,
        timestamp: Date.now(),
        resolved: false,
      })
    } else if (this.metrics.memoryUsage > 0.8) {
      this.addAlert({
        type: "memory",
        severity: "high",
        message: `Memory usage high: ${Math.round(this.metrics.memoryUsage * 100)}%`,
        timestamp: Date.now(),
        resolved: false,
      })
    }

    // Check response time
    if (this.metrics.responseTime > 3000) {
      this.addAlert({
        type: "response_time",
        severity: "high",
        message: `Response time slow: ${Math.round(this.metrics.responseTime)}ms`,
        timestamp: Date.now(),
        resolved: false,
      })
    }

    // Check error rate
    if (this.metrics.errorRate > 0.05) {
      this.addAlert({
        type: "error_rate",
        severity: "medium",
        message: `Error rate elevated: ${Math.round(this.metrics.errorRate * 100)}%`,
        timestamp: Date.now(),
        resolved: false,
      })
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    // Avoid duplicate alerts
    const existingAlert = this.alerts.find((a) => a.type === alert.type && a.severity === alert.severity && !a.resolved)

    if (!existingAlert) {
      this.alerts.push(alert)
      console.warn(`🚨 Health Alert: ${alert.message}`)

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(-50)
      }
    }
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics }
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter((alert) => !alert.resolved)
  }

  resolveAlert(alertIndex: number): void {
    if (this.alerts[alertIndex]) {
      this.alerts[alertIndex].resolved = true
    }
  }

  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter((alert) => !alert.resolved)
  }

  isHealthy(): boolean {
    const activeAlerts = this.getActiveAlerts()
    const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical")
    return criticalAlerts.length === 0
  }

  getHealthScore(): number {
    const activeAlerts = this.getActiveAlerts()
    const weights = { critical: 4, high: 3, medium: 2, low: 1 }

    const totalPenalty = activeAlerts.reduce((sum, alert) => {
      return sum + weights[alert.severity]
    }, 0)

    return Math.max(0, 100 - totalPenalty * 5)
  }

  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
  }
}
