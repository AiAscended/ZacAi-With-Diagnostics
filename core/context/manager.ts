import type { ContextMessage } from "@/types/global"
import { generateId, calculateSimilarity } from "@/utils/helpers"

export class ContextManager {
  private context: ContextMessage[] = []
  private maxContextLength = 50 // Updated max context size
  private currentSessionId = generateId()

  createContext(): void {
    this.context = []
    console.log("📝 Context manager initialized") // Updated log message
  }

  addMessage(message: ContextMessage): void {
    const contextMessage: ContextMessage = {
      ...message,
      timestamp: Date.now(),
    }

    this.context.push(contextMessage)

    // Keep context within limits
    if (this.context.length > this.maxContextLength) {
      this.context = this.context.slice(-this.maxContextLength)
    }
  }

  getContext(): ContextMessage[] {
    return [...this.context]
  }

  getRecentMessages(count = 5): ContextMessage[] {
    return this.context.slice(-count)
  }

  extractContext(currentInput: string): any {
    const recentMessages = this.getRecentMessages(5)

    // Extract topics from recent conversation
    const topics = this.extractTopics(recentMessages)

    // Find related previous messages
    const relatedMessages = this.findRelatedMessages(currentInput)

    // Extract user preferences from conversation
    const preferences = this.extractUserPreferences(recentMessages)

    return {
      sessionId: this.currentSessionId,
      messageCount: this.context.length,
      recentMessages,
      topics,
      relatedMessages,
      preferences,
      timestamp: Date.now(),
    }
  }

  private extractTopics(messages: ContextMessage[]): string[] {
    const topics: string[] = []

    for (const message of messages) {
      const words = message.content
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3)

      // Simple topic extraction - look for repeated important words
      const wordCounts: { [key: string]: number } = {}
      for (const word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      }

      // Add words that appear multiple times
      for (const [word, count] of Object.entries(wordCounts)) {
        if (count > 1 && !topics.includes(word)) {
          topics.push(word)
        }
      }
    }

    return topics.slice(0, 10) // Limit to top 10 topics
  }

  private findRelatedMessages(currentInput: string): ContextMessage[] {
    const related: Array<{ message: ContextMessage; similarity: number }> = []

    for (const message of this.context) {
      const similarity = calculateSimilarity(currentInput, message.content)
      if (similarity > 0.3) {
        // Threshold for relevance
        related.push({ message, similarity })
      }
    }

    // Sort by similarity and return top 3
    return related
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((item) => item.message)
  }

  private extractUserPreferences(messages: ContextMessage[]): any {
    const preferences: any = {
      interests: [],
      learningStyle: "mixed",
      difficulty: "medium",
    }

    for (const message of messages) {
      if (message.role === "user") {
        const content = message.content.toLowerCase()

        // Extract interests
        if (content.includes("i like") || content.includes("i love")) {
          const match = content.match(/i (?:like|love) (.+?)(?:\.|$|,)/i)
          if (match) {
            preferences.interests.push(match[1].trim())
          }
        }

        // Extract difficulty preference
        if (content.includes("simple") || content.includes("easy")) {
          preferences.difficulty = "easy"
        } else if (content.includes("advanced") || content.includes("complex")) {
          preferences.difficulty = "hard"
        }

        // Extract learning style hints
        if (content.includes("show me") || content.includes("example")) {
          preferences.learningStyle = "visual"
        } else if (content.includes("explain") || content.includes("tell me")) {
          preferences.learningStyle = "auditory"
        }
      }
    }

    return preferences
  }

  clearContext(): void {
    this.context = []
    this.currentSessionId = generateId()
  }

  getContextStats(): any {
    const userMessages = this.context.filter((m) => m.role === "user").length
    const assistantMessages = this.context.filter((m) => m.role === "assistant").length

    return {
      totalMessages: this.context.length,
      userMessages,
      assistantMessages,
      sessionId: this.currentSessionId,
      oldestMessage: this.context.length > 0 ? this.context[0].timestamp : null,
      newestMessage: this.context.length > 0 ? this.context[this.context.length - 1].timestamp : null,
      maxSize: this.maxContextLength, // Added max context size to stats
    }
  }

  exportContext(): any {
    return {
      sessionId: this.currentSessionId,
      messages: this.context,
      stats: this.getContextStats(),
      exportTime: Date.now(),
    }
  }

  importContext(data: any): void {
    if (data.messages && Array.isArray(data.messages)) {
      this.context = data.messages
      this.currentSessionId = data.sessionId || generateId()
    }
  }

  setMaxContextLength(length: number): void {
    this.maxContextLength = Math.max(1, Math.min(100, length))

    // Trim context if needed
    if (this.context.length > this.maxContextLength) {
      this.context = this.context.slice(-this.maxContextLength)
    }
  }
}

export const contextManager = new ContextManager()
