import { HealthMonitor } from "./health-monitor"

interface SafeModeConfig {
  enableAdvancedFeatures: boolean
  enableModules: boolean
  enableNetworkRequests: boolean
  enableStorage: boolean
}

export class SafeModeSystem {
  private healthMonitor: HealthMonitor
  private config: SafeModeConfig
  private isInitialized = false

  constructor() {
    this.healthMonitor = new HealthMonitor()
    this.config = {
      enableAdvancedFeatures: false,
      enableModules: false,
      enableNetworkRequests: false,
      enableStorage: false,
    }
    console.log("🛡️ SafeModeSystem initialized")
  }

  async initialize(): Promise<void> {
    console.log("🛡️ Initializing Safe Mode System...")

    try {
      // Run health diagnostics
      const health = await this.healthMonitor.runDiagnostics()

      // Configure based on health status
      this.config = {
        enableAdvancedFeatures: health.status === "healthy",
        enableModules: health.status !== "critical",
        enableNetworkRequests: !health.errors.includes("Network unavailable"),
        enableStorage: !health.errors.includes("LocalStorage not available"),
      }

      this.isInitialized = true
      console.log("✅ Safe Mode System initialized successfully")
      console.log("🛡️ Configuration:", this.config)
    } catch (error) {
      console.error("❌ Safe Mode System initialization failed:", error)
      // Even if initialization fails, we can still run in ultra-safe mode
      this.isInitialized = true
    }
  }

  canUseFeature(feature: keyof SafeModeConfig): boolean {
    return this.config[feature]
  }

  getSystemStatus(): string {
    const health = this.healthMonitor.getHealth()
    return `🛡️ **Safe Mode Status**

**System Status:** ${health.status.toUpperCase()}
**Advanced Features:** ${this.config.enableAdvancedFeatures ? "✅ Enabled" : "❌ Disabled"}
**Modules:** ${this.config.enableModules ? "✅ Enabled" : "❌ Disabled"}
**Network:** ${this.config.enableNetworkRequests ? "✅ Enabled" : "❌ Disabled"}
**Storage:** ${this.config.enableStorage ? "✅ Enabled" : "❌ Disabled"}

**Initialization:** ${this.isInitialized ? "✅ Complete" : "❌ Failed"}`
  }

  getHealthReport(): string {
    return this.healthMonitor.getHealthReport()
  }

  async runDiagnostics(): Promise<void> {
    await this.healthMonitor.runDiagnostics()
  }
}
