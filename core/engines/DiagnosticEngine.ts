export class DiagnosticEngine {
  private isInitialized = false
  private diagnostics: any[] = []

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("🔧 DiagnosticEngine: Initialized")
    this.isInitialized = true
  }

  public logInteraction(userMessage: string, response: any): void {
    this.diagnostics.push({
      userMessage,
      response: response.content,
      confidence: response.confidence,
      timestamp: Date.now(),
    })

    // Keep only recent diagnostics
    if (this.diagnostics.length > 50) {
      this.diagnostics = this.diagnostics.slice(-30)
    }
  }

  public getStats(): any {
    return {
      initialized: this.isInitialized,
      totalInteractions: this.diagnostics.length,
    }
  }

  public exportData(): any {
    return { diagnostics: this.diagnostics }
  }

  public importData(data: any): void {
    if (data.diagnostics) {
      this.diagnostics = data.diagnostics
    }
  }

  public clearData(): void {
    this.diagnostics = []
  }
}
