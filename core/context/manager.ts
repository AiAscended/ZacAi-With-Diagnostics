import type { ConversationContext, Message } from "@/types/global"
import { generateId } from "@/utils/helpers"

export class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map()
  private currentContextId: string | null = null

  createContext(userInfo?: any): string {
    const contextId = generateId()
    const context: ConversationContext = {
      id: contextId,
      messages: [],
      userInfo: userInfo || {},
      preferences: {},
      timestamp: Date.now(),
    }

    this.contexts.set(contextId, context)
    this.currentContextId = contextId
    return contextId
  }

  getCurrentContext(): ConversationContext | null {
    if (!this.currentContextId) return null
    return this.contexts.get(this.currentContextId) || null
  }

  addMessage(message: Omit<Message, "id" | "timestamp">): void {
    const context = this.getCurrentContext()
    if (!context) return

    const fullMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    }

    context.messages.push(fullMessage)

    // Keep only last 50 messages for performance
    if (context.messages.length > 50) {
      context.messages = context.messages.slice(-50)
    }
  }

  getRecentMessages(count = 10): Message[] {
    const context = this.getCurrentContext()
    if (!context) return []

    return context.messages.slice(-count)
  }

  extractContext(input: string): any {
    const context = this.getCurrentContext()
    if (!context) return {}

    const recentMessages = this.getRecentMessages(5)
    const keywords = this.extractKeywords(input)

    return {
      recentMessages,
      keywords,
      userInfo: context.userInfo,
      preferences: context.preferences,
      conversationLength: context.messages.length,
    }
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
      .slice(0, 10) // Top 10 keywords
  }

  updateUserInfo(info: any): void {
    const context = this.getCurrentContext()
    if (context) {
      context.userInfo = { ...context.userInfo, ...info }
    }
  }

  updatePreferences(preferences: any): void {
    const context = this.getCurrentContext()
    if (context) {
      context.preferences = { ...context.preferences, ...preferences }
    }
  }

  clearContext(): void {
    if (this.currentContextId) {
      this.contexts.delete(this.currentContextId)
      this.currentContextId = null
    }
  }

  getContextStats(): any {
    const context = this.getCurrentContext()
    if (!context) return null

    return {
      messageCount: context.messages.length,
      duration: Date.now() - context.timestamp,
      userMessages: context.messages.filter((m) => m.role === "user").length,
      assistantMessages: context.messages.filter((m) => m.role === "assistant").length,
    }
  }
}

export const contextManager = new ContextManager()
