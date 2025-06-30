// Context management for conversation flow
import type { ContextMessage, ContextStats } from "@/types/global"

export class ContextManager {
  private messages: ContextMessage[] = []
  private maxMessages = 50
  private currentContext: any = {}

  createContext(): void {
    this.currentContext = {
      sessionId: Date.now().toString(),
      startTime: Date.now(),
      userProfile: {},
      conversationFlow: [],
      topics: new Set(),
      entities: new Map(),
      sentiment: "neutral",
    }
  }

  addMessage(message: ContextMessage): void {
    const fullMessage: ContextMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    }

    this.messages.push(fullMessage)

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages)
    }

    // Update context
    this.updateContext(fullMessage)
  }

  private updateContext(message: ContextMessage): void {
    // Extract topics and entities
    const words = message.content.toLowerCase().split(/\s+/)
    words.forEach((word) => {
      if (word.length > 3) {
        this.currentContext.topics.add(word)
      }
    })

    // Update conversation flow
    this.currentContext.conversationFlow.push({
      role: message.role,
      timestamp: message.timestamp,
      length: message.content.length,
    })

    // Simple sentiment analysis
    const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "fantastic"]
    const negativeWords = ["bad", "terrible", "awful", "horrible", "disappointing"]

    const hasPositive = positiveWords.some((word) => message.content.toLowerCase().includes(word))
    const hasNegative = negativeWords.some((word) => message.content.toLowerCase().includes(word))

    if (hasPositive && !hasNegative) {
      this.currentContext.sentiment = "positive"
    } else if (hasNegative && !hasPositive) {
      this.currentContext.sentiment = "negative"
    } else {
      this.currentContext.sentiment = "neutral"
    }
  }

  extractContext(input: string): any {
    const recentMessages = this.messages.slice(-10) // Last 10 messages
    const topics = Array.from(this.currentContext.topics).slice(-20) // Recent topics

    return {
      recentMessages,
      topics,
      sentiment: this.currentContext.sentiment,
      sessionDuration: Date.now() - this.currentContext.startTime,
      messageCount: this.messages.length,
      userProfile: this.currentContext.userProfile,
      conversationFlow: this.currentContext.conversationFlow.slice(-5),
    }
  }

  getContextStats(): ContextStats {
    const totalMessages = this.messages.length
    const averageLength =
      totalMessages > 0 ? this.messages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages : 0

    const topicDistribution: { [topic: string]: number } = {}
    Array.from(this.currentContext.topics).forEach((topic: string) => {
      topicDistribution[topic] = (topicDistribution[topic] || 0) + 1
    })

    return {
      totalMessages,
      averageLength,
      topicDistribution,
      sentimentAnalysis: {
        current: this.currentContext.sentiment,
        distribution: this.calculateSentimentDistribution(),
      },
    }
  }

  private calculateSentimentDistribution(): any {
    const distribution = { positive: 0, negative: 0, neutral: 0 }
    // This would analyze all messages for sentiment distribution
    // For now, return mock data
    return { positive: 0.3, negative: 0.2, neutral: 0.5 }
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
