import { HealthMonitor } from "./health-monitor"

export interface SafeModeConfig {
  enableModules: boolean
  enableNetworkRequests: boolean
  enableStorage: boolean
  enableAdvancedFeatures: boolean
  maxErrors: number
}

export class SafeModeSystem {
  private healthMonitor: HealthMonitor
  private config: SafeModeConfig
  private initialized = false

  constructor() {
    this.healthMonitor = new HealthMonitor()
    this.config = {
      enableModules: true,
      enableNetworkRequests: true,
      enableStorage: true,
      enableAdvancedFeatures: true,
      maxErrors: 5,
    }
  }

  async initialize(): Promise<void> {
    try {
      this.healthMonitor.registerComponent("SafeModeSystem")

      // Test basic browser features
      await this.testBrowserFeatures()

      // Test storage
      await this.testStorage()

      // Test network (optional)
      await this.testNetwork()

      this.initialized = true
      this.healthMonitor.updateComponent("SafeModeSystem", "online")
    } catch (error) {
      this.healthMonitor.logError("SafeModeSystem", `Initialization failed: ${error}`)
      this.enterSafeMode()
    }
  }

  private async testBrowserFeatures(): Promise<void> {
    try {
      // Test basic JavaScript features
      const test = JSON.stringify({ test: true })
      JSON.parse(test)

      // Test DOM access
      if (typeof document === "undefined") {
        throw new Error("DOM not available")
      }

      this.healthMonitor.registerComponent("BrowserFeatures")
      this.healthMonitor.updateComponent("BrowserFeatures", "online")
    } catch (error) {
      this.healthMonitor.logError("BrowserFeatures", `Browser test failed: ${error}`)
      this.config.enableAdvancedFeatures = false
    }
  }

  private async testStorage(): Promise<void> {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("zacai_test", "test")
        const test = localStorage.getItem("zacai_test")
        if (test === "test") {
          localStorage.removeItem("zacai_test")
          this.healthMonitor.registerComponent("Storage")
          this.healthMonitor.updateComponent("Storage", "online")
        } else {
          throw new Error("Storage read/write failed")
        }
      } else {
        throw new Error("localStorage not available")
      }
    } catch (error) {
      this.healthMonitor.logError("Storage", `Storage test failed: ${error}`)
      this.config.enableStorage = false
    }
  }

  private async testNetwork(): Promise<void> {
    try {
      // Simple network test - try to fetch a small resource
      const response = await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-cache",
      })

      if (response.ok) {
        this.healthMonitor.registerComponent("Network")
        this.healthMonitor.updateComponent("Network", "online")
      } else {
        throw new Error(`Network test failed: ${response.status}`)
      }
    } catch (error) {
      this.healthMonitor.logWarning("Network", `Network test failed: ${error}`)
      this.config.enableNetworkRequests = false
    }
  }

  private enterSafeMode(): void {
    this.config = {
      enableModules: false,
      enableNetworkRequests: false,
      enableStorage: false,
      enableAdvancedFeatures: false,
      maxErrors: 1,
    }
    this.healthMonitor.logWarning("SafeModeSystem", "Entered safe mode due to errors")
  }

  canUseFeature(feature: keyof SafeModeConfig): boolean {
    return this.config[feature] as boolean
  }

  getSystemStatus(): string {
    const health = this.healthMonitor.getHealth()
    const components = this.healthMonitor.getComponents()

    return `🔍 **System Status Report**

**Overall Health:** ${health.status.toUpperCase()}
**Uptime:** ${Math.round((Date.now() - (Date.now() - health.uptime)) / 1000)}s
**Initialized:** ${this.initialized ? "Yes" : "No"}

**Features:**
• Modules: ${this.config.enableModules ? "✅" : "❌"}
• Network: ${this.config.enableNetworkRequests ? "✅" : "❌"}
• Storage: ${this.config.enableStorage ? "✅" : "❌"}
• Advanced: ${this.config.enableAdvancedFeatures ? "✅" : "❌"}

**Components:** ${components.length} registered`
  }

  getHealthReport(): string {
    const health = this.healthMonitor.getHealth()
    const components = this.healthMonitor.getComponents()

    let report = `📊 **Health Report**\n\n`

    if (health.errors.length > 0) {
      report += `**Recent Errors:**\n`
      health.errors.forEach((error) => {
        report += `• ${error}\n`
      })
      report += `\n`
    }

    if (health.warnings.length > 0) {
      report += `**Warnings:**\n`
      health.warnings.forEach((warning) => {
        report += `• ${warning}\n`
      })
      report += `\n`
    }

    if (components.length > 0) {
      report += `**Component Status:**\n`
      components.forEach((comp) => {
        const status = comp.status === "online" ? "✅" : comp.status === "offline" ? "⚠️" : "❌"
        report += `• ${comp.name}: ${status} (errors: ${comp.errorCount})\n`
      })
    }

    return report
  }

  async runDiagnostics(): Promise<void> {
    // Re-run all tests
    await this.testBrowserFeatures()
    await this.testStorage()
    await this.testNetwork()
  }
}
