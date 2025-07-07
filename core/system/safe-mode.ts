import { HealthMonitor, type SystemHealth } from "./health-monitor"

export interface SafeModeConfig {
  enableModules: boolean
  enableNetworkRequests: boolean
  enableStorage: boolean
  enableAdvancedFeatures: boolean
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
      fallbackMode: false,
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log("🛡️ SafeMode: Initializing system...")
      this.systemHealth = await this.healthMonitor.runHealthChecks()
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

    for (const check of this.systemHealth.checks) {
      if (check.status === "error") {
        switch (check.name) {
          case "Local Storage":
            this.config.enableStorage = false
            console.warn("⚠️ SafeMode: Storage disabled due to health check failure.")
            break
          case "Network":
            this.config.enableNetworkRequests = false
            console.warn("⚠️ SafeMode: Network requests disabled due to health check failure.")
            break
          case "Memory":
            this.config.enableAdvancedFeatures = false
            console.warn("⚠️ SafeMode: Advanced features disabled due to memory issues.")
            break
        }
      }
    }

    if (this.systemHealth.overall === "error") {
      this.enableFallbackMode()
    }
  }

  private enableFallbackMode(): void {
    console.error("🚨 SafeMode: Critical errors detected. Enabling fallback mode.")
    this.config = {
      enableModules: false,
      enableNetworkRequests: false,
      enableStorage: false,
      enableAdvancedFeatures: false,
      fallbackMode: true,
    }
  }

  canUseFeature(feature: keyof Omit<SafeModeConfig, "fallbackMode">): boolean {
    return this.config[feature]
  }

  getSystemHealth(): SystemHealth | null {
    return this.systemHealth
  }

  getConfiguration(): SafeModeConfig {
    return { ...this.config }
  }

  isInitialized(): boolean {
    return this.initialized
  }
}
