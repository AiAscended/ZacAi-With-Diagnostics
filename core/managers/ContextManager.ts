import { SystemConfig } from "../system/config"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export class ContextManager {
  private conversationHistory: ChatMessage[] = []
  private contextWindow: number = SystemConfig.MAX_CONVERSATION_HISTORY

  constructor() {
    console.log("🔄 ContextManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    console.log("🔄 ContextManager: Context management ready")
  }

  public async addMessage(message: ChatMessage): Promise<void> {
    this.conversationHistory.push(message)

    // Maintain context window
    if (this.conversationHistory.length > this.contextWindow) {
      this.conversationHistory = this.conversationHistory.slice(-this.contextWindow)
    }
  }

  public async getConversationHistory(): Promise<ChatMessage[]> {
    return [...this.conversationHistory]
  }

  public getRecentContext(messageCount = 5): ChatMessage[] {
    return this.conversationHistory.slice(-messageCount)
  }

  public async exportContext(): Promise<any> {
    return {
      conversations: this.conversationHistory,
      contextWindow: this.contextWindow,
      exportDate: new Date().toISOString(),
    }
  }

  public async importContext(data: any): Promise<void> {
    if (data.conversations) {
      this.conversationHistory = data.conversations
    }
    if (data.contextWindow) {
      this.contextWindow = data.contextWindow
    }
    console.log("✅ Context import completed")
  }

  public async clearContext(): Promise<void> {
    this.conversationHistory = []
    console.log("✅ Context cleared")
  }

  public async optimizeContext(): Promise<void> {
    // Keep only important conversations
    if (this.conversationHistory.length > this.contextWindow) {
      this.conversationHistory = this.conversationHistory.slice(-this.contextWindow)
    }
    console.log("✅ Context optimization completed")
  }

  public getStats(): any {
    return {
      totalMessages: this.conversationHistory.length,
      contextWindow: this.contextWindow,
      userMessages: this.conversationHistory.filter((m) => m.role === "user").length,
      assistantMessages: this.conversationHistory.filter((m) => m.role === "assistant").length,
    }
  }
}
