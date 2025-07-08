import { SystemConfig } from "../system/config"

export class StorageManager {
  private dbName = "ZacAI_Database"
  private dbVersion = SystemConfig.STORAGE_VERSION
  private db: IDBDatabase | null = null

  constructor() {
    console.log('💾 StorageManager: Initializing...')
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
