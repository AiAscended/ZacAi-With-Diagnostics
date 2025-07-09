import { SystemConfig } from "../system/config"

export interface ConversationContext {
  id: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: number
    metadata?: any
  }>
  startTime: number
  lastActivity: number
  topic?: string
  importance: number
  summary?: string
}

export interface TemporalContext {
  sessionStart: number
  lastInteraction: number
  interactionCount: number
  patterns: Map<string, number>
  timeOfDay: string
  dayOfWeek: string
}

export class ContextManager {
  private conversations: Map<string, ConversationContext> = new Map()
  private currentConversationId: string | null = null
  private temporalContext: TemporalContext
  private contextHistory: Array<{ timestamp: number; context: any }> = []

  constructor() {
    console.log("🧠 ContextManager: Initializing...")
    this.temporalContext = {
      sessionStart: Date.now(),
      lastInteraction: Date.now(),
      interactionCount: 0,
      patterns: new Map(),
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
    }
  }

  public async initialize(): Promise<void> {
    console.log("🧠 ContextManager: Loading conversation history...")
    // Load existing conversations from storage
    await this.loadConversationHistory()
    console.log("✅ ContextManager: Initialized successfully")
  }

  public startNewConversation(): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const conversation: ConversationContext = {
      id: conversationId,
      messages: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      importance: 0.5,
    }

    this.conversations.set(conversationId, conversation)
    this.currentConversationId = conversationId

    console.log(`💬 Started new conversation: ${conversationId}`)
    return conversationId
  }

  public addMessage(role: "user" | "assistant", content: string, metadata?: any): void {
    if (!this.currentConversationId) {
      this.startNewConversation()
    }

    const conversation = this.conversations.get(this.currentConversationId!)
    if (!conversation) return

    const message = {
      role,
      content,
      timestamp: Date.now(),
      metadata,
    }

    conversation.messages.push(message)
    conversation.lastActivity = Date.now()
    this.temporalContext.lastInteraction = Date.now()
    this.temporalContext.interactionCount++

    // Update conversation importance based on length and recency
    conversation.importance = this.calculateImportance(conversation)

    // Extract and store patterns
    this.extractPatterns(content)

    console.log(`📝 Added ${role} message to conversation ${this.currentConversationId}`)
  }

  public getCurrentContext(): any {
    const conversation = this.currentConversationId ? this.conversations.get(this.currentConversationId) : null

    return {
      conversationId: this.currentConversationId,
      conversation,
      temporal: this.temporalContext,
      recentMessages: conversation ? conversation.messages.slice(-5) : [],
      sessionDuration: Date.now() - this.temporalContext.sessionStart,
      patterns: Array.from(this.temporalContext.patterns.entries()),
    }
  }

  public getConversationHistory(): ConversationContext[] {
    return Array.from(this.conversations.values()).sort((a, b) => b.lastActivity - a.lastActivity)
  }

  public switchToConversation(conversationId: string): boolean {
    if (this.conversations.has(conversationId)) {
      this.currentConversationId = conversationId
      console.log(`🔄 Switched to conversation: ${conversationId}`)
      return true
    }
    return false
  }

  public summarizeConversation(conversationId: string): string {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return ""

    const messageCount = conversation.messages.length
    const duration = conversation.lastActivity - conversation.startTime
    const topics = this.extractTopics(conversation.messages)

    return `Conversation with ${messageCount} messages over ${Math.round(duration / 60000)} minutes. Topics: ${topics.join(", ")}`
  }

  public getRelevantContext(query: string): any {
    const currentContext = this.getCurrentContext()
    const relevantConversations = this.findRelevantConversations(query)
    const temporalRelevance = this.getTemporalRelevance()

    return {
      current: currentContext,
      relevant: relevantConversations,
      temporal: temporalRelevance,
      patterns: this.getRelevantPatterns(query),
    }
  }

  public cleanupOldConversations(): void {
    const maxAge = SystemConfig.CLEANUP_INTERVAL * 10 // 50 minutes
    const now = Date.now()

    for (const [id, conversation] of this.conversations.entries()) {
      if (now - conversation.lastActivity > maxAge && conversation.importance < 0.3) {
        this.conversations.delete(id)
        console.log(`🗑️ Cleaned up old conversation: ${id}`)
      }
    }
  }

  public exportContext(): any {
    return {
      conversations: Array.from(this.conversations.entries()),
      temporal: this.temporalContext,
      history: this.contextHistory,
    }
  }

  public importContext(data: any): void {
    if (data.conversations) {
      this.conversations = new Map(data.conversations)
    }
    if (data.temporal) {
      this.temporalContext = { ...this.temporalContext, ...data.temporal }
    }
    if (data.history) {
      this.contextHistory = data.history
    }
    console.log("📥 Context data imported successfully")
  }

  private async loadConversationHistory(): Promise<void> {
    // This would load from storage in a real implementation
    // For now, we'll start fresh each session
  }

  private calculateImportance(conversation: ConversationContext): number {
    const messageCount = conversation.messages.length
    const recency = Date.now() - conversation.lastActivity
    const duration = conversation.lastActivity - conversation.startTime

    // More messages, more recent, longer duration = higher importance
    const messageScore = Math.min(messageCount / 20, 1)
    const recencyScore = Math.max(0, 1 - recency / (24 * 60 * 60 * 1000)) // 24 hours
    const durationScore = Math.min(duration / (60 * 60 * 1000), 1) // 1 hour max

    return (messageScore + recencyScore + durationScore) / 3
  }

  private extractPatterns(content: string): void {
    const words = content.toLowerCase().split(/\s+/)
    words.forEach((word) => {
      if (word.length > 3) {
        const count = this.temporalContext.patterns.get(word) || 0
        this.temporalContext.patterns.set(word, count + 1)
      }
    })
  }

  private extractTopics(messages: any[]): string[] {
    const topics = new Set<string>()
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ])

    messages.forEach((message) => {
      const words = message.content.toLowerCase().split(/\s+/)
      words.forEach((word) => {
        if (word.length > 4 && !commonWords.has(word)) {
          topics.add(word)
        }
      })
    })

    return Array.from(topics).slice(0, 5)
  }

  private findRelevantConversations(query: string): ConversationContext[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const scored = Array.from(this.conversations.values()).map((conv) => {
      let score = 0
      const content = conv.messages
        .map((m) => m.content)
        .join(" ")
        .toLowerCase()

      queryWords.forEach((word) => {
        if (content.includes(word)) {
          score += 1
        }
      })

      return { conversation: conv, score }
    })

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.conversation)
  }

  private getTemporalRelevance(): any {
    return {
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      sessionDuration: Date.now() - this.temporalContext.sessionStart,
      interactionFrequency:
        this.temporalContext.interactionCount / ((Date.now() - this.temporalContext.sessionStart) / 60000),
    }
  }

  private getRelevantPatterns(query: string): Array<[string, number]> {
    const queryWords = query.toLowerCase().split(/\s+/)
    const relevantPatterns: Array<[string, number]> = []

    for (const [pattern, count] of this.temporalContext.patterns.entries()) {
      if (queryWords.some((word) => pattern.includes(word) || word.includes(pattern))) {
        relevantPatterns.push([pattern, count])
      }
    }

    return relevantPatterns.sort((a, b) => b[1] - a[1]).slice(0, 10)
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours()
    if (hour < 6) return "night"
    if (hour < 12) return "morning"
    if (hour < 18) return "afternoon"
    return "evening"
  }

  private getDayOfWeek(): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[new Date().getDay()]
  }

  public getStats(): any {
    return {
      totalConversations: this.conversations.size,
      currentConversation: this.currentConversationId,
      totalMessages: Array.from(this.conversations.values()).reduce((sum, conv) => sum + conv.messages.length, 0),
      sessionDuration: Date.now() - this.temporalContext.sessionStart,
      interactionCount: this.temporalContext.interactionCount,
      uniquePatterns: this.temporalContext.patterns.size,
    }
  }
}
