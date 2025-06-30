import type { LearntDataEntry } from "@/types/global"

export class StorageManager {
  private cache: Map<string, any> = new Map()
  private readonly STORAGE_PREFIX = "zacai_"

  async loadSeedData(filePath: string): Promise<any> {
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        console.warn(`Seed data not found at ${filePath}, using empty structure`)
        return this.createEmptySeedStructure()
      }
      const data = await response.json()
      this.cache.set(`seed_${filePath}`, data)
      return data
    } catch (error) {
      console.error("Error loading seed data:", error)
      return this.createEmptySeedStructure()
    }
  }

  async loadLearntData(filePath: string): Promise<any> {
    try {
      // Try to load from localStorage first
      const localKey = `${this.STORAGE_PREFIX}${filePath.replace(/[^a-zA-Z0-9]/g, "_")}`
      const localData = localStorage.getItem(localKey)

      if (localData && localData.trim()) {
        try {
          const data = JSON.parse(localData)
          this.cache.set(`learnt_${filePath}`, data)
          return data
        } catch (parseError) {
          console.warn("Invalid JSON in localStorage, clearing:", parseError)
          localStorage.removeItem(localKey)
        }
      }

      // Try to load from file system
      try {
        const response = await fetch(filePath)
        if (response.ok) {
          const text = await response.text()
          if (text.trim()) {
            const data = JSON.parse(text)
            this.cache.set(`learnt_${filePath}`, data)
            return data
          }
        }
      } catch (fetchError) {
        console.warn(`Could not fetch learnt data from ${filePath}:`, fetchError)
      }

      // Return empty structure if file doesn't exist or is empty
      const emptyStructure = this.createEmptyLearntStructure()
      this.cache.set(`learnt_${filePath}`, emptyStructure)
      return emptyStructure
    } catch (error) {
      console.error("Error loading learnt data:", error)
      const emptyStructure = this.createEmptyLearntStructure()
      this.cache.set(`learnt_${filePath}`, emptyStructure)
      return emptyStructure
    }
  }

  async saveLearntData(filePath: string, data: any): Promise<boolean> {
    try {
      const serializedData = JSON.stringify(data, null, 2)
      const localKey = `${this.STORAGE_PREFIX}${filePath.replace(/[^a-zA-Z0-9]/g, "_")}`
      localStorage.setItem(localKey, serializedData)
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

  private createEmptySeedStructure(): any {
    return {
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        totalEntries: 0,
        sources: [],
      },
      data: {},
    }
  }
}

export const storageManager = new StorageManager()
