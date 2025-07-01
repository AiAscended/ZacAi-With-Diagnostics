import type { ContextMessage } from "@/types/global"

export class ContextManager {
  private conversations: Map<string, ContextMessage[]> = new Map()
  private maxContextLength = 50
  private maxMessageAge = 24 * 60 * 60 * 1000 // 24 hours
  private messages: ContextMessage[] = []
  private maxMessages = 50
  private currentContext: any = {}

  createContext(): void {
    this.currentContext = {
      sessionId: Date.now().toString(),
      startTime: Date.now(),
      messageCount: 0,
      topics: [],
      userPreferences: {},
    }
  }

  addMessage(conversationId: string, message: ContextMessage): void {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, [])
    }

    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    }

    const messages = this.conversations.get(conversationId)!
    messages.push(messageWithTimestamp)
    this.currentContext.messageCount++

    // Keep only the last N messages
    if (messages.length > this.maxContextLength) {
      messages.splice(0, messages.length - this.maxContextLength)
    }

    // Extract topics and update context
    this.updateContextFromMessage(messageWithTimestamp)

    // Trim old messages
    this.trimContext(conversationId)
  }

  getContext(conversationId: string, maxMessages?: number): ContextMessage[] {
    const messages = this.conversations.get(conversationId) || []
    const limit = maxMessages || this.maxContextLength

    // Remove expired messages
    const now = Date.now()
    const validMessages = messages.filter((msg) => now - (msg.timestamp || 0) < this.maxMessageAge)

    return validMessages.slice(-limit)
  }

  getLastMessage(conversationId: string): ContextMessage | null {
    const messages = this.conversations.get(conversationId) || []
    return messages.length > 0 ? messages[messages.length - 1] : null
  }

  clearContext(conversationId: string): void {
    this.conversations.delete(conversationId)
  }

  getAllConversations(): string[] {
    return Array.from(this.conversations.keys())
  }

  getConversationSummary(conversationId: string): {
    messageCount: number
    firstMessage?: number
    lastMessage?: number
  } {
    const messages = this.conversations.get(conversationId) || []

    if (messages.length === 0) {
      return { messageCount: 0 }
    }

    return {
      messageCount: messages.length,
      firstMessage: messages[0].timestamp,
      lastMessage: messages[messages.length - 1].timestamp,
    }
  }

  private trimContext(conversationId: string): void {
    const messages = this.conversations.get(conversationId)!

    if (messages.length > this.maxContextLength) {
      messages.splice(0, messages.length - this.maxContextLength)
    }

    // Remove expired messages
    const now = Date.now()
    const validMessages = messages.filter((msg) => now - (msg.timestamp || 0) < this.maxMessageAge)

    this.conversations.set(conversationId, validMessages)
  }

  setMaxContextLength(length: number): void {
    this.maxContextLength = length
  }

  setMaxMessageAge(ageMs: number): void {
    this.maxMessageAge = ageMs
  }

  extractContext(input: string): any {
    const recentMessages = this.messages.slice(-5) // Last 5 messages
    const keywords = this.extractKeywords(input)

    return {
      recentMessages,
      keywords,
      sessionInfo: this.currentContext,
      conversationLength: this.messages.length,
      lastUserMessage: this.getLastUserMessage(),
      topics: this.currentContext.topics,
    }
  }

  private updateContextFromMessage(message: ContextMessage): void {
    if (message.role === "user") {
      const keywords = this.extractKeywords(message.content)

      // Add new topics
      keywords.forEach((keyword) => {
        if (!this.currentContext.topics.includes(keyword)) {
          this.currentContext.topics.push(keyword)
        }
      })

      // Keep only recent topics
      if (this.currentContext.topics.length > 20) {
        this.currentContext.topics = this.currentContext.topics.slice(-20)
      }
    }
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 10)
  }

  private getLastUserMessage(): ContextMessage | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === "user") {
        return this.messages[i]
      }
    }
    return null
  }

  getContextStats(): any {
    return {
      totalMessages: this.messages.length,
      sessionDuration: Date.now() - this.currentContext.startTime,
      topicsDiscussed: this.currentContext.topics.length,
      averageMessageLength: this.calculateAverageMessageLength(),
    }
  }

  private calculateAverageMessageLength(): number {
    if (this.messages.length === 0) return 0
    const totalLength = this.messages.reduce((sum, msg) => sum + msg.content.length, 0)
    return Math.round(totalLength / this.messages.length)
  }

  exportContext(): any {
    return {
      messages: this.messages,
      context: this.currentContext,
      exportTimestamp: Date.now(),
    }
  }

  importContext(data: any): void {
    if (data.messages) {
      this.messages = data.messages
    }
    if (data.context) {
      this.currentContext = data.context
    }
  }
}

export const contextManager = new ContextManager()
