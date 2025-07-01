import type { ContextMessage } from "@/types/global"

export class ContextManager {
  private conversations: Map<string, ContextMessage[]> = new Map()
  private maxContextLength = 50
  private maxMessageAge = 24 * 60 * 60 * 1000 // 24 hours

  addMessage(conversationId: string, message: ContextMessage): void {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, [])
    }

    const messages = this.conversations.get(conversationId)!
    messages.push({
      ...message,
      timestamp: message.timestamp || Date.now(),
    })

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
}

export const contextManager = new ContextManager()
