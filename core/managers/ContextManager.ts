export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export class ContextManager {
  private conversationHistory: ChatMessage[] = []
  private maxHistoryLength = 100

  constructor() {
    console.log("💬 ContextManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    try {
      await this.loadConversationHistory()
      console.log("✅ ContextManager: Initialized successfully")
    } catch (error) {
      console.error("❌ ContextManager: Initialization failed:", error)
      throw error
    }
  }

  public async addMessage(message: ChatMessage): Promise<void> {
    this.conversationHistory.push(message)

    // Keep only the last N messages
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength)
    }

    await this.saveConversationHistory()
  }

  public async getConversationHistory(): Promise<ChatMessage[]> {
    return [...this.conversationHistory]
  }

  public getRecentMessages(count = 10): ChatMessage[] {
    return this.conversationHistory.slice(-count)
  }

  public async clearContext(): Promise<void> {
    this.conversationHistory = []
    await this.saveConversationHistory()
  }

  private async loadConversationHistory(): Promise<void> {
    try {
      const stored = localStorage.getItem("zacai_conversation_history")
      if (stored) {
        this.conversationHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.warn("⚠️ ContextManager: Failed to load conversation history:", error)
    }
  }

  private async saveConversationHistory(): Promise<void> {
    try {
      localStorage.setItem("zacai_conversation_history", JSON.stringify(this.conversationHistory))
    } catch (error) {
      console.warn("⚠️ ContextManager: Failed to save conversation history:", error)
    }
  }

  public async exportContext(): Promise<any> {
    return {
      conversationHistory: this.conversationHistory,
      exportDate: new Date().toISOString(),
    }
  }

  public async importContext(data: any): Promise<void> {
    if (data.conversationHistory) {
      this.conversationHistory = data.conversationHistory
      await this.saveConversationHistory()
    }
  }

  public async optimizeContext(): Promise<void> {
    console.log("🔧 ContextManager: Optimizing context...")
    // Remove very old messages beyond max length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength)
      await this.saveConversationHistory()
    }
    console.log("✅ ContextManager: Context optimized")
  }

  public getStats(): any {
    return {
      totalMessages: this.conversationHistory.length,
      userMessages: this.conversationHistory.filter((m) => m.role === "user").length,
      assistantMessages: this.conversationHistory.filter((m) => m.role === "assistant").length,
      maxHistoryLength: this.maxHistoryLength,
    }
  }
}
