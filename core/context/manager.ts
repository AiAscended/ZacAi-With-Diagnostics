import type { ContextMessage } from "@/types/global"

export class ContextManager {
  private context: ContextMessage[] = []
  private maxContextLength = 10
  private currentSessionId = ""

  createContext(sessionId?: string): void {
    this.currentSessionId = sessionId || `session_${Date.now()}`
    this.context = []
    console.log(`✅ Context created for session: ${this.currentSessionId}`)
  }

  addMessage(message: ContextMessage): void {
    this.context.push({
      ...message,
      metadata: {
        ...message.metadata,
        timestamp: Date.now(),
        sessionId: this.currentSessionId,
      },
    })

    // Trim context if it exceeds max length
    if (this.context.length > this.maxContextLength) {
      this.context = this.context.slice(-this.maxContextLength)
    }
  }

  getContext(): ContextMessage[] {
    return [...this.context]
  }

  getLastMessage(): ContextMessage | null {
    return this.context.length > 0 ? this.context[this.context.length - 1] : null
  }

  getLastUserMessage(): ContextMessage | null {
    for (let i = this.context.length - 1; i >= 0; i--) {
      if (this.context[i].role === "user") {
        return this.context[i]
      }
    }
    return null
  }

  extractContext(input: string): any {
    const recentMessages = this.context.slice(-5) // Last 5 messages
    const userMessages = this.context.filter((msg) => msg.role === "user")
    const assistantMessages = this.context.filter((msg) => msg.role === "assistant")

    return {
      currentInput: input,
      recentMessages,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      sessionId: this.currentSessionId,
      contextLength: this.context.length,
      lastInteraction: this.getLastMessage()?.metadata?.timestamp || 0,
    }
  }

  clearContext(): void {
    this.context = []
  }

  getContextStats() {
    return {
      messageCount: this.context.length,
      userMessages: this.context.filter((msg) => msg.role === "user").length,
      assistantMessages: this.context.filter((msg) => msg.role === "assistant").length,
      sessionId: this.currentSessionId,
      maxLength: this.maxContextLength,
    }
  }

  exportContext(): any {
    return {
      sessionId: this.currentSessionId,
      messages: this.context,
      stats: this.getContextStats(),
      exportTimestamp: Date.now(),
    }
  }

  importContext(data: any): void {
    if (data && data.messages) {
      this.currentSessionId = data.sessionId || `imported_${Date.now()}`
      this.context = data.messages
      console.log(`✅ Context imported for session: ${this.currentSessionId}`)
    }
  }

  setMaxContextLength(length: number): void {
    this.maxContextLength = length

    // Trim current context if needed
    if (this.context.length > this.maxContextLength) {
      this.context = this.context.slice(-this.maxContextLength)
    }
  }
}

export const contextManager = new ContextManager()
