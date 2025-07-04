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

    try {
      const stored = localStorage.getItem(this.memoryKey)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, entry]) => {
          this.memory.set(key, entry as MemoryEntry)
        })
      }
      this.initialized = true
      console.log("🧠 User Memory initialized with", this.memory.size, "entries")
    } catch (error) {
      console.error("Failed to initialize user memory:", error)
    }
  }

  store(key: string, value: any, type: MemoryEntry["type"] = "context", confidence = 1.0, context?: string): void {
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
    console.log(`🧠 Stored memory: ${key} = ${value}`)
  }

  retrieve(key: string): MemoryEntry | null {
    return this.memory.get(key) || null
  }

  search(query: string): MemoryEntry[] {
    const results: MemoryEntry[] = []
    const lowerQuery = query.toLowerCase()

    this.memory.forEach((entry) => {
      if (
        entry.key.toLowerCase().includes(lowerQuery) ||
        String(entry.value).toLowerCase().includes(lowerQuery) ||
        entry.context?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(entry)
      }
    })

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  getPersonalInfo(): { [key: string]: any } {
    const personal: { [key: string]: any } = {}
    this.memory.forEach((entry) => {
      if (entry.type === "personal") {
        personal[entry.key] = entry.value
      }
    })
    return personal
  }

  extractPersonalInfo(): { [key: string]: any } {
    const personal: { [key: string]: any } = {}
    this.memory.forEach((entry) => {
      if (entry.type === "personal") {
        personal[entry.key] = entry.value
      }
    })
    return personal
  }

  getPersonalSummary(): string {
    const personalInfo = this.extractPersonalInfo()
    const keys = Object.keys(personalInfo)

    if (keys.length === 0) {
      return "No personal information stored yet."
    }

    const summary = keys
      .map((key) => {
        const value = personalInfo[key]
        return `${key}: ${value}`
      })
      .join(", ")

    return `Personal info: ${summary}`
  }

  private persist(): void {
    try {
      const data: { [key: string]: MemoryEntry } = {}
      this.memory.forEach((entry, key) => {
        data[key] = entry
      })
      localStorage.setItem(this.memoryKey, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to persist user memory:", error)
    }
  }

  clear(): void {
    this.memory.clear()
    localStorage.removeItem(this.memoryKey)
  }

  getStats(): any {
    const stats = {
      totalEntries: this.memory.size,
      byType: {} as { [key: string]: number },
      averageConfidence: 0,
      oldestEntry: 0,
      newestEntry: 0,
    }

    let totalConfidence = 0
    let oldest = Date.now()
    let newest = 0

    this.memory.forEach((entry) => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1
      totalConfidence += entry.confidence
      if (entry.timestamp < oldest) oldest = entry.timestamp
      if (entry.timestamp > newest) newest = entry.timestamp
    })

    stats.averageConfidence = this.memory.size > 0 ? totalConfidence / this.memory.size : 0
    stats.oldestEntry = oldest
    stats.newestEntry = newest

    return stats
  }
}

export const userMemory = new UserMemory()
