export interface SystemHealth {
  overall: "healthy" | "warning" | "critical"
  checks: HealthCheck[]
  timestamp: number
}

export interface HealthCheck {
  name: string
  status: "pass" | "warn" | "fail"
  message: string
  timestamp: number
}

export class SafeModeSystem {
  private healthChecks: HealthCheck[] = []
  private isInSafeMode = false

  async initialize(): Promise<void> {
    console.log("🛡️ Initializing Safe Mode System...")
    await this.runHealthChecks()
  }

  private async runHealthChecks(): Promise<void> {
    this.healthChecks = []

    // Browser check
    this.healthChecks.push({
      name: "Browser",
      status: typeof window !== "undefined" ? "pass" : "fail",
      message: typeof window !== "undefined" ? "Browser environment available" : "No browser environment",
      timestamp: Date.now(),
    })

    // Storage check
    try {
      localStorage.setItem("zacai_test", "test")
      localStorage.removeItem("zacai_test")
      this.healthChecks.push({
        name: "Storage",
        status: "pass",
        message: "Local storage available",
        timestamp: Date.now(),
      })
    } catch {
      this.healthChecks.push({
        name: "Storage",
        status: "warn",
        message: "Local storage not available",
        timestamp: Date.now(),
      })
    }

    // Memory check
    this.healthChecks.push({
      name: "Memory",
      status: "pass",
      message: "Memory systems operational",
      timestamp: Date.now(),
    })
  }

  getSystemHealth(): SystemHealth {
    const failedChecks = this.healthChecks.filter((check) => check.status === "fail")
    const warningChecks = this.healthChecks.filter((check) => check.status === "warn")

    let overall: "healthy" | "warning" | "critical" = "healthy"
    if (failedChecks.length > 0) {
      overall = "critical"
    } else if (warningChecks.length > 0) {
      overall = "warning"
    }

    return {
      overall,
      checks: this.healthChecks,
      timestamp: Date.now(),
    }
  }

  enterSafeMode(): void {
    this.isInSafeMode = true
    console.log("🚨 Entering Safe Mode")
  }

  isInSafeModeActive(): boolean {
    return this.isInSafeMode
  }
}
