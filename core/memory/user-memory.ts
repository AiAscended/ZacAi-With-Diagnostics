export interface UserMemoryEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
  context?: string
}

export class UserMemorySystem {
  private memory: Map<string, UserMemoryEntry> = new Map()
  private storageKey = "zacai_user_memory"
  private conversationHistory: Array<{
    input: string
    response: string
    timestamp: number
    personalInfo: any
  }> = []

  constructor() {
    this.loadFromStorage()
  }

  store(key: string, value: string, type = "general", importance = 0.5, context = ""): void {
    const entry: UserMemoryEntry = {
      key: key.toLowerCase(),
      value,
      timestamp: Date.now(),
      importance,
      type,
      source: "conversation",
      context,
    }

    this.memory.set(entry.key, entry)
    this.saveToStorage()

    console.log(`📝 Stored memory: ${key} = ${value}`)
  }

  retrieve(key: string): UserMemoryEntry | null {
    return this.memory.get(key.toLowerCase()) || null
  }

  search(query: string): UserMemoryEntry[] {
    const results: UserMemoryEntry[] = []
    const lowerQuery = query.toLowerCase()

    for (const entry of this.memory.values()) {
      if (
        entry.key.includes(lowerQuery) ||
        entry.value.toLowerCase().includes(lowerQuery) ||
        entry.context?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(entry)
      }
    }

    return results.sort((a, b) => b.importance - a.importance)
  }

  extractPersonalInfo(message: string): any {
    const extracted = {
      name: null as string | null,
      age: null as number | null,
      location: null as string | null,
      interests: [] as string[],
      preferences: {} as any,
      facts: [] as string[],
    }

    // Extract name - GOLDEN CODE RESTORED
    const namePatterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i,
      /(?:i'm|i am)\s+([a-zA-Z]+)(?:\s|$)/i,
      /hi,?\s+i'?m\s+([a-zA-Z]+)/i,
    ]

    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 1) {
        extracted.name = match[1]
        this.store("name", match[1], "personal", 0.9, message)
        break
      }
    }

    // Extract age
    const ageMatch = message.match(/(?:i am|i'm)\s+(\d+)\s+years?\s+old/i)
    if (ageMatch) {
      extracted.age = Number.parseInt(ageMatch[1])
      this.store("age", ageMatch[1], "personal", 0.8, message)
    }

    // Extract interests
    const interestPatterns = [
      /i (?:like|love|enjoy)\s+(.+?)(?:\.|$|,|\sand\s)/i,
      /my (?:hobby|hobbies|interest|interests) (?:is|are)\s+(.+?)(?:\.|$|,)/i,
    ]

    for (const pattern of interestPatterns) {
      const match = message.match(pattern)
      if (match) {
        const interest = match[1].trim()
        extracted.interests.push(interest)
        this.store("interests", interest, "personal", 0.7, message)
      }
    }

    // Extract location
    const locationPatterns = [
      /i (?:live|am) (?:in|from)\s+([a-zA-Z\s]+?)(?:\.|$|,)/i,
      /my (?:city|town|country) is\s+([a-zA-Z\s]+?)(?:\.|$|,)/i,
    ]

    for (const pattern of locationPatterns) {
      const match = message.match(pattern)
      if (match) {
        extracted.location = match[1].trim()
        this.store("location", match[1].trim(), "personal", 0.8, message)
        break
      }
    }

    return extracted
  }

  addConversation(input: string, response: string): void {
    const personalInfo = this.extractPersonalInfo(input)

    this.conversationHistory.push({
      input,
      response,
      timestamp: Date.now(),
      personalInfo,
    })

    // Keep only last 100 conversations
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100)
    }

    this.saveToStorage()
  }

  getPersonalizedGreeting(): string {
    const name = this.retrieve("name")
    if (name) {
      const greetings = [
        `Hi ${name.value}! Nice to see you again.`,
        `Hello ${name.value}! How can I help you today?`,
        `Hey ${name.value}! What would you like to know?`,
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    return "Hello! How can I help you today?"
  }

  getPersonalSummary(): string {
    const personalEntries = Array.from(this.memory.values())
      .filter((entry) => entry.type === "personal" || entry.type === "preference")
      .sort((a, b) => b.importance - a.importance)

    if (personalEntries.length === 0) {
      return "I don't have any personal information about you stored yet. Feel free to tell me about yourself!"
    }

    let summary = "Here's what I remember about you:\n\n"

    const name = this.retrieve("name")
    if (name) {
      summary += `• **Name**: ${name.value}\n`
    }

    const age = this.retrieve("age")
    if (age) {
      summary += `• **Age**: ${age.value} years old\n`
    }

    const location = this.retrieve("location")
    if (location) {
      summary += `• **Location**: ${location.value}\n`
    }

    // Group interests
    const interests = personalEntries.filter((e) => e.key === "interests")
    if (interests.length > 0) {
      summary += `• **Interests**: ${interests.map((i) => i.value).join(", ")}\n`
    }

    summary += `\n*Based on ${this.conversationHistory.length} conversations*`

    return summary
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)

        if (data.memory) {
          data.memory.forEach((entry: UserMemoryEntry) => {
            this.memory.set(entry.key, entry)
          })
        }

        if (data.conversations) {
          this.conversationHistory = data.conversations
        }

        console.log(`✅ Loaded ${this.memory.size} memory entries and ${this.conversationHistory.length} conversations`)
      }
    } catch (error) {
      console.warn("Failed to load user memory:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        memory: Array.from(this.memory.values()),
        conversations: this.conversationHistory,
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save user memory:", error)
    }
  }

  clear(): void {
    this.memory.clear()
    this.conversationHistory = []
    localStorage.removeItem(this.storageKey)
  }

  getStats(): any {
    const entries = Array.from(this.memory.values())
    const personalEntries = entries.filter((e) => e.type === "personal")
    const preferenceEntries = entries.filter((e) => e.type === "preference")

    return {
      totalEntries: entries.length,
      personalEntries: personalEntries.length,
      preferenceEntries: preferenceEntries.length,
      conversationCount: this.conversationHistory.length,
      averageImportance: entries.length > 0 ? entries.reduce((sum, e) => sum + e.importance, 0) / entries.length : 0,
    }
  }
}

export const userMemory = new UserMemorySystem()
