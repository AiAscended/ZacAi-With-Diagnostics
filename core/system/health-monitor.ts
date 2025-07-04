interface SystemHealth {
  status: "healthy" | "degraded" | "critical" | "offline"
  errors: string[]
  warnings: string[]
  modules: { [key: string]: boolean }
  lastCheck: number
}

interface DiagnosticResult {
  component: string
  status: "pass" | "fail" | "warning"
  message: string
  timestamp: number
}

export class HealthMonitor {
  private health: SystemHealth = {
    status: "offline",
    errors: [],
    warnings: [],
    modules: {},
    lastCheck: 0,
  }

  private diagnostics: DiagnosticResult[] = []

  constructor() {
    console.log("🏥 HealthMonitor initialized")
  }

  async runDiagnostics(): Promise<SystemHealth> {
    console.log("🔍 Running system diagnostics...")

    this.health = {
      status: "healthy",
      errors: [],
      warnings: [],
      modules: {},
      lastCheck: Date.now(),
    }

    this.diagnostics = []

    // Test 1: Basic JavaScript execution
    this.addDiagnostic("javascript", "pass", "JavaScript engine working")

    // Test 2: LocalStorage availability
    try {
      localStorage.setItem("zacai_health_test", "test")
      localStorage.removeItem("zacai_health_test")
      this.addDiagnostic("localStorage", "pass", "LocalStorage available")
    } catch (error) {
      this.addDiagnostic("localStorage", "warning", "LocalStorage not available")
      this.health.warnings.push("LocalStorage not available")
    }

    // Test 3: Network connectivity
    try {
      const response = await fetch("/seed_vocab.json", { method: "HEAD" })
      if (response.ok) {
        this.addDiagnostic("network", "pass", "Network connectivity OK")
      } else {
        this.addDiagnostic("network", "warning", "Network issues detected")
        this.health.warnings.push("Network connectivity issues")
      }
    } catch (error) {
      this.addDiagnostic("network", "fail", "Network unavailable")
      this.health.errors.push("Network unavailable")
    }

    // Test 4: Core files availability
    const coreFiles = ["/seed_vocab.json", "/seed_maths.json"]
    for (const file of coreFiles) {
      try {
        const response = await fetch(file, { method: "HEAD" })
        if (response.ok) {
          this.addDiagnostic(`file:${file}`, "pass", `${file} available`)
          this.health.modules[file] = true
        } else {
          this.addDiagnostic(`file:${file}`, "warning", `${file} not found`)
          this.health.warnings.push(`${file} not found`)
          this.health.modules[file] = false
        }
      } catch (error) {
        this.addDiagnostic(`file:${file}`, "fail", `${file} failed to load`)
        this.health.errors.push(`${file} failed to load`)
        this.health.modules[file] = false
      }
    }

    // Determine overall health status
    if (this.health.errors.length > 0) {
      this.health.status = "critical"
    } else if (this.health.warnings.length > 0) {
      this.health.status = "degraded"
    } else {
      this.health.status = "healthy"
    }

    console.log(`🏥 Diagnostics complete: ${this.health.status}`)
    return this.health
  }

  private addDiagnostic(component: string, status: "pass" | "fail" | "warning", message: string) {
    this.diagnostics.push({
      component,
      status,
      message,
      timestamp: Date.now(),
    })
  }

  getHealth(): SystemHealth {
    return { ...this.health }
  }

  getDiagnostics(): DiagnosticResult[] {
    return [...this.diagnostics]
  }

  getHealthReport(): string {
    const report = [
      `🏥 **ZacAI System Health Report**`,
      `**Status:** ${this.health.status.toUpperCase()}`,
      `**Last Check:** ${new Date(this.health.lastCheck).toLocaleString()}`,
      ``,
      `**Diagnostics:**`,
    ]

    this.diagnostics.forEach((diag) => {
      const icon = diag.status === "pass" ? "✅" : diag.status === "warning" ? "⚠️" : "❌"
      report.push(`${icon} ${diag.component}: ${diag.message}`)
    })

    if (this.health.errors.length > 0) {
      report.push(``, `**Errors:**`)
      this.health.errors.forEach((error) => report.push(`❌ ${error}`))
    }

    if (this.health.warnings.length > 0) {
      report.push(``, `**Warnings:**`)
      this.health.warnings.forEach((warning) => report.push(`⚠️ ${warning}`))
    }

    return report.join("\n")
  }
}
