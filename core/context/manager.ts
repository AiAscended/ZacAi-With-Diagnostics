import type { ContextMessage } from "@/types/global"

export class ContextManager {
  private messages: ContextMessage[] = []
  private maxMessages = 50
  private currentContext: any = {}

  createContext(): void {
    this.currentContext = {
      sessionId: Date.now().toString(),
      startTime: Date.now(),
      messageCount: 0,
      topics: new Set(),
      entities: new Map(),
      preferences: new Map(),
    }
  }

  addMessage(message: ContextMessage): void {
    const fullMessage: ContextMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    }

    this.messages.push(fullMessage)
    this.currentContext.messageCount++

    // Extract topics and entities
    this.extractContextFromMessage(fullMessage)

    // Maintain message limit
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages)
    }
  }

  extractContext(input: string): any {
    const recentMessages = this.messages.slice(-10)
    const topics = Array.from(this.currentContext.topics)
    const entities = Object.fromEntries(this.currentContext.entities)

    return {
      recentMessages,
      topics,
      entities,
      sessionInfo: {
        messageCount: this.currentContext.messageCount,
        sessionDuration: Date.now() - this.currentContext.startTime,
      },
      currentInput: input,
    }
  }

  private extractContextFromMessage(message: ContextMessage): void {
    const content = message.content.toLowerCase()

    // Extract simple topics
    const topicKeywords = ["math", "vocabulary", "code", "philosophy", "science", "history"]
    topicKeywords.forEach((topic) => {
      if (content.includes(topic)) {
        this.currentContext.topics.add(topic)
      }
    })

    // Extract entities (simple name detection)
    const nameMatches = content.match(/my name is (\w+)/i)
    if (nameMatches) {
      this.currentContext.entities.set("userName", nameMatches[1])
    }

    // Extract preferences
    if (content.includes("i like") || content.includes("i prefer")) {
      const preference = content.split(/i like|i prefer/i)[1]?.trim()
      if (preference) {
        this.currentContext.preferences.set("likes", preference)
      }
    }
  }

  getContextStats(): any {
    return {
      messageCount: this.messages.length,
      sessionDuration: Date.now() - this.currentContext.startTime,
      topicCount: this.currentContext.topics.size,
      entityCount: this.currentContext.entities.size,
    }
  }

  exportContext(): any {
    return {
      messages: this.messages,
      context: this.currentContext,
      stats: this.getContextStats(),
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

  clearContext(): void {
    this.messages = []
    this.createContext()
  }
}

export const contextManager = new ContextManager()
