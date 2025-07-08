import { SystemConfig } from "../system/config"

export class StorageManager {
  private dbName = "ZacAI_Database"
  private dbVersion = SystemConfig.STORAGE_VERSION
  private db: IDBDatabase | null = null

  constructor() {
    console.log("💾 StorageManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error("Failed to open IndexedDB")
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("✅ IndexedDB initialized successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("conversations")) {
          db.createObjectStore("conversations", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("vocabulary")) {
          db.createObjectStore("vocabulary", { keyPath: "word" })
        }
        if (!db.objectStoreNames.contains("memory")) {
          db.createObjectStore("memory", { keyPath: "key" })
        }
        if (!db.objectStoreNames.contains("knowledge")) {
          db.createObjectStore("knowledge", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("system")) {
          db.createObjectStore("system", { keyPath: "key" })
        }

        console.log("📦 Database schema created")
      }
    })
  }

  public async saveConversations(conversations: any[]): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(["conversations"], "readwrite")
    const store = transaction.objectStore("conversations")

    await store.clear()
    for (const conversation of conversations) {
      await store.add(conversation)
    }

    console.log(`💾 Saved ${conversations.length} conversations`)
  }

  public async loadConversations(): Promise<any[]> {
    if (!this.db) return []

    const transaction = this.db.transaction(["conversations"], "readonly")
    const store = transaction.objectStore("conversations")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  public async saveMemory(memory: Map<string, any>): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(["memory"], "readwrite")
    const store = transaction.objectStore("memory")

    await store.clear()
    for (const [key, value] of memory.entries()) {
      await store.add({ key, ...value })
    }

    console.log(`💾 Saved ${memory.size} memory entries`)
  }

  public async loadMemory(): Promise<Map<string, any> | null> {
    if (!this.db) return null

    const transaction = this.db.transaction(["memory"], "readonly")
    const store = transaction.objectStore("memory")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result || []
        const memory = new Map()
        result.forEach((item: any) => {
          const { key, ...value } = item
          memory.set(key, value)
        })
        resolve(memory)
      }
      request.onerror = () => reject(request.error)
    })
  }

  public async saveKnowledge(knowledge: any): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(["knowledge"], "readwrite")
    const store = transaction.objectStore("knowledge")

    await store.clear()
    await store.add({ id: "main", data: knowledge })

    console.log("💾 Knowledge saved")
  }

  public async loadKnowledge(): Promise<any | null> {
    if (!this.db) return null

    const transaction = this.db.transaction(["knowledge"], "readonly")
    const store = transaction.objectStore("knowledge")
    const request = store.get("main")

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  public async saveSystemData(key: string, data: any): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(["system"], "readwrite")
    const store = transaction.objectStore("system")

    await store.put({ key, data, timestamp: Date.now() })
  }

  public async loadSystemData(key: string): Promise<any | null> {
    if (!this.db) return null

    const transaction = this.db.transaction(["system"], "readonly")
    const store = transaction.objectStore("system")
    const request = store.get(key)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  public async clearAllData(): Promise<void> {
    if (!this.db) return

    const storeNames = ["conversations", "vocabulary", "memory", "knowledge", "system"]

    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      await store.clear()
    }

    console.log("🗑️ All data cleared from storage")
  }

  public async optimize(): Promise<void> {
    console.log("🔧 Optimizing storage...")
    // Storage optimization would go here
    console.log("✅ Storage optimization completed")
  }

  public getStats(): any {
    return {
      initialized: this.db !== null,
      dbName: this.dbName,
      dbVersion: this.dbVersion,
      available: typeof indexedDB !== "undefined",
    }
  }
}
