export class UserMemorySystem {
  private static userProfile: any = {
    name: null,
    age: null,
    location: null,
    interests: [],
    preferences: {},
    conversationHistory: [],
    personalFacts: new Map(),
    lastUpdated: null,
  }

  static extractPersonalInfo(input: string): any {
    const extracted = {
      name: this.extractName(input),
      age: this.extractAge(input),
      location: this.extractLocation(input),
      interests: this.extractInterests(input),
      preferences: this.extractPreferences(input),
    }

    // Update user profile with new information
    this.updateProfile(extracted)

    return extracted
  }

  private static extractName(input: string): string | null {
    const patterns = [/my name is (\w+)/i, /i'm (\w+)/i, /i am (\w+)/i, /call me (\w+)/i]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  private static extractAge(input: string): number | null {
    const patterns = [/i am (\d+) years old/i, /i'm (\d+) years old/i, /my age is (\d+)/i, /i am (\d+)/i]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return Number.parseInt(match[1])
      }
    }

    return null
  }

  private static extractLocation(input: string): string | null {
    const patterns = [/i live in (\w+)/i, /i'm from (\w+)/i, /i am from (\w+)/i, /my location is (\w+)/i]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  private static extractInterests(input: string): string[] {
    const interests = []
    const patterns = [/i like (\w+)/gi, /i love (\w+)/gi, /i enjoy (\w+)/gi, /i'm interested in (\w+)/gi]

    for (const pattern of patterns) {
      const matches = input.matchAll(pattern)
      for (const match of matches) {
        interests.push(match[1])
      }
    }

    return interests
  }

  private static extractPreferences(input: string): any {
    const preferences: any = {}

    // Extract color preferences
    const colorMatch = input.match(/my favorite color is (\w+)/i)
    if (colorMatch) {
      preferences.favoriteColor = colorMatch[1]
    }

    // Extract food preferences
    const foodMatch = input.match(/my favorite food is (\w+)/i)
    if (foodMatch) {
      preferences.favoriteFood = foodMatch[1]
    }

    return preferences
  }

  private static updateProfile(extracted: any): void {
    if (extracted.name) this.userProfile.name = extracted.name
    if (extracted.age) this.userProfile.age = extracted.age
    if (extracted.location) this.userProfile.location = extracted.location
    if (extracted.interests.length > 0) {
      this.userProfile.interests = [...new Set([...this.userProfile.interests, ...extracted.interests])]
    }
    if (Object.keys(extracted.preferences).length > 0) {
      this.userProfile.preferences = { ...this.userProfile.preferences, ...extracted.preferences }
    }

    this.userProfile.lastUpdated = Date.now()
  }

  static getUserProfile(): any {
    return { ...this.userProfile }
  }

  static addConversationEntry(input: string, response: string, confidence: number): void {
    this.userProfile.conversationHistory.push({
      timestamp: Date.now(),
      input,
      response,
      confidence,
      personalInfoExtracted: this.extractPersonalInfo(input),
    })

    // Keep only last 100 conversations
    if (this.userProfile.conversationHistory.length > 100) {
      this.userProfile.conversationHistory = this.userProfile.conversationHistory.slice(-100)
    }
  }

  static getRelevantMemories(query: string): any[] {
    return this.userProfile.conversationHistory
      .filter(
        (entry: any) =>
          entry.input.toLowerCase().includes(query.toLowerCase()) ||
          entry.response.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(-5) // Return last 5 relevant memories
  }
}
