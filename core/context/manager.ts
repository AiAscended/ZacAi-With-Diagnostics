interface ContextMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: number
  metadata?: any
}

interface ContextStats {
  messageCount: number
  duration: number
  topics: string[]
  lastActivity: number
}

export class ContextManager {
  private messages: ContextMessage[] = []
  private sessionStart: number = Date.now()
  private maxMessages = 50

  createContext(): void {
    this.messages = []
    this.sessionStart = Date.now()
  }

  addMessage(message: ContextMessage): void {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    }

    this.messages.push(messageWithTimestamp)

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages)
    }
  }

  getMessages(limit?: number): ContextMessage[] {
    if (limit) {
      return this.messages.slice(-limit)
    }
    return [...this.messages]
  }

  getRecentMessages(count = 10): ContextMessage[] {
    return this.messages.slice(-count)
  }

  extractContext(currentInput: string): any {
    const recentMessages = this.getRecentMessages(5)
    const topics = this.extractTopics(recentMessages)

    return {
      recentMessages,
      topics,
      sessionDuration: Date.now() - this.sessionStart,
      messageCount: this.messages.length,
      currentInput,
      timestamp: Date.now(),
    }
  }

  private extractTopics(messages: ContextMessage[]): string[] {
    const topics: string[] = []
    const topicKeywords = [
      "mathematics",
      "math",
      "calculate",
      "equation",
      "vocabulary",
      "define",
      "meaning",
      "word",
      "facts",
      "information",
      "tell me about",
      "coding",
      "programming",
      "function",
      "code",
      "philosophy",
      "ethics",
      "consciousness",
      "existence",
    ]

    for (const message of messages) {
      const content = message.content.toLowerCase()
      for (const keyword of topicKeywords) {
        if (content.includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword)
        }
      }
    }

    return topics.slice(0, 5) // Return top 5 topics
  }

  getContextStats(): ContextStats {
    return {
      messageCount: this.messages.length,
      duration: Date.now() - this.sessionStart,
      topics: this.extractTopics(this.messages),
      lastActivity:
        this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp || Date.now() : this.sessionStart,
    }
  }

  clearContext(): void {
    this.messages = []
    this.sessionStart = Date.now()
  }

  exportContext(): any {
    return {
      messages: this.messages,
      sessionStart: this.sessionStart,
      stats: this.getContextStats(),
    }
  }

  importContext(contextData: any): void {
    if (contextData.messages) {
      this.messages = contextData.messages
    }
    if (contextData.sessionStart) {
      this.sessionStart = contextData.sessionStart
    }
  }

  getContextSummary(): string {
    const stats = this.getContextStats()
    const topics = stats.topics.length > 0 ? stats.topics.join(", ") : "general conversation"

    return `Session: ${Math.floor(stats.duration / 60000)}m, Messages: ${stats.messageCount}, Topics: ${topics}`
  }
}

export const contextManager = new ContextManager()
