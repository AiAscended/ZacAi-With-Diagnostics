export interface StorageConfig {
  useIndexedDB: boolean
  useLocalStorage: boolean
  maxStorageSize: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface StorageEntry {
  id: string
  type: string
  data: any
  timestamp: number
  size: number
  compressed?: boolean
  encrypted?: boolean
}

export class StorageManager {
  private config: StorageConfig
  private dbName = "ZacAI_Database"
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private storageQuota = 0
  private usedStorage = 0

  constructor(config: StorageConfig) {
    this.config = config
    console.log("💾 StorageManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    console.log("💾 StorageManager: Setting up storage systems...")

    if (this.config.useIndexedDB) {
      await this.initializeIndexedDB()
    }

    await this.calculateStorageUsage()
    console.log("✅ StorageManager: Initialized successfully")
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("📦 IndexedDB initialized successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("vocabulary")) {
          db.createObjectStore("vocabulary", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("mathematics")) {
          db.createObjectStore("mathematics", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("userInfo")) {
          db.createObjectStore("userInfo", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("facts")) {
          db.createObjectStore("facts", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("conversations")) {
          db.createObjectStore("conversations", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("learning")) {
          db.createObjectStore("learning", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("system")) {
          db.createObjectStore("system", { keyPath: "id" })
        }

        console.log("📦 IndexedDB object stores created")
      }
    })
  }

  public async store(storeName: string, data: any, id?: string): Promise<string> {
    const entryId = id || `${storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const entry: StorageEntry = {
      id: entryId,
      type: storeName,
      data: this.config.compressionEnabled ? this.compress(data) : data,
      timestamp: Date.now(),
      size: this.calculateSize(data),
      compressed: this.config.compressionEnabled,
      encrypted: this.config.encryptionEnabled,
    }

    if (this.config.useIndexedDB && this.db) {
      await this.storeInIndexedDB(storeName, entry)
    } else if (this.config.useLocalStorage) {
      this.storeInLocalStorage(entryId, entry)
    }

    this.usedStorage += entry.size
    return entryId
  }

  public async retrieve(storeName: string, id: string): Promise<any> {
    let entry: StorageEntry | null = null

    if (this.config.useIndexedDB && this.db) {
      entry = await this.retrieveFromIndexedDB(storeName, id)
    } else if (this.config.useLocalStorage) {
      entry = this.retrieveFromLocalStorage(id)
    }

    if (!entry) return null

    return entry.compressed ? this.decompress(entry.data) : entry.data
  }

  public async retrieveAll(storeName: string): Promise<any[]> {
    if (this.config.useIndexedDB && this.db) {
      return await this.retrieveAllFromIndexedDB(storeName)
    } else if (this.config.useLocalStorage) {
      return this.retrieveAllFromLocalStorage(storeName)
    }
    return []
  }

  public async delete(storeName: string, id: string): Promise<boolean> {
    try {
      if (this.config.useIndexedDB && this.db) {
        await this.deleteFromIndexedDB(storeName, id)
      } else if (this.config.useLocalStorage) {
        this.deleteFromLocalStorage(id)
      }
      return true
    } catch (error) {
      console.error("Failed to delete entry:", error)
      return false
    }
  }

  public async clear(storeName?: string): Promise<void> {
    if (this.config.useIndexedDB && this.db) {
      if (storeName) {
        await this.clearIndexedDBStore(storeName)
      } else {
        await this.clearAllIndexedDB()
      }
    } else if (this.config.useLocalStorage) {
      if (storeName) {
        this.clearLocalStorageByType(storeName)
      } else {
        this.clearAllLocalStorage()
      }
    }

    if (!storeName) {
      this.usedStorage = 0
    }
  }

  public async exportData(): Promise<any> {
    const exportData: any = {
      timestamp: Date.now(),
      version: "2.0.0",
      stores: {},
    }

    const storeNames = ["vocabulary", "mathematics", "userInfo", "facts", "conversations", "learning", "system"]

    for (const storeName of storeNames) {
      exportData.stores[storeName] = await this.retrieveAll(storeName)
    }

    return exportData
  }

  public async importData(data: any): Promise<void> {
    if (!data.stores) {
      throw new Error("Invalid import data format")
    }

    for (const [storeName, entries] of Object.entries(data.stores)) {
      if (Array.isArray(entries)) {
        for (const entry of entries as any[]) {
          await this.store(storeName, entry.data, entry.id)
        }
      }
    }

    console.log("📥 Data imported successfully")
  }

  public async optimizeStorage(): Promise<void> {
    console.log("🔧 Optimizing storage...")

    // Remove old entries
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
    const storeNames = ["vocabulary", "mathematics", "userInfo", "facts", "conversations", "learning"]

    for (const storeName of storeNames) {
      const entries = await this.retrieveAll(storeName)
      for (const entry of entries) {
        if (entry.timestamp < cutoffTime && entry.type !== "system") {
          await this.delete(storeName, entry.id)
        }
      }
    }

    await this.calculateStorageUsage()
    console.log("✅ Storage optimized")
  }

  private async storeInIndexedDB(storeName: string, entry: StorageEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"))
        return
      }

      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async retrieveFromIndexedDB(storeName: string, id: string): Promise<StorageEntry | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"))
        return
      }

      const transaction = this.db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  private async retrieveAllFromIndexedDB(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"))
        return
      }

      const transaction = this.db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result.map((entry: StorageEntry) => ({
          ...entry,
          data: entry.compressed ? this.decompress(entry.data) : entry.data,
        }))
        resolve(entries)
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteFromIndexedDB(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"))
        return
      }

      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async clearIndexedDBStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"))
        return
      }

      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async clearAllIndexedDB(): Promise<void> {
    const storeNames = ["vocabulary", "mathematics", "userInfo", "facts", "conversations", "learning", "system"]
    for (const storeName of storeNames) {
      await this.clearIndexedDBStore(storeName)
    }
  }

  private storeInLocalStorage(id: string, entry: StorageEntry): void {
    try {
      localStorage.setItem(`zacai_${id}`, JSON.stringify(entry))
    } catch (error) {
      console.error("Failed to store in localStorage:", error)
      throw error
    }
  }

  private retrieveFromLocalStorage(id: string): StorageEntry | null {
    try {
      const data = localStorage.getItem(`zacai_${id}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Failed to retrieve from localStorage:", error)
      return null
    }
  }

  private retrieveAllFromLocalStorage(storeName: string): any[] {
    const entries: any[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("zacai_")) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || "{}")
          if (entry.type === storeName) {
            entries.push({
              ...entry,
              data: entry.compressed ? this.decompress(entry.data) : entry.data,
            })
          }
        } catch (error) {
          console.error("Failed to parse localStorage entry:", error)
        }
      }
    }

    return entries
  }

  private deleteFromLocalStorage(id: string): void {
    localStorage.removeItem(`zacai_${id}`)
  }

  private clearLocalStorageByType(storeName: string): void {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("zacai_")) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || "{}")
          if (entry.type === storeName) {
            keysToRemove.push(key)
          }
        } catch (error) {
          console.error("Failed to parse localStorage entry:", error)
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  private clearAllLocalStorage(): void {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("zacai_")) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  private compress(data: any): string {
    // Simple compression using JSON stringify
    // In a real implementation, you might use a compression library
    return JSON.stringify(data)
  }

  private decompress(data: string): any {
    // Simple decompression
    try {
      return JSON.parse(data)
    } catch (error) {
      return data
    }
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  private async calculateStorageUsage(): Promise<void> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        this.storageQuota = estimate.quota || 0
        this.usedStorage = estimate.usage || 0
      }
    } catch (error) {
      console.warn("Could not estimate storage usage:", error)
    }
  }

  public getStorageStats(): any {
    return {
      quota: this.storageQuota,
      used: this.usedStorage,
      available: this.storageQuota - this.usedStorage,
      usagePercentage: this.storageQuota > 0 ? (this.usedStorage / this.storageQuota) * 100 : 0,
      config: this.config,
    }
  }

  public async backup(): Promise<string> {
    const data = await this.exportData()
    const backup = {
      ...data,
      backupDate: new Date().toISOString(),
      version: "2.0.0",
    }

    return JSON.stringify(backup, null, 2)
  }

  public async restore(backupData: string): Promise<void> {
    try {
      const data = JSON.parse(backupData)
      await this.clear() // Clear existing data
      await this.importData(data)
      console.log("✅ Data restored from backup")
    } catch (error) {
      console.error("Failed to restore from backup:", error)
      throw error
    }
  }
}
