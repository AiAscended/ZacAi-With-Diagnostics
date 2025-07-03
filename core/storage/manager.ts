interface StorageEntry {
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

export interface StorageStats {
  totalEntries: number
  moduleBreakdown: { [module: string]: number }
  averageConfidence: number
  lastUpdate: number
  storageSize: number
}

class StorageManager {
  private storagePrefix = "zacai_"
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🗄️ Initializing Storage Manager...")

    try {
      // Check if localStorage is available
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage not available")
      }

      // Initialize module storage if not exists
      const modules = ["vocabulary", "mathematics", "facts", "coding", "philosophy", "user-info"]

      for (const module of modules) {
        const key = `${this.storagePrefix}learnt_${module}`
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify({ entries: {}, metadata: { created: Date.now() } }))
        }
      }

      this.initialized = true
      console.log("✅ Storage Manager initialized successfully")
    } catch (error) {
      console.error("❌ Storage Manager initialization failed:", error)
      throw error
    }
  }

  async loadLearntData(module: string): Promise<any> {
    try {
      const key = `${this.storagePrefix}learnt_${module}`
      const stored = localStorage.getItem(key)

      if (!stored) {
        return { entries: {}, metadata: { created: Date.now() } }
      }

      const data = JSON.parse(stored)
      console.log(`📖 Loaded ${Object.keys(data.entries || {}).length} entries for ${module}`)
      return data
    } catch (error) {
      console.error(`Failed to load learnt data for ${module}:`, error)
      return { entries: {}, metadata: { created: Date.now() } }
    }
  }

  async saveLearntData(module: string, data: any): Promise<void> {
    try {
      const key = `${this.storagePrefix}learnt_${module}`
      const dataToSave = {
        ...data,
        metadata: {
          ...data.metadata,
          lastUpdate: Date.now(),
        },
      }

      localStorage.setItem(key, JSON.stringify(dataToSave))
      console.log(`💾 Saved learnt data for ${module}`)
    } catch (error) {
      console.error(`Failed to save learnt data for ${module}:`, error)
      throw error
    }
  }

  async addLearntEntry(module: string, entry: StorageEntry): Promise<void> {
    try {
      const data = await this.loadLearntData(module)

      // Add the entry
      data.entries[entry.id] = entry

      // Update metadata
      data.metadata.lastUpdate = Date.now()
      data.metadata.totalEntries = Object.keys(data.entries).length

      await this.saveLearntData(module, data)
      console.log(`➕ Added entry ${entry.id} to ${module}`)
    } catch (error) {
      console.error(`Failed to add entry to ${module}:`, error)
      throw error
    }
  }

  async updateLearntEntry(module: string, entryId: string, updates: Partial<StorageEntry>): Promise<void> {
    try {
      const data = await this.loadLearntData(module)

      if (!data.entries[entryId]) {
        throw new Error(`Entry ${entryId} not found in ${module}`)
      }

      // Update the entry
      data.entries[entryId] = {
        ...data.entries[entryId],
        ...updates,
        lastUsed: Date.now(),
      }

      await this.saveLearntData(module, data)
      console.log(`🔄 Updated entry ${entryId} in ${module}`)
    } catch (error) {
      console.error(`Failed to update entry in ${module}:`, error)
      throw error
    }
  }

  async searchLearntEntries(module: string, query: string): Promise<StorageEntry[]> {
    try {
      const data = await this.loadLearntData(module)
      const entries = Object.values(data.entries) as StorageEntry[]
      const lowerQuery = query.toLowerCase()

      return entries
        .filter((entry) => {
          const content = JSON.stringify(entry.content).toLowerCase()
          const context = entry.context.toLowerCase()
          const tags = entry.tags.join(" ").toLowerCase()

          return content.includes(lowerQuery) || context.includes(lowerQuery) || tags.includes(lowerQuery)
        })
        .sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error(`Failed to search entries in ${module}:`, error)
      return []
    }
  }

  async getStorageStats(): Promise<StorageStats> {
    try {
      const modules = ["vocabulary", "mathematics", "facts", "coding", "philosophy", "user-info"]
      let totalEntries = 0
      let totalConfidence = 0
      let entryCount = 0
      let lastUpdate = 0
      const moduleBreakdown: { [module: string]: number } = {}

      for (const module of modules) {
        const data = await this.loadLearntData(module)
        const entries = Object.values(data.entries) as StorageEntry[]

        moduleBreakdown[module] = entries.length
        totalEntries += entries.length

        for (const entry of entries) {
          totalConfidence += entry.confidence
          entryCount++
          if (entry.timestamp > lastUpdate) {
            lastUpdate = entry.timestamp
          }
        }
      }

      // Calculate storage size
      let storageSize = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.storagePrefix)) {
          const value = localStorage.getItem(key)
          if (value) {
            storageSize += value.length
          }
        }
      }

      return {
        totalEntries,
        moduleBreakdown,
        averageConfidence: entryCount > 0 ? totalConfidence / entryCount : 0,
        lastUpdate,
        storageSize,
      }
    } catch (error) {
      console.error("Failed to get storage stats:", error)
      return {
        totalEntries: 0,
        moduleBreakdown: {},
        averageConfidence: 0,
        lastUpdate: 0,
        storageSize: 0,
      }
    }
  }

  async clearModuleData(module: string): Promise<void> {
    try {
      const key = `${this.storagePrefix}learnt_${module}`
      localStorage.setItem(
        key,
        JSON.stringify({
          entries: {},
          metadata: { created: Date.now(), cleared: Date.now() },
        }),
      )
      console.log(`🗑️ Cleared all data for ${module}`)
    } catch (error) {
      console.error(`Failed to clear data for ${module}:`, error)
      throw error
    }
  }

  async exportData(): Promise<any> {
    try {
      const modules = ["vocabulary", "mathematics", "facts", "coding", "philosophy", "user-info"]
      const exportData: any = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        modules: {},
      }

      for (const module of modules) {
        exportData.modules[module] = await this.loadLearntData(module)
      }

      // Add user memory data
      const userMemoryKey = "zacai_user_memory"
      const userMemory = localStorage.getItem(userMemoryKey)
      if (userMemory) {
        exportData.userMemory = JSON.parse(userMemory)
      }

      return exportData
    } catch (error) {
      console.error("Failed to export data:", error)
      throw error
    }
  }

  async importData(data: any): Promise<void> {
    try {
      if (!data.modules) {
        throw new Error("Invalid import data format")
      }

      for (const [module, moduleData] of Object.entries(data.modules)) {
        await this.saveLearntData(module, moduleData)
      }

      // Import user memory if available
      if (data.userMemory) {
        localStorage.setItem("zacai_user_memory", JSON.stringify(data.userMemory))
      }

      console.log("✅ Data imported successfully")
    } catch (error) {
      console.error("Failed to import data:", error)
      throw error
    }
  }

  async incrementUsage(module: string, entryId: string): Promise<void> {
    try {
      const data = await this.loadLearntData(module)

      if (data.entries[entryId]) {
        data.entries[entryId].usageCount = (data.entries[entryId].usageCount || 0) + 1
        data.entries[entryId].lastUsed = Date.now()
        await this.saveLearntData(module, data)
      }
    } catch (error) {
      console.error(`Failed to increment usage for ${entryId}:`, error)
    }
  }

  async getPopularEntries(module: string, limit = 10): Promise<StorageEntry[]> {
    try {
      const data = await this.loadLearntData(module)
      const entries = Object.values(data.entries) as StorageEntry[]

      return entries.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, limit)
    } catch (error) {
      console.error(`Failed to get popular entries for ${module}:`, error)
      return []
    }
  }

  async getRecentEntries(module: string, limit = 10): Promise<StorageEntry[]> {
    try {
      const data = await this.loadLearntData(module)
      const entries = Object.values(data.entries) as StorageEntry[]

      return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
    } catch (error) {
      console.error(`Failed to get recent entries for ${module}:`, error)
      return []
    }
  }
}

export const storageManager = new StorageManager()
