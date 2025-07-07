export interface HealthCheck {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  timestamp: number
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "error"
  checks: HealthCheck[]
  uptime: number
  lastCheck: number
}

export class HealthMonitor {
  private checks: HealthCheck[] = []
  private startTime: number = Date.now()

  async runHealthChecks(): Promise<SystemHealth> {
    this.checks = []

    // Check browser environment
    await this.checkBrowserEnvironment()

    // Check localStorage
    await this.checkLocalStorage()

    // Check network connectivity
    await this.checkNetworkConnectivity()

    // Check memory usage
    await this.checkMemoryUsage()

    const overall = this.determineOverallHealth()

    return {
      overall,
      checks: this.checks,
      uptime: Date.now() - this.startTime,
      lastCheck: Date.now(),
    }
  }

  private async checkBrowserEnvironment(): Promise<void> {
    try {
      if (typeof window === "undefined") {
        this.addCheck("Browser Environment", "error", "Running in non-browser environment")
        return
      }

      if (!window.localStorage) {
        this.addCheck("Browser Environment", "warning", "localStorage not available")
        return
      }

      this.addCheck("Browser Environment", "healthy", "Browser environment is compatible")
    } catch (error) {
      this.addCheck("Browser Environment", "error", `Browser check failed: ${error}`)
    }
  }

  private async checkLocalStorage(): Promise<void> {
    try {
      const testKey = "zacai_health_test"
      const testValue = "test_value"

      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      if (retrieved === testValue) {
        this.addCheck("Local Storage", "healthy", "localStorage is working correctly")
      } else {
        this.addCheck("Local Storage", "error", "localStorage read/write test failed")
      }
    } catch (error) {
      this.addCheck("Local Storage", "error", `localStorage error: ${error}`)
    }
  }

  private async checkNetworkConnectivity(): Promise<void> {
    try {
      if (!navigator.onLine) {
        this.addCheck("Network", "warning", "Browser reports offline status")
        return
      }
      this.addCheck("Network", "healthy", "Network connectivity appears available.")
    } catch (error) {
      this.addCheck("Network", "error", `Network check failed: ${error}`)
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      if ("memory" in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        const usagePercent = (usedMB / limitMB) * 100

        if (usagePercent > 90) {
          this.addCheck(
            "Memory",
            "error",
            `Critical memory usage: ${usedMB}MB/${limitMB}MB (${usagePercent.toFixed(1)}%)`,
          )
        } else if (usagePercent > 75) {
          this.addCheck(
            "Memory",
            "warning",
            `High memory usage: ${usedMB}MB/${limitMB}MB (${usagePercent.toFixed(1)}%)`,
          )
        } else {
          this.addCheck(
            "Memory",
            "healthy",
            `Memory usage normal: ${usedMB}MB/${limitMB}MB (${usagePercent.toFixed(1)}%)`,
          )
        }
      } else {
        this.addCheck("Memory", "warning", "Memory monitoring not available in this browser")
      }
    } catch (error) {
      this.addCheck("Memory", "error", `Memory check failed: ${error}`)
    }
  }

  private addCheck(name: string, status: "healthy" | "warning" | "error", message: string): void {
    this.checks.push({
      name,
      status,
      message,
      timestamp: Date.now(),
    })
  }

  private determineOverallHealth(): "healthy" | "warning" | "error" {
    if (this.checks.some((check) => check.status === "error")) return "error"
    if (this.checks.some((check) => check.status === "warning")) return "warning"
    return "healthy"
  }
}
