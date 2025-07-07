export interface HealthCheck {
  name: string
  status: "healthy" | "warning" | "critical"
  message: string
  timestamp: number
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "critical"
  checks: HealthCheck[]
  timestamp: number
}

export interface SafeModeConfig {
  fallbackMode: boolean
  criticalModulesOnly: boolean
  maxRetries: number
  healthCheckInterval: number
}

export class SafeModeSystem {
  private config: SafeModeConfig = {
    fallbackMode: false,
    criticalModulesOnly: false,
    maxRetries: 3,
    healthCheckInterval: 30000,
  }

  private healthChecks: HealthCheck[] = []
  private lastHealthCheck = 0
  private healthCheckTimer?: NodeJS.Timeout

  async initialize(): Promise<void> {
    console.log("🛡️ Initializing Safe Mode System...")

    await this.runHealthChecks()
    this.startHealthMonitoring()

    console.log("✅ Safe Mode System initialized")
  }

  private async runHealthChecks(): Promise<void> {
    this.healthChecks = []

    // Check browser environment
    this.healthChecks.push({
      name: "Browser Environment",
      status: typeof window !== "undefined" ? "healthy" : "critical",
      message: typeof window !== "undefined" ? "Browser environment detected" : "Not running in browser",
      timestamp: Date.now(),
    })

    // Check localStorage availability
    try {
      localStorage.setItem("zacai-test", "test")
      localStorage.removeItem("zacai-test")
      this.healthChecks.push({
        name: "Local Storage",
        status: "healthy",
        message: "Local storage is available",
        timestamp: Date.now(),
      })
    } catch (error) {
      this.healthChecks.push({
        name: "Local Storage",
        status: "warning",
        message: "Local storage not available, using memory fallback",
        timestamp: Date.now(),
      })
    }

    // Check memory usage (if available)
    if ("memory" in performance) {
      const memory = (performance as any).memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)

      this.healthChecks.push({
        name: "Memory Usage",
        status: usedMB < totalMB * 0.8 ? "healthy" : "warning",
        message: `Using ${usedMB}MB of ${totalMB}MB available`,
        timestamp: Date.now(),
      })
    }

    // Check network connectivity
    this.healthChecks.push({
      name: "Network Status",
      status: navigator.onLine ? "healthy" : "warning",
      message: navigator.onLine ? "Network connection available" : "Offline mode",
      timestamp: Date.now(),
    })

    this.lastHealthCheck = Date.now()
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.runHealthChecks()
    }, this.config.healthCheckInterval)
  }

  getSystemHealth(): SystemHealth {
    const criticalCount = this.healthChecks.filter((c) => c.status === "critical").length
    const warningCount = this.healthChecks.filter((c) => c.status === "warning").length

    let overall: "healthy" | "degraded" | "critical"
    if (criticalCount > 0) {
      overall = "critical"
    } else if (warningCount > 0) {
      overall = "degraded"
    } else {
      overall = "healthy"
    }

    return {
      overall,
      checks: this.healthChecks,
      timestamp: this.lastHealthCheck,
    }
  }

  getConfiguration(): SafeModeConfig {
    return { ...this.config }
  }

  updateConfiguration(updates: Partial<SafeModeConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  enterSafeMode(): void {
    console.warn("🚨 Entering Safe Mode")
    this.config.fallbackMode = true
    this.config.criticalModulesOnly = true
  }

  exitSafeMode(): void {
    console.log("✅ Exiting Safe Mode")
    this.config.fallbackMode = false
    this.config.criticalModulesOnly = false
  }

  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
  }
}
