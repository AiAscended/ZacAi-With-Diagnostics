export interface UserMemoryEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

export class UserMemorySystem {
  private memory: Map<string, UserMemoryEntry> = new Map()
  private storageKey = "zacai_user_memory"

  constructor() {
    this.loadFromStorage()
  }

  store(key: string, value: string, type = "general", importance = 0.5): void {
    const entry: UserMemoryEntry = {
      key: key.toLowerCase(),
      value,
      timestamp: Date.now(),
      importance,
      type,
      source: "conversation",
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
      if (entry.key.includes(lowerQuery) || entry.value.toLowerCase().includes(lowerQuery)) {
        results.push(entry)
      }
    }

    return results.sort((a, b) => b.importance - a.importance)
  }

  getAllMemories(): UserMemoryEntry[] {
    return Array.from(this.memory.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  extractPersonalInfo(message: string): void {
    // Extract name
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      this.store("name", nameMatch[1], "personal", 0.9)
    }

    // Extract age
    const ageMatch = message.match(/(?:i am|i'm)\s+(\d+)\s+years?\s+old/i)
    if (ageMatch) {
      this.store("age", ageMatch[1], "personal", 0.8)
    }

    // Extract interests
    const interestMatch = message.match(/i (?:like|love|enjoy)\s+(.+?)(?:\.|$|,)/i)
    if (interestMatch) {
      this.store("interests", interestMatch[1].trim(), "personal", 0.7)
    }

    // Extract location
    const locationMatch = message.match(/i (?:live|am) (?:in|from)\s+(.+?)(?:\.|$|,)/i)
    if (locationMatch) {
      this.store("location", locationMatch[1].trim(), "personal", 0.8)
    }
  }

  getPersonalSummary(): string {
    const personalEntries = Array.from(this.memory.values())
      .filter((entry) => entry.type === "personal")
      .sort((a, b) => b.importance - a.importance)

    if (personalEntries.length === 0) {
      return "I don't have any personal information about you stored yet."
    }

    let summary = "Here's what I remember about you:\n\n"
    personalEntries.forEach((entry) => {
      summary += `• **${entry.key}**: ${entry.value}\n`
    })

    return summary
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((entry: UserMemoryEntry) => {
          this.memory.set(entry.key, entry)
        })
        console.log(`✅ Loaded ${data.length} memory entries`)
      }
    } catch (error) {
      console.warn("Failed to load user memory:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.memory.values())
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save user memory:", error)
    }
  }

  clear(): void {
    this.memory.clear()
    localStorage.removeItem(this.storageKey)
  }

  getStats(): any {
    const entries = Array.from(this.memory.values())
    const personalEntries = entries.filter((e) => e.type === "personal")
    const generalEntries = entries.filter((e) => e.type === "general")

    return {
      totalEntries: entries.length,
      personalEntries: personalEntries.length,
      generalEntries: generalEntries.length,
      averageImportance: entries.length > 0 ? entries.reduce((sum, e) => sum + e.importance, 0) / entries.length : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map((e) => e.timestamp)) : null,
    }
  }
}

export const userMemory = new UserMemorySystem()
