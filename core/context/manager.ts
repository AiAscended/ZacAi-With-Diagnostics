import type { ContextMessage } from "@/types/global"

export class ContextManager {
  private messages: ContextMessage[] = []
  private maxContextLength = 50
  private sessionStart = Date.now()

  createContext(): void {
    this.messages = []
    this.sessionStart = Date.now()
  }

  addMessage(message: ContextMessage): void {
    const messageWithTimestamp: ContextMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    }

    this.messages.push(messageWithTimestamp)

    // Trim context if it gets too long
    if (this.messages.length > this.maxContextLength) {
      this.messages = this.messages.slice(-this.maxContextLength)
    }
  }

  getMessages(): ContextMessage[] {
    return [...this.messages]
  }

  getRecentMessages(count = 10): ContextMessage[] {
    return this.messages.slice(-count)
  }

  extractContext(currentInput: string): any {
    const recentMessages = this.getRecentMessages(5)
    const userMessages = recentMessages.filter((m) => m.role === "user")
    const assistantMessages = recentMessages.filter((m) => m.role === "assistant")

    return {
      currentInput,
      recentUserInputs: userMessages.map((m) => m.content),
      recentAssistantResponses: assistantMessages.map((m) => m.content),
      conversationLength: this.messages.length,
      sessionDuration: Date.now() - this.sessionStart,
      topics: this.extractTopics(),
      sentiment: this.analyzeSentiment(currentInput),
    }
  }

  private extractTopics(): string[] {
    const allText = this.messages.map((m) => m.content).join(" ")
    const words = allText.toLowerCase().split(/\W+/)
    const wordCount: { [key: string]: number } = {}

    words.forEach((word) => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "love", "like", "enjoy"]
    const negativeWords = ["bad", "terrible", "awful", "horrible", "hate", "dislike", "problem", "issue", "error"]

    const words = text.toLowerCase().split(/\W+/)
    let positiveCount = 0
    let negativeCount = 0

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  getContextStats(): any {
    return {
      messageCount: this.messages.length,
      duration: Date.now() - this.sessionStart,
      userMessages: this.messages.filter((m) => m.role === "user").length,
      assistantMessages: this.messages.filter((m) => m.role === "assistant").length,
      averageMessageLength: this.messages.reduce((sum, m) => sum + m.content.length, 0) / this.messages.length || 0,
    }
  }

  clearContext(): void {
    this.messages = []
    this.sessionStart = Date.now()
  }
}

export const contextManager = new ContextManager()
