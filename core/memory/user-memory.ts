interface MemoryEntry {
  id: string
  key: string
  value: any
  type: "personal" | "preference" | "learning" | "context"
  confidence: number
  context: string
  timestamp: number
  lastAccessed: number
  accessCount: number
  tags: string[]
}

class UserMemory {
  private memories: Map<string, MemoryEntry> = new Map()
  private storageKey = "zacai_user_memory"
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🧠 Initializing User Memory...")

    try {
      this.loadFromStorage()
      this.initialized = true
      console.log("✅ User Memory initialized successfully")
    } catch (error) {
      console.error("❌ User Memory initialization failed:", error)
      throw error
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.memories = new Map(Object.entries(data))
        console.log(`📖 Loaded ${this.memories.size} memory entries`)
      }
    } catch (error) {
      console.error("Failed to load user memory:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.memories)
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save user memory:", error)
    }
  }

  store(key: string, value: any, type: MemoryEntry["type"] = "context", confidence = 0.8, context = ""): void {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const entry: MemoryEntry = {
      id,
      key,
      value,
      type,
      confidence,
      context,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      tags: this.generateTags(key, value, context),
    }

    this.memories.set(key, entry)
    this.saveToStorage()
    console.log(`💾 Stored memory: ${key}`)
  }

  retrieve(key: string): MemoryEntry | null {
    const entry = this.memories.get(key)
    if (entry) {
      entry.lastAccessed = Date.now()
      entry.accessCount++
      this.saveToStorage()
      return entry
    }
    return null
  }

  extractPersonalInfo(input: string): any {
    const personalInfo = {
      name: null as string | null,
      age: null as number | null,
      location: null as string | null,
      interests: [] as string[],
      preferences: {} as { [key: string]: string },
      facts: [] as string[],
    }

    // Extract name
    const nameMatch = input.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i)
    if (nameMatch) {
      personalInfo.name = nameMatch[1]
      this.store("name", personalInfo.name, "personal", 0.9, input)
    }

    // Extract age
    const ageMatch = input.match(/(?:i am|i'm)\s+(\d+)\s+(?:years old|years)/i)
    if (ageMatch) {
      personalInfo.age = Number.parseInt(ageMatch[1])
      this.store("age", personalInfo.age, "personal", 0.9, input)
    }

    // Extract location
    const locationMatch = input.match(/(?:i live in|i'm from|from)\s+([a-zA-Z\s]+)/i)
    if (locationMatch) {
      personalInfo.location = locationMatch[1].trim()
      this.store("location", personalInfo.location, "personal", 0.8, input)
    }

    // Extract interests
    const interestMatch = input.match(/(?:i like|i love|interested in|enjoy)\s+([^.!?]+)/i)
    if (interestMatch) {
      const interests = interestMatch[1].split(/,|\sand\s/).map((s) => s.trim())
      personalInfo.interests = interests
      interests.forEach((interest) => {
        this.store(`interest_${interest}`, interest, "preference", 0.7, input)
      })
    }

    return personalInfo
  }

  getPersonalSummary(): string {
    const name = this.retrieve("name")
    const age = this.retrieve("age")
    const location = this.retrieve("location")

    let summary = "👤 **Personal Information**\n\n"

    if (name) {
      summary += `• **Name:** ${name.value}\n`
    }

    if (age) {
      summary += `• **Age:** ${age.value} years old\n`
    }

    if (location) {
      summary += `• **Location:** ${location.value}\n`
    }

    // Get interests
    const interests = Array.from(this.memories.values())
      .filter((entry) => entry.key.startsWith("interest_"))
      .map((entry) => entry.value)

    if (interests.length > 0) {
      summary += `• **Interests:** ${interests.join(", ")}\n`
    }

    if (!name && !age && !location && interests.length === 0) {
      summary +=
        'No personal information stored yet.\n\nTell me about yourself! You can say things like:\n• "My name is..."\n• "I\'m ... years old"\n• "I live in..."\n• "I like..."'
    }

    return summary
  }

  search(query: string): MemoryEntry[] {
    const results: MemoryEntry[] = []
    const lowerQuery = query.toLowerCase()

    for (const entry of this.memories.values()) {
      if (
        entry.key.toLowerCase().includes(lowerQuery) ||
        String(entry.value).toLowerCase().includes(lowerQuery) ||
        entry.context.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(entry)
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  private generateTags(key: string, value: any, context: string): string[] {
    const tags = [typeof value]

    if (key.includes("name")) tags.push("identity")
    if (key.includes("age")) tags.push("demographic")
    if (key.includes("location")) tags.push("geographic")
    if (key.includes("interest")) tags.push("preference")

    // Add context-based tags
    if (context.toLowerCase().includes("learn")) tags.push("learning")
    if (context.toLowerCase().includes("remember")) tags.push("memory")

    return tags
  }

  getStats(): any {
    const stats = {
      totalMemories: this.memories.size,
      byType: {} as { [key: string]: number },
      averageConfidence: 0,
      mostAccessed: null as MemoryEntry | null,
      recentMemories: 0,
    }

    let totalConfidence = 0
    let maxAccess = 0
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    for (const entry of this.memories.values()) {
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1

      // Calculate average confidence
      totalConfidence += entry.confidence

      // Find most accessed
      if (entry.accessCount > maxAccess) {
        maxAccess = entry.accessCount
        stats.mostAccessed = entry
      }

      // Count recent memories
      if (entry.timestamp > weekAgo) {
        stats.recentMemories++
      }
    }

    stats.averageConfidence = this.memories.size > 0 ? totalConfidence / this.memories.size : 0

    return stats
  }

  clear(): void {
    this.memories.clear()
    localStorage.removeItem(this.storageKey)
    console.log("🗑️ User memory cleared")
  }
}

export const userMemory = new UserMemory()
