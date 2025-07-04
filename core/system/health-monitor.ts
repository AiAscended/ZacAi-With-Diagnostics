export interface SystemHealth {
  status: "healthy" | "warning" | "error"
  uptime: number
  errors: string[]
  warnings: string[]
  lastCheck: number
}

export interface ComponentHealth {
  name: string
  status: "online" | "offline" | "error"
  lastResponse: number
  errorCount: number
  lastError?: string
}

export class HealthMonitor {
  private startTime: number
  private errors: string[] = []
  private warnings: string[] = []
  private components: Map<string, ComponentHealth> = new Map()

  constructor() {
    this.startTime = Date.now()
  }

  logError(component: string, error: string): void {
    this.errors.push(`[${component}] ${error}`)

    const comp = this.components.get(component) || {
      name: component,
      status: "error",
      lastResponse: 0,
      errorCount: 0,
    }

    comp.status = "error"
    comp.errorCount++
    comp.lastError = error
    this.components.set(component, comp)
  }

  logWarning(component: string, warning: string): void {
    this.warnings.push(`[${component}] ${warning}`)
  }

  registerComponent(name: string): void {
    this.components.set(name, {
      name,
      status: "online",
      lastResponse: Date.now(),
      errorCount: 0,
    })
  }

  updateComponent(name: string, status: "online" | "offline" | "error"): void {
    const comp = this.components.get(name)
    if (comp) {
      comp.status = status
      comp.lastResponse = Date.now()
      this.components.set(name, comp)
    }
  }

  getHealth(): SystemHealth {
    const hasErrors = this.errors.length > 0
    const hasWarnings = this.warnings.length > 0

    return {
      status: hasErrors ? "error" : hasWarnings ? "warning" : "healthy",
      uptime: Date.now() - this.startTime,
      errors: this.errors.slice(-10), // Last 10 errors
      warnings: this.warnings.slice(-10), // Last 10 warnings
      lastCheck: Date.now(),
    }
  }

  getComponents(): ComponentHealth[] {
    return Array.from(this.components.values())
  }

  reset(): void {
    this.errors = []
    this.warnings = []
    this.components.clear()
  }
}
