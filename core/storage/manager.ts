import type { LearntDataEntry } from "@/types/global"

export class StorageManager {
  private readonly prefix = "zacai_"
  private cache: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    try {
      // Test localStorage availability
      const testKey = this.prefix + "test"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      console.log("✅ Storage Manager initialized")
    } catch (error) {
      console.error("❌ Storage not available:", error)
      throw new Error("Storage initialization failed")
    }
  }

  async save(key: string, data: any): Promise<void> {
    try {
      const fullKey = this.prefix + key
      const serialized = JSON.stringify(data)
      localStorage.setItem(fullKey, serialized)
      this.cache.set(key, data)
    } catch (error) {
      console.error("Failed to save data:", error)
      throw error
    }
  }

  async load(key: string): Promise<any> {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key)
      }

      const fullKey = this.prefix + key
      const serialized = localStorage.getItem(fullKey)

      if (!serialized) {
        return null
      }

      const data = JSON.parse(serialized)
      this.cache.set(key, data)
      return data
    } catch (error) {
      console.error("Failed to load data:", error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key
      localStorage.removeItem(fullKey)
      this.cache.delete(key)
    } catch (error) {
      console.error("Failed to delete data:", error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.prefix + key
    return localStorage.getItem(fullKey) !== null
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      }
      this.cache.clear()
    } catch (error) {
      console.error("Failed to clear storage:", error)
      throw error
    }
  }

  async saveLearntData(module: string, entry: LearntDataEntry): Promise<void> {
    const key = `learnt_${module}`
    const existing = (await this.load(key)) || []

    // Remove existing entry with same ID
    const filtered = existing.filter((e: LearntDataEntry) => e.id !== entry.id)
    filtered.push(entry)

    await this.save(key, filtered)
  }

  async loadLearntData(module: string): Promise<LearntDataEntry[]> {
    const key = `learnt_${module}`
    return (await this.load(key)) || []
  }

  async searchLearntData(module: string, query: string): Promise<LearntDataEntry[]> {
    const data = await this.loadLearntData(module)
    const lowerQuery = query.toLowerCase()

    return data.filter(
      (entry) =>
        JSON.stringify(entry.content).toLowerCase().includes(lowerQuery) ||
        entry.context.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  async getStorageStats(): Promise<any> {
    try {
      const keys = Object.keys(localStorage)
      const ourKeys = keys.filter((key) => key.startsWith(this.prefix))

      let totalSize = 0
      const moduleStats: any = {}

      for (const key of ourKeys) {
        const value = localStorage.getItem(key)
        if (value) {
          const size = new Blob([value]).size
          totalSize += size

          const moduleName = key.replace(this.prefix, "").split("_")[0]
          if (!moduleStats[moduleName]) {
            moduleStats[moduleName] = { count: 0, size: 0 }
          }
          moduleStats[moduleName].count++
          moduleStats[moduleName].size += size
        }
      }

      return {
        totalKeys: ourKeys.length,
        totalSize,
        moduleStats,
        cacheSize: this.cache.size,
      }
    } catch (error) {
      console.error("Failed to get storage stats:", error)
      return { totalKeys: 0, totalSize: 0, moduleStats: {}, cacheSize: 0 }
    }
  }

  async exportData(): Promise<any> {
    try {
      const keys = Object.keys(localStorage)
      const ourKeys = keys.filter((key) => key.startsWith(this.prefix))
      const data: any = {}

      for (const key of ourKeys) {
        const value = localStorage.getItem(key)
        if (value) {
          const cleanKey = key.replace(this.prefix, "")
          data[cleanKey] = JSON.parse(value)
        }
      }

      return {
        timestamp: Date.now(),
        version: "2.0.0",
        data,
      }
    } catch (error) {
      console.error("Failed to export data:", error)
      throw error
    }
  }

  async importData(importData: any): Promise<void> {
    try {
      if (!importData.data) {
        throw new Error("Invalid import data format")
      }

      for (const [key, value] of Object.entries(importData.data)) {
        await this.save(key, value)
      }
    } catch (error) {
      console.error("Failed to import data:", error)
      throw error
    }
  }
}

export const storageManager = new StorageManager()
