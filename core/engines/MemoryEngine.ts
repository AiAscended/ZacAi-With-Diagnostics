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

    console.log("🧠 MemoryEngine: Initialized with golden code personal info system")
    this.isInitialized = true
  }

  public async storeMemory(memory: any): Promise<void> {
    this.memories.push({
      ...memory,
      timestamp: Date.now(),
    })

    // GOLDEN CODE: Handle immediate extraction from CognitiveRouter
    if (memory.type === "conversation") {
      if (memory.extractedInfo && memory.immediate) {
        // This was already processed by CognitiveRouter, just store it
        await this.storeExtractedInfoImmediate(memory.extractedInfo)
      } else if (memory.userMessage) {
        // Fallback extraction for any missed patterns
        await this.extractPersonalInfo(memory.userMessage)
      }
    }
  }

  // GOLDEN CODE: Store immediately extracted personal info from CognitiveRouter
  private async storeExtractedInfoImmediate(extractedInfo: any): Promise<void> {
    for (const [key, value] of Object.entries(extractedInfo)) {
      if (value && typeof value === "string") {
        const entry: PersonalInfoEntry = {
          key,
          value: value.trim(),
          timestamp: Date.now(),
          importance: this.getImportanceForKey(key),
          type: "personal_info",
          source: "immediate_extraction",
        }
        this.personalInfo.set(key, entry)
        console.log(`📝 MemoryEngine: Stored immediate extraction: ${key} = ${value}`)
      }
    }
    await this.savePersonalInfo()
  }

  private getImportanceForKey(key: string): number {
    const importanceMap: { [key: string]: number } = {
      name: 0.9,
      pets: 0.7,
      pet_name_1: 0.6,
      pet_name_2: 0.6,
      job: 0.8,
      location: 0.7,
      age: 0.6,
      marital_status: 0.8,
    }
    return importanceMap[key] || 0.5
  }

  public async retrieveMemories(query?: string): Promise<any[]> {
    return this.memories
  }

  // GOLDEN CODE: Enhanced personal info extraction with comprehensive patterns
  private async extractPersonalInfo(message: string): Promise<void> {
    const personalPatterns = [
      { pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i, key: "name", importance: 0.9 },
      { pattern: /i have (\d+)\s+(cats?|dogs?|pets?)/i, key: "pets", importance: 0.7 },
      { pattern: /i have a wife/i, key: "marital_status", value: "married", importance: 0.8 },
      { pattern: /i have a husband/i, key: "marital_status", value: "married", importance: 0.8 },

      // ENHANCED: Comprehensive pet name patterns from all old systems
      { pattern: /(?:one|first|older)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i, key: "pet_name_1", importance: 0.6 },
      {
        pattern: /(?:other|second|younger|another)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i,
        key: "pet_name_2",
        importance: 0.6,
      },
      { pattern: /(?:and|,)\s*(\w+)\s+(?:is\s+)?(?:the\s+)?(?:other|second)/i, key: "pet_name_2", importance: 0.6 },
      { pattern: /(\w+)\s+and\s+(\w+)\s+are\s+(?:my|their)\s+names/i, key: "pet_names_both", importance: 0.6 },
      { pattern: /named\s+(\w+)\s+and\s+(\w+)/i, key: "pet_names_both", importance: 0.6 },
      { pattern: /they're\s+called\s+(\w+)\s+and\s+(\w+)/i, key: "pet_names_both", importance: 0.6 },

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
      if (match) {
        if (key === "pet_names_both" && match[1] && match[2]) {
          // Handle both pet names at once
          this.personalInfo.set("pet_name_1", {
            key: "pet_name_1",
            value: match[1].trim(),
            timestamp: Date.now(),
            importance: 0.6,
            type: "personal_info",
            source: "conversation",
          })
          this.personalInfo.set("pet_name_2", {
            key: "pet_name_2",
            value: match[2].trim(),
            timestamp: Date.now(),
            importance: 0.6,
            type: "personal_info",
            source: "conversation",
          })
          console.log(`📝 MemoryEngine: Stored both pet names: ${match[1]} and ${match[2]}`)
        } else if (match[1]) {
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
      }
    })

    // Save to storage after extraction
    await this.savePersonalInfo()
  }

  // GOLDEN CODE: Enhanced personal info summary with better formatting
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
            info.push(`You are ${entry.value} years old`)
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
