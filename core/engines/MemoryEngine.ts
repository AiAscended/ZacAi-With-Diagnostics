export class MemoryEngine {
  private isInitialized = false
  private storageManager: any
  private memories: any[] = []
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()

  constructor(storageManager: any) {
    this.storageManager = storageManager
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Load existing personal info from storage
    await this.loadPersonalInfo()

    console.log("🧠 MemoryEngine: Initialized")
    this.isInitialized = true
  }

  public async storeMemory(memory: any): Promise<void> {
    this.memories.push({
      ...memory,
      timestamp: Date.now(),
    })

    // Extract personal info from the memory if it's a conversation
    if (memory.type === "conversation" && memory.userMessage) {
      await this.extractPersonalInfo(memory.userMessage)
    }
  }

  public async retrieveMemories(query?: string): Promise<any[]> {
    return this.memories
  }

  // GOLDEN CODE: Personal info extraction from ReliableAISystem
  private async extractPersonalInfo(message: string): Promise<void> {
    const personalPatterns = [
      { pattern: /my name is (\w+)/i, key: "name", importance: 0.9 },
      { pattern: /i have (\d+) (cats?|dogs?|pets?)/i, key: "pets", importance: 0.7 },
      { pattern: /i have a wife/i, key: "marital_status", value: "married", importance: 0.8 },
      { pattern: /one is named (\w+)/i, key: "pet_name_1", importance: 0.6 },
      { pattern: /the other is.*named (\w+)/i, key: "pet_name_2", importance: 0.6 },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job", importance: 0.8 },
      { pattern: /i live in (.+)/i, key: "location", importance: 0.7 },
    ]

    personalPatterns.forEach(({ pattern, key, value, importance }) => {
      const match = message.match(pattern)
      if (match && match[1]) {
        const extractedValue = value || match[1]
        const entry: PersonalInfoEntry = {
          key,
          value: extractedValue.trim(),
          timestamp: Date.now(),
          importance: importance || 0.7,
          type: "personal_info",
          source: "conversation",
        }
        this.personalInfo.set(key, entry)
        console.log(`📝 MemoryEngine: Stored personal info: ${key} = ${extractedValue}`)
      }
    })

    // Save to storage after extraction
    await this.savePersonalInfo()
  }

  // GOLDEN CODE: Personal info retrieval and summary
  public getPersonalInfoSummary(): string {
    if (this.personalInfo.size === 0) {
      return "I don't have any personal information stored about you yet."
    }

    const info: string[] = []

    if (this.personalInfo.has("name")) {
      info.push(`Your name is ${this.personalInfo.get("name")?.value}`)
    }

    if (this.personalInfo.has("pets")) {
      info.push(`You have ${this.personalInfo.get("pets")?.value}`)
    }

    if (this.personalInfo.has("pet_name_1")) {
      info.push(`One is named ${this.personalInfo.get("pet_name_1")?.value}`)
    }

    if (this.personalInfo.has("pet_name_2")) {
      info.push(`The other is named ${this.personalInfo.get("pet_name_2")?.value}`)
    }

    if (this.personalInfo.has("job")) {
      info.push(`You work as ${this.personalInfo.get("job")?.value}`)
    }

    if (this.personalInfo.has("location")) {
      info.push(`You live in ${this.personalInfo.get("location")?.value}`)
    }

    if (this.personalInfo.has("marital_status")) {
      info.push(`You are ${this.personalInfo.get("marital_status")?.value}`)
    }

    return info.join(". ") + "."
  }

  public getPersonalInfo(): Map<string, PersonalInfoEntry> {
    return this.personalInfo
  }

  // Storage methods for personal info persistence
  private async loadPersonalInfo(): Promise<void> {
    try {
      const stored = localStorage.getItem("zacai-personal-info")
      if (stored) {
        const data = JSON.parse(stored)
        this.personalInfo = new Map(data)
        console.log(`📚 MemoryEngine: Loaded ${this.personalInfo.size} personal info entries`)
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
      this.personalInfo = new Map()
    }
  }

  private async savePersonalInfo(): Promise<void> {
    try {
      const data = Array.from(this.personalInfo.entries())
      localStorage.setItem("zacai-personal-info", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  public getStats(): any {
    return {
      initialized: this.isInitialized,
      totalMemories: this.memories.length,
      personalInfoEntries: this.personalInfo.size,
    }
  }

  public async exportData(): Promise<any> {
    return {
      memories: this.memories,
      personalInfo: Array.from(this.personalInfo.entries()),
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.memories) {
      this.memories = data.memories
    }
    if (data.personalInfo) {
      this.personalInfo = new Map(data.personalInfo)
      await this.savePersonalInfo()
    }
  }

  public async clearData(): Promise<void> {
    this.memories = []
    this.personalInfo = new Map()
    localStorage.removeItem("zacai-personal-info")
  }
}

interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}
