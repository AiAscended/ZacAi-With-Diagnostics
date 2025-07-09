export class StorageManager {
  private isInitialized = false
  private storageKey = "zacai-storage"

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("💾 StorageManager: Initialized")
    this.isInitialized = true
  }

  public async store(key: string, data: any): Promise<void> {
    try {
      const storage = this.getStorage()
      storage[key] = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(storage))
    } catch (error) {
      console.warn("StorageManager: Could not store data:", error)
    }
  }

  public async retrieve(key: string): Promise<any> {
    try {
      const storage = this.getStorage()
      return storage[key]?.data || null
    } catch (error) {
      console.warn("StorageManager: Could not retrieve data:", error)
      return null
    }
  }

  public async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn("StorageManager: Could not clear storage:", error)
    }
  }

  private getStorage(): any {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      return {}
    }
  }
}
