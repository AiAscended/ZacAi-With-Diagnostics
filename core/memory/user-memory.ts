class UserMemory {
  private memories: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    this.loadFromStorage()
  }

  store(key: string, value: any, category = "general", confidence = 0.8, context?: string): void {
    const memory = {
      key,
      value,
      category,
      confidence,
      context,
      timestamp: Date.now(),
    }

    this.memories.set(key, memory)

    if (category === "personal") {
      this.personalInfo.set(key, value)
    }

    this.saveToStorage()
  }

  retrieve(key: string): any {
    return this.memories.get(key)
  }

  extractPersonalInfo(message: string): any {
    const personalInfo = {
      name: null,
      age: null,
      location: null,
      interests: [],
      preferences: {},
      facts: [],
    }

    // Extract name
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      personalInfo.name = nameMatch[1]
      this.store("name", nameMatch[1], "personal", 0.95, "User introduction")
    }

    // Extract age
    const ageMatch = message.match(/(?:i am|i'm)\s+(\d+)\s+(?:years old|years)/i)
    if (ageMatch) {
      personalInfo.age = Number.parseInt(ageMatch[1])
      this.store("age", personalInfo.age, "personal", 0.9, "Age information")
    }

    // Extract location
    const locationMatch = message.match(/(?:i live in|i'm from|from)\s+([^.!?]+)/i)
    if (locationMatch) {
      personalInfo.location = locationMatch[1].trim()
      this.store("location", personalInfo.location, "personal", 0.8, "Location information")
    }

    // Extract interests
    const interestMatch = message.match(/(?:i like|i love|interested in)\s+([^.!?]+)/i)
    if (interestMatch) {
      const interests = interestMatch[1].split(/,|\sand\s/).map((s) => s.trim())
      personalInfo.interests = interests
      interests.forEach((interest) => {
        this.store(`interest_${interest}`, interest, "personal", 0.7, "Interest information")
      })
    }

    return personalInfo
  }

  getPersonalSummary(): string {
    if (this.personalInfo.size === 0) {
      return "I don't have any personal information about you yet. Tell me about yourself!"
    }

    let summary = "Here's what I remember about you:\n\n"
    this.personalInfo.forEach((value, key) => {
      summary += `• **${key}**: ${value}\n`
    })

    return summary
  }

  getStats(): any {
    return {
      totalEntries: this.memories.size,
      personalEntries: this.personalInfo.size,
      categories: this.getCategories(),
    }
  }

  search(query: string): any[] {
    const results: any[] = []
    this.memories.forEach((memory) => {
      if (memory.value.toString().toLowerCase().includes(query.toLowerCase())) {
        results.push(memory)
      }
    })
    return results
  }

  private getCategories(): string[] {
    const categories = new Set<string>()
    this.memories.forEach((memory) => {
      categories.add(memory.category)
    })
    return Array.from(categories)
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("zacai_user_memory")
      if (stored) {
        const data = JSON.parse(stored)
        data.memories?.forEach((memory: any) => {
          this.memories.set(memory.key, memory)
        })
        data.personalInfo?.forEach((info: any) => {
          this.personalInfo.set(info.key, info.value)
        })
      }
    } catch (error) {
      console.warn("Failed to load user memory:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        memories: Array.from(this.memories.values()),
        personalInfo: Array.from(this.personalInfo.entries()).map(([key, value]) => ({ key, value })),
      }
      localStorage.setItem("zacai_user_memory", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save user memory:", error)
    }
  }
}

export const userMemory = new UserMemory()
