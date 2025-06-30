// Context management for conversation tracking
import type { ConversationContext, Message } from "@/types/global"
import { generateId, extractKeywords } from "@/utils/helpers"

export class ContextManager {
  private currentContext: ConversationContext | null = null
  private contextHistory: ConversationContext[] = []
  private maxHistorySize = 10
  private maxMessageHistory = 50

  createContext(): ConversationContext {
    const context: ConversationContext = {
      id: generateId(),
      messages: [],
      userInfo: {},
      preferences: {
        responseStyle: "detailed",
        showThinking: true,
        showSources: true,
      },
      timestamp: Date.now(),
    }

    this.currentContext = context
    return context
  }

  addMessage(message: Omit<Message, "id" | "timestamp">): void {
    if (!this.currentContext) {
      this.createContext()
    }

    const fullMessage: Message = {
      id: generateId(),
      timestamp: Date.now(),
      ...message,
    }

    this.currentContext!.messages.push(fullMessage)

    // Trim message history if too long
    if (this.currentContext!.messages.length > this.maxMessageHistory) {
      this.currentContext!.messages = this.currentContext!.messages.slice(-this.maxMessageHistory)
    }
  }

  extractContext(currentInput: string): any {
    if (!this.currentContext) return {}

    const recentMessages = this.currentContext.messages.slice(-5)
    const keywords = extractKeywords(currentInput)

    // Extract context from recent conversation
    const conversationKeywords = recentMessages.flatMap((msg) => extractKeywords(msg.content)).slice(0, 20)

    return {
      recentMessages,
      keywords,
      conversationKeywords,
      conversationLength: this.currentContext.messages.length,
      userPreferences: this.currentContext.preferences,
      sessionDuration: Date.now() - this.currentContext.timestamp,
    }
  }

  updateUserInfo(info: any): void {
    if (this.currentContext) {
      this.currentContext.userInfo = { ...this.currentContext.userInfo, ...info }
    }
  }

  updatePreferences(preferences: any): void {
    if (this.currentContext) {
      this.currentContext.preferences = { ...this.currentContext.preferences, ...preferences }
    }
  }

  saveContext(): void {
    if (this.currentContext) {
      this.contextHistory.unshift(this.currentContext)

      // Trim history
      if (this.contextHistory.length > this.maxHistorySize) {
        this.contextHistory = this.contextHistory.slice(0, this.maxHistorySize)
      }
    }
  }

  loadContext(contextId: string): ConversationContext | null {
    const context = this.contextHistory.find((ctx) => ctx.id === contextId)
    if (context) {
      this.currentContext = context
      return context
    }
    return null
  }

  getCurrentContext(): ConversationContext | null {
    return this.currentContext
  }

  getContextStats(): any {
    return {
      messageCount: this.currentContext?.messages.length || 0,
      duration: this.currentContext ? Date.now() - this.currentContext.timestamp : 0,
      historySize: this.contextHistory.length,
    }
  }

  clearContext(): void {
    this.saveContext()
    this.currentContext = null
  }
}

export const contextManager = new ContextManager()
