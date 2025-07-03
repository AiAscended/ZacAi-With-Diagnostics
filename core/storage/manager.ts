import type { LearntDataEntry } from "@/types/global"
import { parseJSON } from "@/utils/helpers"

export class StorageManager {
  private initialized = false
  private cache: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🗄️ Initializing Storage Manager...")

    try {
      // Check if localStorage is available
      if (typeof window !== "undefined" && window.localStorage) {
        console.log("✅ LocalStorage available")
      } else {
        console.log("⚠️ LocalStorage not available, using memory storage")
      }

      this.initialized = true
      console.log("✅ Storage Manager initialized")
    } catch (error) {
      console.error("❌ Storage Manager initialization failed:", error)
      throw error
    }
  }

  async loadSeedData(filename: string): Promise<any> {
    try {
      // Try to load from public folder
      const response = await fetch(`/public${filename}`)
      if (response.ok) {
        return await response.json()
      }

      // Fallback to default structure
      return this.getDefaultSeedData(filename)
    } catch (error) {
      console.warn(`Could not load seed data from ${filename}, using defaults`)
      return this.getDefaultSeedData(filename)
    }
  }

  async loadLearntData(filename: string): Promise<any> {
    try {
      const key = `learnt_${filename}`

      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(key)
        if (stored) {
          return parseJSON(stored, { entries: {}, metadata: { version: "1.0", lastUpdate: Date.now() } })
        }
      }

      // Check cache
      if (this.cache.has(key)) {
        return this.cache.get(key)
      }

      // Return default structure
      return {
        entries: {},
        metadata: {
          version: "1.0",
          lastUpdate: Date.now(),
          totalEntries: 0,
        },
      }
    } catch (error) {
      console.warn(`Could not load learnt data from ${filename}`)
      return { entries: {}, metadata: { version: "1.0", lastUpdate: Date.now() } }
    }
  }

  async saveLearntData(filename: string, data: any): Promise<void> {
    try {
      const key = `learnt_${filename}`

      // Update metadata
      data.metadata = {
        ...data.metadata,
        lastUpdate: Date.now(),
        totalEntries: Object.keys(data.entries || {}).length,
      }

      // Save to localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data))
      }

      // Save to cache
      this.cache.set(key, data)

      console.log(`💾 Saved learnt data to ${filename}`)
    } catch (error) {
      console.error(`Failed to save learnt data to ${filename}:`, error)
    }
  }

  async addLearntEntry(filename: string, entry: LearntDataEntry): Promise<void> {
    try {
      const data = await this.loadLearntData(filename)

      if (!data.entries) {
        data.entries = {}
      }

      data.entries[entry.id] = entry

      await this.saveLearntData(filename, data)
    } catch (error) {
      console.error(`Failed to add learnt entry to ${filename}:`, error)
    }
  }

  async updateLearntEntry(filename: string, entryId: string, updates: Partial<LearntDataEntry>): Promise<void> {
    try {
      const data = await this.loadLearntData(filename)

      if (data.entries && data.entries[entryId]) {
        data.entries[entryId] = { ...data.entries[entryId], ...updates }
        await this.saveLearntData(filename, data)
      }
    } catch (error) {
      console.error(`Failed to update learnt entry in ${filename}:`, error)
    }
  }

  async deleteLearntEntry(filename: string, entryId: string): Promise<void> {
    try {
      const data = await this.loadLearntData(filename)

      if (data.entries && data.entries[entryId]) {
        delete data.entries[entryId]
        await this.saveLearntData(filename, data)
      }
    } catch (error) {
      console.error(`Failed to delete learnt entry from ${filename}:`, error)
    }
  }

  async searchLearntEntries(filename: string, query: string): Promise<LearntDataEntry[]> {
    try {
      const data = await this.loadLearntData(filename)
      const entries = Object.values(data.entries || {}) as LearntDataEntry[]

      const lowerQuery = query.toLowerCase()

      return entries.filter((entry) => {
        const content = JSON.stringify(entry.content).toLowerCase()
        const context = entry.context.toLowerCase()
        const tags = entry.tags.join(" ").toLowerCase()

        return content.includes(lowerQuery) || context.includes(lowerQuery) || tags.includes(lowerQuery)
      })
    } catch (error) {
      console.error(`Failed to search learnt entries in ${filename}:`, error)
      return []
    }
  }

  async exportData(): Promise<any> {
    const exportData: any = {
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      data: {},
    }

    // Export all cached data
    for (const [key, value] of this.cache.entries()) {
      exportData.data[key] = value
    }

    // Export localStorage data if available
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("learnt_")) {
          const value = localStorage.getItem(key)
          if (value) {
            exportData.data[key] = parseJSON(value, {})
          }
        }
      }
    }

    return exportData
  }

  async importData(data: any): Promise<void> {
    try {
      if (data.data) {
        for (const [key, value] of Object.entries(data.data)) {
          this.cache.set(key, value)

          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(value))
          }
        }
      }

      console.log("✅ Data import completed")
    } catch (error) {
      console.error("❌ Data import failed:", error)
      throw error
    }
  }

  async clearAllData(): Promise<void> {
    try {
      this.cache.clear()

      if (typeof window !== "undefined" && window.localStorage) {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("learnt_")) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key))
      }

      console.log("✅ All data cleared")
    } catch (error) {
      console.error("❌ Failed to clear data:", error)
    }
  }

  getStorageStats(): any {
    let totalSize = 0
    let entryCount = 0

    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("learnt_")) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += value.length
            const data = parseJSON(value, {})
            entryCount += Object.keys(data.entries || {}).length
          }
        }
      }
    }

    return {
      totalSize,
      entryCount,
      cacheSize: this.cache.size,
      initialized: this.initialized,
    }
  }

  private getDefaultSeedData(filename: string): any {
    const defaults: { [key: string]: any } = {
      "/seed_vocab.json": {
        words: {
          hello: {
            definition: "A greeting used when meeting someone",
            partOfSpeech: "interjection",
            examples: ["Hello, how are you?"],
            difficulty: 1,
          },
          computer: {
            definition: "An electronic device for processing data",
            partOfSpeech: "noun",
            examples: ["I use my computer for work"],
            difficulty: 2,
          },
        },
      },
      "/seed_maths.json": {
        concepts: {
          addition: {
            name: "Addition",
            description: "The process of combining numbers",
            formula: "a + b = c",
            examples: [
              {
                problem: "2 + 3",
                solution: "5",
                explanation: "Adding 2 and 3 gives us 5",
              },
            ],
          },
        },
      },
      "/seed_knowledge.json": {
        facts: {
          earth: {
            content: "Earth is the third planet from the Sun",
            category: "science",
            source: "astronomy",
          },
        },
      },
      "/seed_coding.json": {
        concepts: {
          function: {
            name: "Function",
            description: "A reusable block of code",
            language: "javascript",
            syntax: "function name() { }",
            examples: [
              {
                title: "Basic Function",
                code: "function greet() { return 'Hello!'; }",
                explanation: "A simple function that returns a greeting",
              },
            ],
          },
        },
      },
    }

    return defaults[filename] || { entries: {}, metadata: { version: "1.0" } }
  }
}

export const storageManager = new StorageManager()
