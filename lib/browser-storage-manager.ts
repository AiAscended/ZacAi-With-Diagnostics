// lib/browser-storage-manager.ts

export class BrowserStorageManager {
  private dbName = "ZacAI_Database"
  private dbVersion = 1
  private db: IDBDatabase | null = null

  constructor() {
    this.initializeDB()
  }

  private async initializeDB(): Promise<void> {
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
    if (!this.db) await this.initializeDB()
    if (!this.db) return

    const transaction = this.db.transaction(["conversations"], "readwrite")
    const store = transaction.objectStore("conversations")
    await this.clearStore(store)
    for (const conversation of conversations) {
      store.add(conversation)
    }
    console.log(`💾 Saved ${conversations.length} conversations to IndexedDB`)
  }

  public async loadConversations(): Promise<any[]> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")
      const request = store.getAll()
      request.onsuccess = () => {
        console.log(`📖 Loaded ${request.result.length} conversations from IndexedDB`)
        resolve(request.result)
      }
      request.onerror = () => {
        console.error("Failed to load conversations")
        reject(request.error)
      }
    })
  }

  public async saveVocabulary(vocabulary: Map<string, string>): Promise<void> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return

    const transaction = this.db.transaction(["vocabulary"], "readwrite")
    const store = transaction.objectStore("vocabulary")
    await this.clearStore(store)
    for (const [word, category] of vocabulary.entries()) {
      store.add({ word, category, timestamp: Date.now() })
    }
    console.log(`📚 Saved ${vocabulary.size} vocabulary entries to IndexedDB`)
  }

  public async loadVocabulary(): Promise<Map<string, string>> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return new Map()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["vocabulary"], "readonly")
      const store = transaction.objectStore("vocabulary")
      const request = store.getAll()
      request.onsuccess = () => {
        const vocabulary = new Map<string, string>()
        for (const entry of request.result) {
          vocabulary.set(entry.word, entry.category)
        }
        console.log(`📖 Loaded ${vocabulary.size} vocabulary entries from IndexedDB`)
        resolve(vocabulary)
      }
      request.onerror = () => {
        console.error("Failed to load vocabulary")
        reject(request.error)
      }
    })
  }

  public async saveMemory(memory: Map<string, any>): Promise<void> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return

    const transaction = this.db.transaction(["memory"], "readwrite")
    const store = transaction.objectStore("memory")
    await this.clearStore(store)
    for (const [key, value] of memory.entries()) {
      store.add({ key, ...value, timestamp: Date.now() })
    }
    console.log(`🧠 Saved ${memory.size} memory entries to IndexedDB`)
  }

  public async loadMemory(): Promise<Map<string, any>> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return new Map()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["memory"], "readonly")
      const store = transaction.objectStore("memory")
      const request = store.getAll()
      request.onsuccess = () => {
        const memory = new Map<string, any>()
        for (const entry of request.result) {
          const { key, ...value } = entry
          memory.set(key, value)
        }
        console.log(`🧠 Loaded ${memory.size} memory entries from IndexedDB`)
        resolve(memory)
      }
      request.onerror = () => {
        console.error("Failed to load memory")
        reject(request.error)
      }
    })
  }

  public async clearAllData(): Promise<void> {
    if (!this.db) await this.initializeDB()
    if (!this.db) return

    const storeNames = ["conversations", "vocabulary", "memory", "knowledge", "system"]
    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      await this.clearStore(store)
    }
    console.log("🗑️ All data cleared from IndexedDB")
  }

  private clearStore(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
