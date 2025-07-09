export interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

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

    console.log("🧠 MemoryEngine: Initialized with personal info system")
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

  // GOLDEN CODE: Enhanced personal info extraction with all patterns
  private async extractPersonalInfo(message: string): Promise<void> {
    const personalPatterns = [
      { pattern: /my name is (\w+)/i, key: "name", importance: 0.9 },
      { pattern: /i have (\d+) (cats?|dogs?|pets?)/i, key: "pets", importance: 0.7 },
      { pattern: /i have a wife/i, key: "marital_status", value: "married", importance: 0.8 },
      { pattern: /i have a husband/i, key: "marital_status", value: "married", importance: 0.8 },
      { pattern: /one is named (\w+)/i, key: "pet_name_1", importance: 0.6 },
      { pattern: /the other is.*named (\w+)/i, key: "pet_name_2", importance: 0.6 },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job", importance: 0.8 },
      { pattern: /i live in (.+)/i, key: "location", importance: 0.7 },
      { pattern: /i am (\d+)\s*years?\s*old/i, key: "age", importance: 0.6 },
      { pattern: /i like (.+)/i, key: "likes", importance: 0.5 },
      { pattern: /i don't like (.+)/i, key: "dislikes", importance: 0.5 },
      { pattern: /i love (.+)/i, key: "loves", importance: 0.6 },
      { pattern: /i hate (.+)/i, key: "hates", importance: 0.6 },
      { pattern: /i'm from (.+)/i, key: "origin", importance: 0.7 },
      { pattern: /i study (.+)/i, key: "studies", importance: 0.7 },
      { pattern: /i'm studying (.+)/i, key: "studies", importance: 0.7 },
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

  // GOLDEN CODE: Enhanced personal info retrieval and summary
  public getPersonalInfoSummary(): string {
    if (this.personalInfo.size === 0) {
      return "I don't have any personal information stored about you yet."
    }

    const info: string[] = []

    // Prioritized information display
    const priorityOrder = [
      "name",
      "age",
      "location",
      "job",
      "pets",
      "pet_name_1",
      "pet_name_2",
      "marital_status",
      "studies",
      "likes",
      "loves",
      "dislikes",
      "hates",
      "origin",
    ]

    for (const key of priorityOrder) {
      if (this.personalInfo.has(key)) {
        const entry = this.personalInfo.get(key)!
        switch (key) {
          case "name":
            info.push(`Your name is ${entry.value}`)
            break
          case "age":
            info.push(`You are ${entry.value}`)
            break
          case "location":
            info.push(`You live in ${entry.value}`)
            break
          case "job":
            info.push(`You work as ${entry.value}`)
            break
          case "pets":
            info.push(`You have ${entry.value}`)
            break
          case "pet_name_1":
            info.push(`One is named ${entry.value}`)
            break
          case "pet_name_2":
            info.push(`The other is named ${entry.value}`)
            break
          case "marital_status":
            info.push(`You are ${entry.value}`)
            break
          case "studies":
            info.push(`You study ${entry.value}`)
            break
          case "likes":
            info.push(`You like ${entry.value}`)
            break
          case "loves":
            info.push(`You love ${entry.value}`)
            break
          case "dislikes":
            info.push(`You don't like ${entry.value}`)
            break
          case "hates":
            info.push(`You hate ${entry.value}`)
            break
          case "origin":
            info.push(`You're from ${entry.value}`)
            break
        }
      }
    }

    return info.join(". ") + "."
  }

  public getPersonalInfo(): Map<string, PersonalInfoEntry> {
    return this.personalInfo
  }

  public getPersonalInfoByKey(key: string): PersonalInfoEntry | undefined {
    return this.personalInfo.get(key)
  }

  public hasPersonalInfo(): boolean {
    return this.personalInfo.size > 0
  }

  public getPersonalInfoCount(): number {
    return this.personalInfo.size
  }

  // Enhanced storage methods for personal info persistence
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
      personalInfoTypes: Array.from(new Set(Array.from(this.personalInfo.values()).map((entry) => entry.key))),
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

  // Additional utility methods for personal info management
  public async addPersonalInfo(key: string, value: string, importance = 0.7): Promise<void> {
    const entry: PersonalInfoEntry = {
      key,
      value,
      timestamp: Date.now(),
      importance,
      type: "personal_info",
      source: "manual",
    }
    this.personalInfo.set(key, entry)
    await this.savePersonalInfo()
  }

  public async removePersonalInfo(key: string): Promise<void> {
    this.personalInfo.delete(key)
    await this.savePersonalInfo()
  }

  public async updatePersonalInfo(key: string, value: string): Promise<void> {
    const existing = this.personalInfo.get(key)
    if (existing) {
      existing.value = value
      existing.timestamp = Date.now()
      this.personalInfo.set(key, existing)
      await this.savePersonalInfo()
    }
  }
}
