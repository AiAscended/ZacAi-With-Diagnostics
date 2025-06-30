// lib/storage-manager.ts

export class StorageManager {
  // Fetches a seed JSON file from the public directory
  public async loadSeedData<T>(fileName: string): Promise<T | null> {
    try {
      console.log(`🌱 Loading seed data from: ${fileName}`)
      const response = await fetch(`/${fileName}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log(`✅ Successfully loaded ${fileName}`)
      return data
    } catch (error) {
      console.error(`Error loading seed data from ${fileName}:`, error)
      return null
    }
  }

  // Loads learned data from localStorage
  public loadLearnedData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        console.log(`🧠 Loaded learned data from localStorage key: ${key}`)
        return JSON.parse(data)
      }
      return null
    } catch (error) {
      console.error(`Error loading learned data from ${key}:`, error)
      return null
    }
  }

  // Saves learned data to localStorage
  public saveLearnedData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data, null, 2))
      console.log(`💾 Saved learned data to localStorage key: ${key}`)
    } catch (error) {
      console.error(`Error saving learned data to ${key}:`, error)
    }
  }
}
