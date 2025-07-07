interface ContextMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: number
  metadata?: any
}

interface ConversationContext {
  messages: ContextMessage[]
  sessionId: string
  startTime: number
  lastActivity: number
  messageCount: number
}

class ContextManager {
  private context: ConversationContext | null = null
  private maxMessages = 50 // Keep last 50 messages for context
  private sessionTimeout = 30 * 60 * 1000 // 30 minutes

  async createContext(): Promise<void> {
    this.context = {
      messages: [],
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
    }

    console.log("📝 Context Manager initialized")
  }

  addMessage(message: ContextMessage): void {
    if (!this.context) {
      this.createContext()
    }

    const contextMessage: ContextMessage = {
      ...message,
      timestamp: Date.now(),
    }

    this.context!.messages.push(contextMessage)
    this.context!.lastActivity = Date.now()
    this.context!.messageCount++

    // Keep only recent messages to prevent memory bloat
    if (this.context!.messages.length > this.maxMessages) {
      this.context!.messages = this.context!.messages.slice(-this.maxMessages)
    }
  }

  extractContext(currentInput: string): any {
    if (!this.context) {
      return {
        sessionId: "no-context",
        messageCount: 0,
        recentMessages: [],
        currentInput,
      }
    }

    // Get recent messages for context
    const recentMessages = this.context.messages
      .slice(-5) // Last 5 messages
      .map((msg) => ({
        role: msg.role,
        content: msg.content.substring(0, 100), // Truncate for context
      }))

    return {
      sessionId: this.context.sessionId,
      messageCount: this.context.messageCount,
      recentMessages,
      currentInput,
      sessionDuration: Date.now() - this.context.startTime,
    }
  }

  getContextStats(): any {
    if (!this.context) {
      return {
        active: false,
        messageCount: 0,
        sessionDuration: 0,
      }
    }

    return {
      active: true,
      sessionId: this.context.sessionId,
      messageCount: this.context.messageCount,
      sessionDuration: Date.now() - this.context.startTime,
      lastActivity: this.context.lastActivity,
      messagesInMemory: this.context.messages.length,
    }
  }

  clearContext(): void {
    this.context = null
    console.log("🗑️ Context cleared")
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Check if session has expired
  isSessionExpired(): boolean {
    if (!this.context) return true
    return Date.now() - this.context.lastActivity > this.sessionTimeout
  }

  // Get conversation summary for long-term memory
  getConversationSummary(): string {
    if (!this.context || this.context.messages.length === 0) {
      return "No conversation history"
    }

    const userMessages = this.context.messages
      .filter((msg) => msg.role === "user")
      .slice(-10) // Last 10 user messages
      .map((msg) => msg.content)

    return `Recent topics: ${userMessages.join("; ")}`
  }
}

export const contextManager = new ContextManager()
