// Context management for conversation flow and user state
import type { ContextMessage } from "@/types/global"

interface ConversationContext {
  id: string
  messages: ContextMessage[]
  topics: string[]
  entities: any[]
  userPreferences: any
  sessionStart: number
  lastActivity: number
  messageCount: number
  conversationFlow: "new" | "continuing" | "follow_up" | "topic_change"
}

export class ContextManager {
  private currentContext: ConversationContext | null = null
  private contextHistory: ConversationContext[] = []
  private readonly MAX_CONTEXT_MESSAGES = 50
  private readonly MAX_CONTEXT_HISTORY = 10
  private readonly SESSION_TIMEOUT = 1800000 // 30 minutes

  createContext(userId?: string): ConversationContext {
    const context: ConversationContext = {
      id: this.generateContextId(),
      messages: [],
      topics: [],
      entities: [],
      userPreferences: {},
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      conversationFlow: "new",
    }

    this.currentContext = context
    console.log(`🆕 Created new conversation context: ${context.id}`)

    return context
  }

  addMessage(message: Omit<ContextMessage, "timestamp">): void {
    if (!this.currentContext) {
      this.createContext()
    }

    const fullMessage: ContextMessage = {
      ...message,
      timestamp: Date.now(),
    }

    this.currentContext!.messages.push(fullMessage)
    this.currentContext!.messageCount++
    this.currentContext!.lastActivity = Date.now()

    // Update conversation flow
    this.updateConversationFlow(fullMessage)

    // Extract topics and entities
    this.extractTopicsAndEntities(fullMessage.content)

    // Trim old messages if needed
    if (this.currentContext!.messages.length > this.MAX_CONTEXT_MESSAGES) {
      this.currentContext!.messages = this.currentContext!.messages.slice(-this.MAX_CONTEXT_MESSAGES)
    }

    console.log(`💬 Added ${message.role} message to context`)
  }

  extractContext(input: string): any {
    if (!this.currentContext) {
      return {
        topics: [],
        entities: [],
        conversationFlow: "new",
        sessionDuration: 0,
        messageCount: 0,
        recentMessages: [],
        userPreferences: {},
      }
    }

    const sessionDuration = Date.now() - this.currentContext.sessionStart
    const recentMessages = this.currentContext.messages.slice(-5)

    return {
      topics: this.currentContext.topics,
      entities: this.currentContext.entities,
      conversationFlow: this.currentContext.conversationFlow,
      sessionDuration,
      messageCount: this.currentContext.messageCount,
      recentMessages,
      userPreferences: this.currentContext.userPreferences,
      contextId: this.currentContext.id,
    }
  }

  private updateConversationFlow(message: ContextMessage): void {
    if (!this.currentContext) return

    const messages = this.currentContext.messages
    const messageCount = messages.length

    if (messageCount <= 2) {
      this.currentContext.conversationFlow = "new"
    } else if (message.role === "user") {
      const lastUserMessage = messages
        .slice(0, -1)
        .reverse()
        .find((m) => m.role === "user")

      if (lastUserMessage) {
        const timeDiff = message.timestamp! - lastUserMessage.timestamp!
        const contentSimilarity = this.calculateContentSimilarity(message.content, lastUserMessage.content)

        if (timeDiff < 30000 && contentSimilarity > 0.6) {
          this.currentContext.conversationFlow = "follow_up"
        } else if (this.hasTopicChange(message.content)) {
          this.currentContext.conversationFlow = "topic_change"
        } else {
          this.currentContext.conversationFlow = "continuing"
        }
      }
    }
  }

  private extractTopicsAndEntities(content: string): void {
    if (!this.currentContext) return

    // Simple topic extraction
    const topics = this.extractTopics(content)
    const entities = this.extractEntities(content)

    // Add new topics
    topics.forEach((topic) => {
      if (!this.currentContext!.topics.includes(topic)) {
        this.currentContext!.topics.push(topic)
      }
    })

    // Add new entities
    entities.forEach((entity) => {
      const existing = this.currentContext!.entities.find((e) => e.value === entity.value)
      if (!existing) {
        this.currentContext!.entities.push(entity)
      }
    })

    // Keep only recent topics and entities
    if (this.currentContext.topics.length > 20) {
      this.currentContext.topics = this.currentContext.topics.slice(-20)
    }
    if (this.currentContext.entities.length > 50) {
      this.currentContext.entities = this.currentContext.entities.slice(-50)
    }
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = []
    const lowercaseContent = content.toLowerCase()

    // Domain-specific keywords
    const topicKeywords = {
      mathematics: ["math", "calculate", "equation", "number", "formula", "algebra"],
      science: ["science", "physics", "chemistry", "biology", "research"],
      technology: ["code", "program", "computer", "software", "algorithm"],
      philosophy: ["philosophy", "ethics", "moral", "meaning", "existence"],
      vocabulary: ["define", "word", "meaning", "definition", "synonym"],
    }

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => lowercaseContent.includes(keyword))) {
        topics.push(topic)
      }
    }

    return topics
  }

  private extractEntities(content: string): any[] {
    const entities: any[] = []

    // Extract numbers
    const numbers = content.match(/\d+/g)
    if (numbers) {
      numbers.forEach((num) => {
        entities.push({
          type: "number",
          value: num,
          confidence: 0.9,
        })
      })
    }

    // Extract capitalized words (potential proper nouns)
    const properNouns = content.match(/\b[A-Z][a-z]+\b/g)
    if (properNouns) {
      properNouns.forEach((noun) => {
        entities.push({
          type: "proper_noun",
          value: noun,
          confidence: 0.7,
        })
      })
    }

    return entities
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/))
    const words2 = new Set(content2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter((x) => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  private hasTopicChange(content: string): boolean {
    if (!this.currentContext) return false

    const currentTopics = this.extractTopics(content)
    const existingTopics = this.currentContext.topics

    // If new topics are introduced that weren't in recent conversation
    return currentTopics.some((topic) => !existingTopics.includes(topic))
  }

  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Session management
  isSessionActive(): boolean {
    if (!this.currentContext) return false

    const timeSinceLastActivity = Date.now() - this.currentContext.lastActivity
    return timeSinceLastActivity < this.SESSION_TIMEOUT
  }

  extendSession(): void {
    if (this.currentContext) {
      this.currentContext.lastActivity = Date.now()
    }
  }

  endSession(): void {
    if (this.currentContext) {
      // Archive current context
      this.contextHistory.push({ ...this.currentContext })

      // Trim history
      if (this.contextHistory.length > this.MAX_CONTEXT_HISTORY) {
        this.contextHistory = this.contextHistory.slice(-this.MAX_CONTEXT_HISTORY)
      }

      console.log(`📝 Archived context session: ${this.currentContext.id}`)
      this.currentContext = null
    }
  }

  // Context retrieval and management
  getCurrentContext(): ConversationContext | null {
    return this.currentContext
  }

  getContextHistory(): ConversationContext[] {
    return [...this.contextHistory]
  }

  getContextStats(): any {
    return {
      currentSession: this.currentContext
        ? {
            id: this.currentContext.id,
            messageCount: this.currentContext.messageCount,
            topicCount: this.currentContext.topics.length,
            entityCount: this.currentContext.entities.length,
            sessionDuration: Date.now() - this.currentContext.sessionStart,
            conversationFlow: this.currentContext.conversationFlow,
          }
        : null,
      historyCount: this.contextHistory.length,
      isSessionActive: this.isSessionActive(),
    }
  }

  // Import/Export for persistence
  exportContext(): any {
    return {
      currentContext: this.currentContext,
      contextHistory: this.contextHistory,
      exportTimestamp: Date.now(),
    }
  }

  importContext(data: any): void {
    if (data.currentContext) {
      this.currentContext = data.currentContext
    }
    if (data.contextHistory) {
      this.contextHistory = data.contextHistory
    }
    console.log("📥 Context data imported successfully")
  }

  // Utility methods
  clearContext(): void {
    this.currentContext = null
    this.contextHistory = []
    console.log("🗑️ Context cleared")
  }

  searchContextHistory(query: string): ConversationContext[] {
    return this.contextHistory.filter((context) =>
      context.messages.some((message) => message.content.toLowerCase().includes(query.toLowerCase())),
    )
  }
}

export const contextManager = new ContextManager()
