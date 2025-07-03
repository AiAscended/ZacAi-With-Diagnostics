interface LearntEntry {
  id: string
  content: any
  confidence: number
  source: string
  context: string
  timestamp: number
  usageCount: number
  lastUsed: number
  verified: boolean
  tags: string[]
  relationships: string[]
}

class StorageManager {
  private cache = new Map<string, any>()
  private readonly STORAGE_PREFIX = "zacai_"

  async loadLearntData(module: string): Promise<any> {
    try {
      const key = `${this.STORAGE_PREFIX}learnt_${module}`
      const cached = this.cache.get(key)
      if (cached) return cached

      const stored = localStorage.getItem(key)
      if (stored) {
        const data = JSON.parse(stored)
        this.cache.set(key, data)
        return data
      }

      // Try loading from public files as fallback
      try {
        const response = await fetch(`/learnt_${module}.json`)
        if (response.ok) {
          const data = await response.json()
          this.cache.set(key, data)
          return data
        }
      } catch (error) {
        console.warn(`No public learnt data for ${module}`)
      }

      return { entries: {}, metadata: { version: "1.0.0", totalEntries: 0 } }
    } catch (error) {
      console.error(`Error loading learnt data for ${module}:`, error)
      return { entries: {}, metadata: { version: "1.0.0", totalEntries: 0 } }
    }
  }

  async saveLearntData(module: string, data: any): Promise<void> {
    try {
      const key = `${this.STORAGE_PREFIX}learnt_${module}`
      localStorage.setItem(key, JSON.stringify(data))
      this.cache.set(key, data)
      console.log(`✅ Saved learnt data for ${module}`)
    } catch (error) {
      console.error(`Error saving learnt data for ${module}:`, error)
    }
  }

  async addLearntEntry(module: string, entry: LearntEntry): Promise<void> {
    try {
      const data = await this.loadLearntData(module)

      if (!data.entries) data.entries = {}
      if (!data.metadata) data.metadata = { version: "1.0.0", totalEntries: 0 }

      data.entries[entry.id] = entry
      data.metadata.totalEntries = Object.keys(data.entries).length
      data.metadata.lastUpdate = Date.now()

      await this.saveLearntData(module, data)
      console.log(`📚 Added learnt entry to ${module}: ${entry.id}`)
    } catch (error) {
      console.error(`Error adding learnt entry to ${module}:`, error)
    }
  }

  async searchLearntEntries(module: string, query: string): Promise<LearntEntry[]> {
    try {
      const data = await this.loadLearntData(module)
      const entries = Object.values(data.entries || {}) as LearntEntry[]

      return entries
        .filter(
          (entry) =>
            JSON.stringify(entry.content).toLowerCase().includes(query.toLowerCase()) ||
            entry.context.toLowerCase().includes(query.toLowerCase()) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
        )
        .sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error(`Error searching learnt entries in ${module}:`, error)
      return []
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getStats(): any {
    return {
      cacheSize: this.cache.size,
      cachedModules: Array.from(this.cache.keys()),
    }
  }
}

export const storageManager = new StorageManager()
