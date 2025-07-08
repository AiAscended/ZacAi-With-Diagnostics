import type { StorageManager } from "../managers/StorageManager"
import { SystemConfig } from "../system/config"

export interface MemoryResult {
  response: string
  confidence: number
  updates: string[]
  memoryType: "personal" | "factual" | "conversational"
}

export interface MemoryEntry {
  key: string
  value: string
  importance: number
  timestamp: number
  category: string
  lastAccessed: number
  accessCount: number
}

export class MemoryEngine {
  private storageManager: StorageManager
  private personalMemory: Map<string, MemoryEntry> = new Map()
  private conversationalMemory: Array<{ user: string; ai: string; timestamp: number }> = []
  private factualMemory: Map<string, MemoryEntry> = new Map()

  constructor(storageManager: StorageManager) {
    console.log("🧠 MemoryEngine: Initializing...")
    this.storageManager = storageManager
  }

  public async initialize(): Promise<void> {
    console.log("🧠 MemoryEngine: Loading memory systems...")

    try {
      await this.loadMemoryFromStorage()
      console.log("✅ MemoryEngine: Memory systems loaded")
    } catch (error) {
      console.error("❌ MemoryEngine: Failed to load memory:", error)
    }
  }

  public async processMemory(input: string): Promise<MemoryResult> {
    console.log(`🧠 MemoryEngine: Processing memory request: "${input}"`)

    try {
      const updates: string[] = []

      // Check if this is a memory storage request
      if (this.isMemoryStorageRequest(input)) {
        return await this.handleMemoryStorage(input, updates)
      }

      // Check if this is a memory recall request
      if (this.isMemoryRecallRequest(input)) {
        return await this.handleMemoryRecall(input, updates)
      }

      // Check if this is a memory deletion request
      if (this.isMemoryDeletionRequest(input)) {
        return await this.handleMemoryDeletion(input, updates)
      }

      // Default: store the interaction and provide general response
      await this.storeInteraction(input, "Processing memory request...")
      updates.push("Stored interaction in conversational memory")

      return {
        response: "I've noted this in my memory. What would you like me to remember or recall?",
        confidence: 0.6,
        updates,
        memoryType: "conversational",
      }
    } catch (error) {
      console.error("❌ MemoryEngine: Error processing memory:", error)
      return {
        response: "I encountered an error with my memory system.",
        confidence: 0.1,
        updates: [],
        memoryType: "conversational",
      }
    }
  }

  public async storeInteraction(userMessage: string, aiResponse: string): Promise<void> {
    // Store conversational memory
    this.conversationalMemory.push({
      user: userMessage,
      ai: aiResponse,
      timestamp: Date.now(),
    })

    // Keep conversational memory manageable
    if (this.conversationalMemory.length > SystemConfig.MAX_CONVERSATION_HISTORY) {
      this.conversationalMemory = this.conversationalMemory.slice(-SystemConfig.MAX_CONVERSATION_HISTORY * 0.8)
    }

    // Extract and store personal information
    await this.extractPersonalInfo(userMessage)

    // Save to storage
    await this.saveMemoryToStorage()
  }

  private async handleMemoryStorage(input: string, updates: string[]): Promise<MemoryResult> {
    const memoryPatterns = [
      { pattern: /remember (?:that )?(.+)/i, importance: 0.8, category: "general" },
      { pattern: /my name is (.+)/i, importance: 0.9, category: "personal" },
      { pattern: /i (?:am|work as) (?:a |an )?(.+)/i, importance: 0.7, category: "personal" },
      { pattern: /i like (.+)/i, importance: 0.6, category: "preferences" },
      { pattern: /i live in (.+)/i, importance: 0.7, category: "personal" },
      { pattern: /i was born (?:in |on )?(.+)/i, importance: 0.8, category: "personal" },
    ]

    for (const { pattern, importance, category } of memoryPatterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        const key = this.generateMemoryKey(match[1], category)
        const memoryEntry: MemoryEntry = {
          key,
          value: match[1].trim(),
          importance,
          timestamp: Date.now(),
          category,
          lastAccessed: Date.now(),
          accessCount: 1,
        }

        this.personalMemory.set(key, memoryEntry)
        updates.push(`Stored: ${match[1]}`)

        await this.saveMemoryToStorage()

        return {
          response: `I'll remember that ${match[1]}. This has been stored in my memory.`,
          confidence: 0.9,
          updates,
          memoryType: "personal",
        }
      }
    }

    return {
      response: 'I couldn\'t identify what you want me to remember. Try saying "remember that..." or "my name is..."',
      confidence: 0.3,
      updates,
      memoryType: "personal",
    }
  }

  private async handleMemoryRecall(input: string, updates: string[]): Promise<MemoryResult> {
    const recallPatterns = [
      /what (?:do you remember|did i tell you) about (.+)/i,
      /do you remember (.+)/i,
      /what is my (.+)/i,
      /tell me about (.+)/i,
    ]

    for (const pattern of recallPatterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        const searchTerm = match[1].toLowerCase()
        const memories = this.searchMemories(searchTerm)

        if (memories.length > 0) {
          const memory = memories[0]

          // Update access info
          memory.lastAccessed = Date.now()
          memory.accessCount++

          updates.push(`Recalled: ${memory.key}`)

          return {
            response: `I remember that ${memory.value}. I stored this on ${new Date(memory.timestamp).toLocaleDateString()}.`,
            confidence: 0.9,
            updates,
            memoryType: "personal",
          }
        }
      }
    }

    // Search conversational memory
    const conversationalResults = this.searchConversationalMemory(input)
    if (conversationalResults.length > 0) {
      const result = conversationalResults[0]
      updates.push("Found in conversational memory")

      return {
        response: `I remember we talked about this. You said: "${result.user}" and I responded: "${result.ai}"`,
        confidence: 0.7,
        updates,
        memoryType: "conversational",
      }
    }

    return {
      response: "I don't have any memories about that. Would you like to tell me something to remember?",
      confidence: 0.4,
      updates,
      memoryType: "personal",
    }
  }

  private async handleMemoryDeletion(input: string, updates: string[]): Promise<MemoryResult> {
    const deletePatterns = [
      /forget (?:about )?(.+)/i,
      /delete (?:the )?memory (?:of |about )?(.+)/i,
      /remove (?:the )?memory (?:of |about )?(.+)/i,
    ]

    for (const pattern of deletePatterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        const searchTerm = match[1].toLowerCase()
        const memories = this.searchMemories(searchTerm)

        if (memories.length > 0) {
          const memory = memories[0]
          this.personalMemory.delete(memory.key)
          updates.push(`Deleted: ${memory.key}`)

          await this.saveMemoryToStorage()

          return {
            response: `I've forgotten about ${memory.value}.`,
            confidence: 0.9,
            updates,
            memoryType: "personal",
          }
        }
      }
    }

    return {
      response: "I couldn't find that memory to delete. What specifically would you like me to forget?",
      confidence: 0.3,
      updates,
      memoryType: "personal",
    }
  }

  private isMemoryStorageRequest(input: string): boolean {
    const storageKeywords = ["remember", "my name is", "i am", "i like", "i live", "i work"]
    return storageKeywords.some((keyword) => input.toLowerCase().includes(keyword))
  }

  private isMemoryRecallRequest(input: string): boolean {
    const recallKeywords = ["do you remember", "what did i", "what is my", "tell me about"]
    return recallKeywords.some((keyword) => input.toLowerCase().includes(keyword))
  }

  private isMemoryDeletionRequest(input: string): boolean {
    const deleteKeywords = ["forget", "delete memory", "remove memory"]
    return deleteKeywords.some((keyword) => input.toLowerCase().includes(keyword))
  }

  private generateMemoryKey(value: string, category: string): string {
    const cleanValue = value.toLowerCase().replace(/\s+/g, "_").substring(0, 20)
    return `${category}_${cleanValue}_${Date.now()}`
  }

  private async extractPersonalInfo(message: string): Promise<void> {
    const patterns = [
      { pattern: /my name is (\w+)/i, key: "name", importance: 0.9 },
      { pattern: /i am (\d+) years old/i, key: "age", importance: 0.7 },
      { pattern: /i work (?:as |at )?(.+)/i, key: "job", importance: 0.8 },
      { pattern: /i live in (.+)/i, key: "location", importance: 0.7 },
    ]

    for (const { pattern, key, importance } of patterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        const memoryKey = `personal_${key}`
        const memoryEntry: MemoryEntry = {
          key: memoryKey,
          value: match[1].trim(),
          importance,
          timestamp: Date.now(),
          category: "personal",
          lastAccessed: Date.now(),
          accessCount: 1,
        }

        this.personalMemory.set(memoryKey, memoryEntry)
      }
    }
  }

  private searchMemories(searchTerm: string): MemoryEntry[] {
    const results: MemoryEntry[] = []

    for (const memory of this.personalMemory.values()) {
      if (memory.key.toLowerCase().includes(searchTerm) || memory.value.toLowerCase().includes(searchTerm)) {
        results.push(memory)
      }
    }

    // Sort by importance and recency
    return results.sort((a, b) => {
      const scoreA = a.importance * 0.7 + ((Date.now() - a.timestamp) / (1000 * 60 * 60 * 24)) * 0.3
      const scoreB = b.importance * 0.7 + ((Date.now() - b.timestamp) / (1000 * 60 * 60 * 24)) * 0.3
      return scoreB - scoreA
    })
  }

  private searchConversationalMemory(searchTerm: string): Array<{ user: string; ai: string; timestamp: number }> {
    return this.conversationalMemory
      .filter(
        (conv) =>
          conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.ai.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5) // Return top 5 results
  }

  private async loadMemoryFromStorage(): Promise<void> {
    try {
      const personalData = await this.storageManager.loadMemory()
      if (personalData) {
        this.personalMemory = personalData
      }

      const conversationalData = await this.storageManager.loadConversations()
      if (conversationalData) {
        this.conversationalMemory = conversationalData.map((conv: any) => ({
          user: conv.content || "",
          ai: conv.response || "",
          timestamp: conv.timestamp || Date.now(),
        }))
      }

      console.log(
        `🧠 MemoryEngine: Loaded ${this.personalMemory.size} personal memories and ${this.conversationalMemory.length} conversations`,
      )
    } catch (error) {
      console.error("❌ MemoryEngine: Failed to load memory from storage:", error)
    }
  }

  private async saveMemoryToStorage(): Promise<void> {
    try {
      await this.storageManager.saveMemory(this.personalMemory)
      console.log("💾 MemoryEngine: Memory saved to storage")
    } catch (error) {
      console.error("❌ MemoryEngine: Failed to save memory:", error)
    }
  }

  public async exportMemory(): Promise<any> {
    return {
      personal: Array.from(this.personalMemory.entries()),
      conversational: this.conversationalMemory,
      factual: Array.from(this.factualMemory.entries()),
      exportDate: new Date().toISOString(),
    }
  }

  public async importMemory(data: any): Promise<void> {
    if (data.personal) {
      this.personalMemory = new Map(data.personal)
    }
    if (data.conversational) {
      this.conversationalMemory = data.conversational
    }
    if (data.factual) {
      this.factualMemory = new Map(data.factual)
    }

    await this.saveMemoryToStorage()
    console.log("✅ MemoryEngine: Memory import completed")
  }

  public async clearMemory(): Promise<void> {
    this.personalMemory.clear()
    this.conversationalMemory = []
    this.factualMemory.clear()

    await this.saveMemoryToStorage()
    console.log("✅ MemoryEngine: All memory cleared")
  }

  public async optimizeMemory(): Promise<void> {
    console.log("🔧 MemoryEngine: Optimizing memory...")

    // Remove old, low-importance memories
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days

    for (const [key, memory] of this.personalMemory.entries()) {
      if (memory.timestamp < cutoffTime && memory.importance < 0.5 && memory.accessCount < 2) {
        this.personalMemory.delete(key)
      }
    }

    // Keep only recent conversations
    if (this.conversationalMemory.length > SystemConfig.MAX_CONVERSATION_HISTORY) {
      this.conversationalMemory = this.conversationalMemory.slice(-SystemConfig.MAX_CONVERSATION_HISTORY)
    }

    await this.saveMemoryToStorage()
    console.log("✅ MemoryEngine: Memory optimization completed")
  }

  public getStatus(): any {
    return {
      initialized: true,
      personalMemories: this.personalMemory.size,
      conversationalMemories: this.conversationalMemory.length,
      factualMemories: this.factualMemory.size,
      totalMemories: this.personalMemory.size + this.conversationalMemory.length + this.factualMemory.size,
    }
  }
}
