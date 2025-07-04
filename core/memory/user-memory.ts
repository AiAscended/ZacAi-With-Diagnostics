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

  getPersonalInfo(): any {
    const info: any = {}
    this.personalInfo.forEach((value, key) => {
      info[key] = value
    })
    return info
  }

  extractPersonalInfo(message: string): void {
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      this.store("name", nameMatch[1], "personal", 0.95, "User introduction")
    }
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
