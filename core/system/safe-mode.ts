import { HealthMonitor, type SystemHealth } from "./health-monitor"

export interface SafeModeConfig {
  enableModules: boolean
  enableNetworkRequests: boolean
  enableStorage: boolean
  enableAdvancedFeatures: boolean
  maxRetries: number
  fallbackMode: boolean
}

export class SafeModeSystem {
  private healthMonitor: HealthMonitor
  private config: SafeModeConfig
  private systemHealth: SystemHealth | null = null
  private initialized = false

  constructor() {
    this.healthMonitor = new HealthMonitor()
    this.config = {
      enableModules: true,
      enableNetworkRequests: true,
      enableStorage: true,
      enableAdvancedFeatures: true,
      maxRetries: 3,
      fallbackMode: false,
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log("🛡️ SafeMode: Initializing system...")

      // Run initial health checks
      this.systemHealth = await this.healthMonitor.runHealthChecks()

      // Adjust configuration based on health
      this.adjustConfigurationBasedOnHealth()

      this.initialized = true
      console.log("✅ SafeMode: System initialized successfully")
    } catch (error) {
      console.error("❌ SafeMode: Initialization failed:", error)
      this.enableFallbackMode()
    }
  }

  private adjustConfigurationBasedOnHealth(): void {
    if (!this.systemHealth) return

    // Disable features based on health checks
    for (const check of this.systemHealth.checks) {
      switch (check.name) {
        case "Local Storage":
          if (check.status === "error") {
            this.config.enableStorage = false
            console.log("⚠️ SafeMode: Storage disabled due to health check")
          }
          break

        case "Network":
          if (check.status === "error") {
            this.config.enableNetworkRequests = false
            console.log("⚠️ SafeMode: Network requests disabled due to health check")
          }
          break

        case "Memory":
          if (check.status === "error") {
            this.config.enableAdvancedFeatures = false
            this.config.enableModules = false
            console.log("⚠️ SafeMode: Advanced features disabled due to memory issues")
          }
          break
      }
    }

    // If too many issues, enable fallback mode
    const errorCount = this.systemHealth.checks.filter((c) => c.status === "error").length
    if (errorCount >= 2) {
      this.enableFallbackMode()
    }
  }

  private enableFallbackMode(): void {
    console.log("🚨 SafeMode: Enabling fallback mode")
    this.config = {
      enableModules: false,
      enableNetworkRequests: false,
      enableStorage: false,
      enableAdvancedFeatures: false,
      maxRetries: 1,
      fallbackMode: true,
    }
  }

  canUseFeature(feature: keyof SafeModeConfig): boolean {
    return this.config[feature] as boolean
  }

  async runDiagnostics(): Promise<SystemHealth> {
    this.systemHealth = await this.healthMonitor.runHealthChecks()
    this.adjustConfigurationBasedOnHealth()
    return this.systemHealth
  }

  getSystemStatus(): string {
    const uptime = this.healthMonitor.getUptime()
    const uptimeStr = this.formatUptime(uptime)

    return `🔍 **ZacAI System Status**

**Core System:**
• Status: ${this.initialized ? "✅ Online" : "❌ Offline"}
• Uptime: ${uptimeStr}
• Mode: ${this.config.fallbackMode ? "🚨 Fallback" : "✅ Normal"}

**Features:**
• Modules: ${this.config.enableModules ? "✅ Enabled" : "❌ Disabled"}
• Network: ${this.config.enableNetworkRequests ? "✅ Enabled" : "❌ Disabled"}
• Storage: ${this.config.enableStorage ? "✅ Enabled" : "❌ Disabled"}
• Advanced: ${this.config.enableAdvancedFeatures ? "✅ Enabled" : "❌ Disabled"}

**Health:** ${this.systemHealth?.overall || "Unknown"}`
  }

  getHealthReport(): string {
    if (!this.systemHealth) {
      return "⚠️ No health data available"
    }

    let report = `🏥 **System Health Report**\n\n`
    report += `**Overall Status:** ${this.getHealthEmoji(this.systemHealth.overall)} ${this.systemHealth.overall.toUpperCase()}\n\n`

    report += `**Component Status:**\n`
    for (const check of this.systemHealth.checks) {
      report += `• ${this.getHealthEmoji(check.status)} **${check.name}:** ${check.message}\n`
    }

    report += `\n**Last Check:** ${new Date(this.systemHealth.lastCheck).toLocaleTimeString()}`

    return report
  }

  private getHealthEmoji(status: "healthy" | "warning" | "error"): string {
    switch (status) {
      case "healthy":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "❓"
    }
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  getConfiguration(): SafeModeConfig {
    return { ...this.config }
  }

  isInitialized(): boolean {
    return this.initialized
  }
}
