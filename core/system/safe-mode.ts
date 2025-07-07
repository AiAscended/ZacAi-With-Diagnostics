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
      // Run comprehensive health checks
      await this.runHealthChecks()

      // Check if we need to enter safe mode
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
    checks.push(await this.checkBrowserEnvironment())

    // Storage availability check
    checks.push(await this.checkStorageAvailability())

    // Memory check
    checks.push(await this.checkMemoryUsage())

    // Network connectivity check
    checks.push(await this.checkNetworkConnectivity())

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

  private async checkBrowserEnvironment(): Promise<HealthCheck> {
    try {
      if (typeof window === "undefined") {
        return {
          name: "Browser Environment",
          status: "error",
          message: "Not running in browser environment",
          timestamp: Date.now(),
        }
      }

      // Check for required APIs
      const requiredAPIs = ["localStorage", "fetch", "Promise"]
      const missingAPIs = requiredAPIs.filter((api) => !(api in window))

      if (missingAPIs.length > 0) {
        return {
          name: "Browser Environment",
          status: "warning",
          message: `Missing APIs: ${missingAPIs.join(", ")}`,
          timestamp: Date.now(),
        }
      }

      return {
        name: "Browser Environment",
        status: "healthy",
        message: "Browser environment is compatible",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        name: "Browser Environment",
        status: "error",
        message: `Browser check failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  private async checkStorageAvailability(): Promise<HealthCheck> {
    try {
      const testKey = "zacai_safe_mode_test"
      const testValue = "test_data"

      // Test localStorage
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      if (retrieved !== testValue) {
        return {
          name: "Storage",
          status: "error",
          message: "localStorage read/write test failed",
          timestamp: Date.now(),
        }
      }

      return {
        name: "Storage",
        status: "healthy",
        message: "Storage systems operational",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        name: "Storage",
        status: "error",
        message: `Storage check failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    try {
      if ("memory" in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        const usagePercent = (usedMB / limitMB) * 100

        if (usagePercent > 90) {
          return {
            name: "Memory",
            status: "error",
            message: `Critical memory usage: ${usagePercent.toFixed(1)}%`,
            timestamp: Date.now(),
          }
        } else if (usagePercent > 75) {
          return {
            name: "Memory",
            status: "warning",
            message: `High memory usage: ${usagePercent.toFixed(1)}%`,
            timestamp: Date.now(),
          }
        }

        return {
          name: "Memory",
          status: "healthy",
          message: `Memory usage normal: ${usagePercent.toFixed(1)}%`,
          timestamp: Date.now(),
        }
      }

      return {
        name: "Memory",
        status: "warning",
        message: "Memory monitoring not available",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        name: "Memory",
        status: "error",
        message: `Memory check failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  private async checkNetworkConnectivity(): Promise<HealthCheck> {
    try {
      if (!navigator.onLine) {
        return {
          name: "Network",
          status: "warning",
          message: "Browser reports offline status",
          timestamp: Date.now(),
        }
      }

      return {
        name: "Network",
        status: "healthy",
        message: "Network connectivity available",
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        name: "Network",
        status: "error",
        message: `Network check failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  enterSafeMode(): void {
    console.warn("🚨 Entering Safe Mode - Limited functionality enabled")
    this.config.fallbackMode = true
  }

  exitSafeMode(): void {
    console.log("✅ Exiting Safe Mode - Full functionality restored")
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
