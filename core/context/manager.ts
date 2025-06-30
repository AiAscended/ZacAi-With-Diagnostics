import type { Message, ContextData } from "@/types/global"

export class ContextManager {
  private messages: Message[] = []
  private sessionStart: number = Date.now()
  private maxMessages = 100
  private contextWindow = 10 // Number of recent messages to consider

  createContext(): void {
    this.messages = []
    this.sessionStart = Date.now()
  }

  addMessage(message: Omit<Message, "id" | "timestamp">): void {
    const fullMessage: Message = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message,
    }

    this.messages.push(fullMessage)

    // Keep only the most recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages)
    }
  }

  getRecentMessages(count?: number): Message[] {
    const messageCount = count || this.contextWindow
    return this.messages.slice(-messageCount)
  }

  getAllMessages(): Message[] {
    return [...this.messages]
  }

  extractContext(currentInput: string): ContextData {
    const recentMessages = this.getRecentMessages()
    const userMessages = recentMessages.filter((m) => m.role === "user")
    const assistantMessages = recentMessages.filter((m) => m.role === "assistant")

    // Extract topics from recent conversation
    const topics = this.extractTopics(recentMessages)

    // Extract entities (numbers, names, etc.)
    const entities = this.extractEntities(currentInput)

    // Determine conversation flow
    const conversationFlow = this.analyzeConversationFlow(recentMessages)

    return {
      recentMessages,
      topics,
      entities,
      conversationFlow,
      sessionDuration: Date.now() - this.sessionStart,
      messageCount: this.messages.length,
      userQuestionCount: userMessages.length,
      assistantResponseCount: assistantMessages.length,
    }
  }

  private extractTopics(messages: Message[]): string[] {
    const topics: Set<string> = new Set()

    const topicKeywords = {
      vocabulary: ["define", "meaning", "word", "definition", "synonym", "antonym"],
      mathematics: ["calculate", "solve", "math", "equation", "number", "formula"],
      facts: ["fact", "information", "tell me about", "what is", "explain"],
      coding: ["code", "program", "function", "algorithm", "programming"],
      philosophy: ["philosophy", "ethics", "moral", "meaning of life", "existence"],
    }

    messages.forEach((message) => {
      const content = message.content.toLowerCase()

      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some((keyword) => content.includes(keyword))) {
          topics.add(topic)
        }
      })
    })

    return Array.from(topics)
  }

  private extractEntities(text: string): any {
    const entities = {
      numbers: [],
      dates: [],
      names: [],
      locations: [],
      organizations: [],
    }

    // Extract numbers
    const numberMatches = text.match(/\b\d+(?:\.\d+)?\b/g)
    if (numberMatches) {
      entities.numbers = numberMatches.map(Number)
    }

    // Extract potential dates
    const dateMatches = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g)
    if (dateMatches) {
      entities.dates = dateMatches
    }

    // Extract capitalized words (potential names/places)
    const capitalizedMatches = text.match(/\b[A-Z][a-z]+\b/g)
    if (capitalizedMatches) {
      entities.names = capitalizedMatches
    }

    return entities
  }

  private analyzeConversationFlow(messages: Message[]): string {
    if (messages.length === 0) return "new_conversation"

    const lastMessage = messages[messages.length - 1]
    const secondLastMessage = messages.length > 1 ? messages[messages.length - 2] : null

    // Check for follow-up questions
    if (lastMessage.role === "user" && secondLastMessage?.role === "assistant") {
      const followUpIndicators = ["also", "and", "what about", "how about", "can you"]
      if (followUpIndicators.some((indicator) => lastMessage.content.toLowerCase().includes(indicator))) {
        return "follow_up"
      }
    }

    // Check for clarification requests
    const clarificationIndicators = ["what do you mean", "can you explain", "i don't understand"]
    if (clarificationIndicators.some((indicator) => lastMessage.content.toLowerCase().includes(indicator))) {
      return "clarification"
    }

    // Check for topic changes
    const topics = this.extractTopics([lastMessage])
    const previousTopics = this.extractTopics(messages.slice(-3, -1))

    if (topics.length > 0 && previousTopics.length > 0) {
      const hasCommonTopic = topics.some((topic) => previousTopics.includes(topic))
      if (!hasCommonTopic) {
        return "topic_change"
      }
    }

    return "continuation"
  }

  getContextStats(): any {
    return {
      messageCount: this.messages.length,
      duration: Date.now() - this.sessionStart,
      averageMessageLength:
        this.messages.length > 0
          ? this.messages.reduce((sum, msg) => sum + msg.content.length, 0) / this.messages.length
          : 0,
      topicsDiscussed: this.extractTopics(this.messages),
      conversationHealth: this.assessConversationHealth(),
    }
  }

  private assessConversationHealth(): string {
    if (this.messages.length === 0) return "new"

    const recentMessages = this.getRecentMessages(5)
    const userMessages = recentMessages.filter((m) => m.role === "user")
    const assistantMessages = recentMessages.filter((m) => m.role === "assistant")

    const ratio = assistantMessages.length / Math.max(userMessages.length, 1)

    if (ratio > 1.5) return "assistant_heavy"
    if (ratio < 0.5) return "user_heavy"
    return "balanced"
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
}

export const contextManager = new ContextManager()
