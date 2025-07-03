interface PersonalInfo {
  name?: string
  age?: number
  location?: string
  interests: string[]
  preferences: { [key: string]: any }
  conversations: Array<{
    timestamp: number
    input: string
    response: string
  }>
}

class UserMemory {
  private personalInfo: PersonalInfo = {
    interests: [],
    preferences: {},
    conversations: [],
  }

  extractPersonalInfo(input: string): void {
    const lowerInput = input.toLowerCase()

    // Extract name
    const nameMatch = input.match(/my name is (\w+)|i'm (\w+)|i am (\w+)/i)
    if (nameMatch) {
      this.personalInfo.name = nameMatch[1] || nameMatch[2] || nameMatch[3]
      console.log(`📝 Learned user's name: ${this.personalInfo.name}`)
    }

    // Extract age
    const ageMatch = input.match(/i am (\d+) years old|i'm (\d+)|my age is (\d+)/i)
    if (ageMatch) {
      this.personalInfo.age = Number.parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3])
      console.log(`📝 Learned user's age: ${this.personalInfo.age}`)
    }

    // Extract location
    const locationMatch = input.match(/i live in (\w+)|i'm from (\w+)|my location is (\w+)/i)
    if (locationMatch) {
      this.personalInfo.location = locationMatch[1] || locationMatch[2] || locationMatch[3]
      console.log(`📝 Learned user's location: ${this.personalInfo.location}`)
    }

    // Extract interests
    const interestMatch = input.match(/i like (\w+)|i love (\w+)|interested in (\w+)/i)
    if (interestMatch) {
      const interest = interestMatch[1] || interestMatch[2] || interestMatch[3]
      if (!this.personalInfo.interests.includes(interest)) {
        this.personalInfo.interests.push(interest)
        console.log(`📝 Learned user's interest: ${interest}`)
      }
    }

    this.saveToStorage()
  }

  addConversation(input: string, response: string): void {
    this.personalInfo.conversations.unshift({
      timestamp: Date.now(),
      input,
      response,
    })

    // Keep only last 50 conversations
    if (this.personalInfo.conversations.length > 50) {
      this.personalInfo.conversations = this.personalInfo.conversations.slice(0, 50)
    }

    this.saveToStorage()
  }

  getPersonalSummary(): string {
    const info = this.personalInfo
    let summary = "Personal Information:\n"

    if (info.name) summary += `• Name: ${info.name}\n`
    if (info.age) summary += `• Age: ${info.age}\n`
    if (info.location) summary += `• Location: ${info.location}\n`
    if (info.interests.length > 0) summary += `• Interests: ${info.interests.join(", ")}\n`

    summary += `• Conversations: ${info.conversations.length}\n`

    return summary || "No personal information available yet."
  }

  getStats(): any {
    return {
      totalEntries: Object.keys(this.personalInfo).length,
      personalEntries: [this.personalInfo.name, this.personalInfo.age, this.personalInfo.location].filter(Boolean)
        .length,
      preferenceEntries: Object.keys(this.personalInfo.preferences).length,
      conversationCount: this.personalInfo.conversations.length,
      interests: this.personalInfo.interests.length,
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("zacai_user_memory", JSON.stringify(this.personalInfo))
    } catch (error) {
      console.error("Failed to save user memory:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("zacai_user_memory")
      if (stored) {
        this.personalInfo = { ...this.personalInfo, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error("Failed to load user memory:", error)
    }
  }

  constructor() {
    this.loadFromStorage()
  }
}

export const userMemory = new UserMemory()
