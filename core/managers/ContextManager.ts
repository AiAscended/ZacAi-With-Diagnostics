export class ContextManager {
  private isInitialized = false
  private context: any = {
    conversationHistory: [],
    userPreferences: {},
    sessionData: {},
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("🔄 ContextManager: Initialized")
    this.isInitialized = true
  }

  public async getContext(): Promise<any> {
    return { ...this.context }
  }

  public async updateContext(userMessage: string, response: any): Promise<void> {
    this.context.conversationHistory.push({
      user: userMessage,
      assistant: response.content,
      timestamp: Date.now(),
    })

    // Keep only recent history
    if (this.context.conversationHistory.length > 20) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-15)
    }
  }

  public async exportData(): Promise<any> {
    return { ...this.context }
  }

  public async importData(data: any): Promise<void> {
    this.context = { ...this.context, ...data }
  }

  public async clearData(): Promise<void> {
    this.context = {
      conversationHistory: [],
      userPreferences: {},
      sessionData: {},
    }
  }
}
