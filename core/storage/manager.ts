import type { LearntDataEntry } from "@/types/global"

export class StorageManager {
  private cache: Map<string, any> = new Map()
  private readonly STORAGE_PREFIX = "zacai_"

  async loadSeedData(filePath: string): Promise<any> {
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to load seed data from ${filePath}`)
      }
      const data = await response.json()
      this.cache.set(`seed_${filePath}`, data)
      return data
    } catch (error) {
      console.error("Error loading seed data:", error)
      return null
    }
  }

  async loadLearntData(filePath: string): Promise<any> {
    try {
      // Try to load from localStorage first
      const localData = localStorage.getItem(`${this.STORAGE_PREFIX}${filePath}`)
      if (localData) {
        const data = JSON.parse(localData)
        this.cache.set(`learnt_${filePath}`, data)
        return data
      }

      // Fallback to file system
      const response = await fetch(filePath)
      if (response.ok) {
        const data = await response.json()
        this.cache.set(`learnt_${filePath}`, data)
        return data
      }

      // Return empty structure if file doesn't exist
      return this.createEmptyLearntStructure()
    } catch (error) {
      console.error("Error loading learnt data:", error)
      return this.createEmptyLearntStructure()
    }
  }

  async saveLearntData(filePath: string, data: any): Promise<boolean> {
    try {
      const serializedData = JSON.stringify(data, null, 2)
      localStorage.setItem(`${this.STORAGE_PREFIX}${filePath}`, serializedData)
      this.cache.set(`learnt_${filePath}`, data)
      return true
    } catch (error) {
      console.error("Error saving learnt data:", error)
      return false
    }
  }

  async addLearntEntry(filePath: string, entry: LearntDataEntry): Promise<boolean> {
    try {
      const data = await this.loadLearntData(filePath)
      if (!data.entries) data.entries = {}

      data.entries[entry.id] = entry
      data.metadata.totalEntries = Object.keys(data.entries).length
      data.metadata.lastUpdated = Date.now()

      return await this.saveLearntData(filePath, data)
    } catch (error) {
      console.error("Error adding learnt entry:", error)
      return false
    }
  }

  getCachedData(key: string): any {
    return this.cache.get(key)
  }

  setCachedData(key: string, data: any): void {
    this.cache.set(key, data)
  }

  clearCache(): void {
    this.cache.clear()
  }

  private createEmptyLearntStructure(): any {
    return {
      metadata: {
        version: "1.0.0",
        lastUpdated: Date.now(),
        totalEntries: 0,
        learningRate: 0,
        confidenceThreshold: 0.7,
      },
      entries: {},
      patterns: {},
      statistics: {
        learningVelocity: 0,
        accuracyRate: 0,
        retentionRate: 0,
        utilizationRate: 0,
      },
    }
  }
}

export const storageManager = new StorageManager()
