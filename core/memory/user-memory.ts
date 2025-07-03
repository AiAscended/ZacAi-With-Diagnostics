interface MemoryEntry {
  key: string
  value: any
  type: "personal" | "preference" | "learning" | "context"
  confidence: number
  timestamp: number
  context?: string
  expiresAt?: number
}

class UserMemory {
  private memoryKey = "zacai_user_memory"
  private memory: Map<string, MemoryEntry> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🧠 Initializing User Memory...")

    try {
      // Load existing memory from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(this.memoryKey)
        if (stored) {
          const data = JSON.parse(stored)
          Object.entries(data).forEach(([key, entry]) => {
            this.memory.set(key, entry as MemoryEntry)
          })
          console.log(`📚 Loaded ${this.memory.size} memory entries`)
        }
      }

      this.initialized = true
      console.log("✅ User Memory initialized successfully")
    } catch (error) {
      console.error("❌ User Memory initialization failed:", error)
      throw error
    }
  }

  store(key: string, value: any, type: MemoryEntry["type"] = "context", confidence = 0.8, context?: string): void {
    const entry: MemoryEntry = {
      key,
      value,
      type,
      confidence,
      timestamp: Date.now(),
      context,
    }

    this.memory.set(key, entry)
    this.persist()

    console.log(`🧠 Stored memory: ${key} = ${JSON.stringify(value)}`)
  }

  retrieve(key: string): MemoryEntry | null {
    const entry = this.memory.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memory.delete(key)
      this.persist()
      return null
    }

    return entry
  }

  search(query: string): MemoryEntry[] {
    const results: MemoryEntry[] = []
    const lowerQuery = query.toLowerCase()

    this.memory.forEach((entry) => {
      const keyMatch = entry.key.toLowerCase().includes(lowerQuery)
      const valueMatch = JSON.stringify(entry.value).toLowerCase().includes(lowerQuery)
      const contextMatch = entry.context?.toLowerCase().includes(lowerQuery)

      if (keyMatch || valueMatch || contextMatch) {
        results.push(entry)
      }
    })

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  getByType(type: MemoryEntry["type"]): MemoryEntry[] {
    return Array.from(this.memory.values()).filter((entry) => entry.type === type)
  }

  update(key: string, updates: Partial<MemoryEntry>): boolean {
    const existing = this.memory.get(key)
    if (!existing) return false

    const updated = { ...existing, ...updates, timestamp: Date.now() }
    this.memory.set(key, updated)
    this.persist()

    return true
  }

  delete(key: string): boolean {
    const deleted = this.memory.delete(key)
    if (deleted) {
      this.persist()
    }
    return deleted
  }

  clear(): void {
    this.memory.clear()
    this.persist()
    console.log("🗑️ Cleared all user memory")
  }

  getStats(): any {
    const entries = Array.from(this.memory.values())
    const typeBreakdown: { [type: string]: number } = {}

    entries.forEach((entry) => {
      typeBreakdown[entry.type] = (typeBreakdown[entry.type] || 0) + 1
    })

    return {
      totalEntries: entries.length,
      typeBreakdown,
      averageConfidence: entries.length > 0 ? entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map((e) => e.timestamp)) : 0,
    }
  }

  // Helper method to extract and store user's name from input
  processUserIntroduction(input: string): boolean {
    const namePatterns = [
      /(?:hi|hello|hey),?\s+i'?m\s+([a-zA-Z]+)/i,
      /(?:my\s+name\s+is|i\s+am)\s+([a-zA-Z]+)/i,
      /(?:call\s+me)\s+([a-zA-Z]+)/i,
    ]

    for (const pattern of namePatterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
        this.store("name", name, "personal", 0.9, `User introduced themselves: "${input}"`)
        console.log(`👋 Learned user's name: ${name}`)
        return true
      }
    }

    return false
  }

  // Helper method to get personalized greeting
  getPersonalizedGreeting(): string {
    const nameEntry = this.retrieve("name")
    if (nameEntry) {
      const greetings = [
        `Hi ${nameEntry.value}!`,
        `Hello ${nameEntry.value}!`,
        `Hey ${nameEntry.value}!`,
        `Good to see you again, ${nameEntry.value}!`,
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    return "Hello!"
  }

  // Helper method to store learning interactions
  recordLearning(topic: string, content: string, confidence = 0.7): void {
    const key = `learning_${topic}_${Date.now()}`
    this.store(key, content, "learning", confidence, `Learned about ${topic}`)
  }

  // Helper method to get recent learning
  getRecentLearning(limit = 5): MemoryEntry[] {
    return this.getByType("learning")
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  private persist(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const data: { [key: string]: MemoryEntry } = {}
        this.memory.forEach((entry, key) => {
          data[key] = entry
        })
        localStorage.setItem(this.memoryKey, JSON.stringify(data))
      }
    } catch (error) {
      console.error("Failed to persist user memory:", error)
    }
  }

  // Export memory for backup
  export(): any {
    const data: { [key: string]: MemoryEntry } = {}
    this.memory.forEach((entry, key) => {
      data[key] = entry
    })
    return {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      memory: data,
    }
  }

  // Import memory from backup
  import(data: any): void {
    try {
      if (data.memory) {
        this.memory.clear()
        Object.entries(data.memory).forEach(([key, entry]) => {
          this.memory.set(key, entry as MemoryEntry)
        })
        this.persist()
        console.log(`📥 Imported ${this.memory.size} memory entries`)
      }
    } catch (error) {
      console.error("Failed to import user memory:", error)
      throw error
    }
  }
}

export const userMemory = new UserMemory()
