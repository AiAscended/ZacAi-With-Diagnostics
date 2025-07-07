export interface SystemHealth {
  overall: "healthy" | "warning" | "error" | "critical"
  checks: HealthCheck[]
  uptime: number
  lastCheck: number
}

export interface HealthCheck {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  timestamp: number
}

export interface SafeModeConfig {
  fallbackMode: boolean
  criticalErrorThreshold: number
  autoRecovery: boolean
  diagnosticsEnabled: boolean
}

export class SafeModeSystem {
  private config: SafeModeConfig = {
    fallbackMode: false,
    criticalErrorThreshold: 3,
    autoRecovery: true,
    diagnosticsEnabled: true,
  }

  private systemHealth: SystemHealth | null = null
  private errorCount = 0
  private startTime = Date.now()

  async initialize(): Promise<void> {
    console.log("🛡️ Initializing Safe Mode System...")

    try {
      await this.runHealthChecks()

      if (this.systemHealth?.overall === "critical") {
        this.enterSafeMode()
      }

      console.log("✅ Safe Mode System initialized")
    } catch (error) {
      console.error("❌ Safe Mode initialization failed:", error)
      this.enterSafeMode()
    }
  }

  private async runHealthChecks(): Promise<void> {
    const checks: HealthCheck[] = []

    // Browser environment check
    try {
      if (typeof window === "undefined") {
        checks.push({
          name: "Browser Environment",
          status: "error",
          message: "Not running in browser environment",
          timestamp: Date.now(),
        })
      } else {
        checks.push({
          name: "Browser Environment",
          status: "healthy",
          message: "Browser environment is compatible",
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      checks.push({
        name: "Browser Environment",
        status: "error",
        message: `Browser check failed: ${error}`,
        timestamp: Date.now(),
      })
    }

    // Storage check
    try {
      const testKey = "zacai_test"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      checks.push({
        name: "Storage",
        status: "healthy",
        message: "Storage systems operational",
        timestamp: Date.now(),
      })
    } catch (error) {
      checks.push({
        name: "Storage",
        status: "warning",
        message: "Storage not available, using memory fallback",
        timestamp: Date.now(),
      })
    }

    // Network check
    checks.push({
      name: "Network",
      status: navigator.onLine ? "healthy" : "warning",
      message: navigator.onLine ? "Network available" : "Offline mode",
      timestamp: Date.now(),
    })

    // Determine overall health
    const criticalErrors = checks.filter((c) => c.status === "error").length
    const warnings = checks.filter((c) => c.status === "warning").length

    let overall: SystemHealth["overall"] = "healthy"
    if (criticalErrors >= this.config.criticalErrorThreshold) {
      overall = "critical"
    } else if (criticalErrors > 0) {
      overall = "error"
    } else if (warnings > 0) {
      overall = "warning"
    }

    this.systemHealth = {
      overall,
      checks,
      uptime: Date.now() - this.startTime,
      lastCheck: Date.now(),
    }
  }

  enterSafeMode(): void {
    console.warn("🚨 Entering Safe Mode")
    this.config.fallbackMode = true
  }

  exitSafeMode(): void {
    console.log("✅ Exiting Safe Mode")
    this.config.fallbackMode = false
  }

  getSystemHealth(): SystemHealth | null {
    return this.systemHealth
  }

  getConfiguration(): SafeModeConfig {
    return { ...this.config }
  }

  isInSafeMode(): boolean {
    return this.config.fallbackMode
  }
}
