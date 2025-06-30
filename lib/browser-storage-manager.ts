interface StorageData {
  conversations: any[]
  vocabulary: Map<string, string>
  memory: Map<string, any>
  mathFunctions: Map<string, any>
  knowledge: any[]
  lastUpdated: number
}

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

    // Clear existing conversations
    await store.clear()

    // Save new conversations
    for (const conversation of conversations) {
      await store.add(conversation)
    }

    console.log(`💾 Saved ${conversations.length} conversations to IndexedDB`)
  }

  public async loadConversations(): Promise<any[]> {
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
    if (!this.db) return

    const transaction = this.db.transaction(["vocabulary"], "readwrite")
    const store = transaction.objectStore("vocabulary")

    // Clear existing vocabulary
    await store.clear()

    // Save vocabulary entries
    for (const [word, category] of vocabulary.entries()) {
      await store.add({ word, category, timestamp: Date.now() })
    }

    console.log(`📚 Saved ${vocabulary.size} vocabulary entries to IndexedDB`)
  }

  public async loadVocabulary(): Promise<Map<string, string>> {
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
    if (!this.db) return

    const transaction = this.db.transaction(["memory"], "readwrite")
    const store = transaction.objectStore("memory")

    // Clear existing memory
    await store.clear()

    // Save memory entries
    for (const [key, value] of memory.entries()) {
      await store.add({ key, ...value, timestamp: Date.now() })
    }

    console.log(`🧠 Saved ${memory.size} memory entries to IndexedDB`)
  }

  public async loadMemory(): Promise<Map<string, any>> {
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

  public async saveSystemData(key: string, data: any): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(["system"], "readwrite")
    const store = transaction.objectStore("system")

    await store.put({ key, data, timestamp: Date.now() })
    console.log(`⚙️ Saved system data: ${key}`)
  }

  public async loadSystemData(key: string): Promise<any> {
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["system"], "readonly")
      const store = transaction.objectStore("system")
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result?.data || null)
      }

      request.onerror = () => {
        console.error(`Failed to load system data: ${key}`)
        reject(request.error)
      }
    })
  }

  public async exportAllData(): Promise<any> {
    const conversations = await this.loadConversations()
    const vocabulary = await this.loadVocabulary()
    const memory = await this.loadMemory()

    return {
      conversations,
      vocabulary: Array.from(vocabulary.entries()),
      memory: Array.from(memory.entries()),
      exportDate: new Date().toISOString(),
      version: "2.0.0",
    }
  }

  public async importAllData(data: any): Promise<void> {
    if (data.conversations) {
      await this.saveConversations(data.conversations)
    }

    if (data.vocabulary) {
      const vocabulary = new Map(data.vocabulary)
      await this.saveVocabulary(vocabulary)
    }

    if (data.memory) {
      const memory = new Map(data.memory)
      await this.saveMemory(memory)
    }

    console.log("📥 Data import completed successfully")
  }

  public async clearAllData(): Promise<void> {
    if (!this.db) return

    const storeNames = ["conversations", "vocabulary", "memory", "knowledge", "system"]

    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      await store.clear()
    }

    console.log("🗑️ All data cleared from IndexedDB")
  }

  public async getStorageStats(): Promise<any> {
    const conversations = await this.loadConversations()
    const vocabulary = await this.loadVocabulary()
    const memory = await this.loadMemory()

    return {
      conversations: conversations.length,
      vocabulary: vocabulary.size,
      memory: memory.size,
      totalEntries: conversations.length + vocabulary.size + memory.size,
      lastUpdated: Date.now(),
    }
  }
}
