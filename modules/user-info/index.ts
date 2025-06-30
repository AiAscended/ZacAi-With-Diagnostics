import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

interface UserProfile {
  name?: string
  preferences: {
    responseStyle: "brief" | "detailed" | "technical"
    topics: string[]
    learningLevel: "beginner" | "intermediate" | "advanced"
  }
  history: {
    commonQuestions: string[]
    learningProgress: { [topic: string]: number }
    lastActive: number
  }
}

export class UserInfoModule implements ModuleInterface {
  name = "user-info"
  version = "1.0.0"
  initialized = false

  private userProfile: UserProfile | null = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing User Info Module...")

    try {
      await this.loadUserProfile()
      this.initialized = true
      console.log("User Info Module initialized successfully")
    } catch (error) {
      console.error("Error initializing User Info Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Check if input is asking for user info or preferences
      const isUserInfoQuery = this.isUserInfoQuery(input)

      if (!isUserInfoQuery) {
        // Update user profile based on interaction
        await this.updateUserProfile(input, context)

        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      // Handle user info queries
      const response = await this.handleUserInfoQuery(input)

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence: 0.9,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          profileExists: !!this.userProfile,
        },
      }
    } catch (error) {
      console.error("Error in User Info Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private isUserInfoQuery(input: string): boolean {
    const lowercaseInput = input.toLowerCase()

    const userInfoKeywords = [
      "my name",
      "my preferences",
      "remember me",
      "about me",
      "my profile",
      "my settings",
      "what do you know about me",
      "my learning",
      "my progress",
      "my history",
    ]

    return userInfoKeywords.some((keyword) => lowercaseInput.includes(keyword))
  }

  private async handleUserInfoQuery(input: string): Promise<string> {
    if (!this.userProfile) {
      return "I don't have any information about you yet. As we interact more, I'll learn about your preferences and interests to provide better assistance."
    }

    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("name")) {
      return this.userProfile.name
        ? `Your name is ${this.userProfile.name}.`
        : "I don't know your name yet. Feel free to tell me!"
    }

    if (lowercaseInput.includes("preferences")) {
      return this.formatPreferences()
    }

    if (lowercaseInput.includes("progress") || lowercaseInput.includes("learning")) {
      return this.formatLearningProgress()
    }

    // General profile summary
    return this.formatProfileSummary()
  }

  private formatPreferences(): string {
    if (!this.userProfile) return "No preferences set yet."

    const prefs = this.userProfile.preferences
    let response = "**Your Preferences:**\n\n"

    response += `• Response Style: ${prefs.responseStyle}\n`
    response += `• Learning Level: ${prefs.learningLevel}\n`

    if (prefs.topics.length > 0) {
      response += `• Interested Topics: ${prefs.topics.join(", ")}\n`
    }

    return response
  }

  private formatLearningProgress(): string {
    if (!this.userProfile || Object.keys(this.userProfile.history.learningProgress).length === 0) {
      return "No learning progress tracked yet. Keep asking questions to build your learning profile!"
    }

    let response = "**Your Learning Progress:**\n\n"

    Object.entries(this.userProfile.history.learningProgress).forEach(([topic, progress]) => {
      const percentage = Math.round(progress * 100)
      response += `• ${topic}: ${percentage}% mastery\n`
    })

    return response
  }

  private formatProfileSummary(): string {
    if (!this.userProfile) return "No profile information available yet."

    let response = "**Your Profile Summary:**\n\n"

    if (this.userProfile.name) {
      response += `Name: ${this.userProfile.name}\n`
    }

    response += `Learning Level: ${this.userProfile.preferences.learningLevel}\n`
    response += `Response Style: ${this.userProfile.preferences.responseStyle}\n`

    if (this.userProfile.preferences.topics.length > 0) {
      response += `Interests: ${this.userProfile.preferences.topics.slice(0, 5).join(", ")}\n`
    }

    response += `Questions Asked: ${this.userProfile.history.commonQuestions.length}\n`
    response += `Last Active: ${new Date(this.userProfile.history.lastActive).toLocaleDateString()}`

    return response
  }

  private async updateUserProfile(input: string, context: any): Promise<void> {
    if (!this.userProfile) {
      this.userProfile = this.createDefaultProfile()
    }

    // Update last active
    this.userProfile.history.lastActive = Date.now()

    // Track common questions
    if (!this.userProfile.history.commonQuestions.includes(input)) {
      this.userProfile.history.commonQuestions.push(input)

      // Keep only last 50 questions
      if (this.userProfile.history.commonQuestions.length > 50) {
        this.userProfile.history.commonQuestions = this.userProfile.history.commonQuestions.slice(-50)
      }
    }

    // Extract topics from input
    const topics = this.extractTopics(input)
    topics.forEach((topic) => {
      if (!this.userProfile!.preferences.topics.includes(topic)) {
        this.userProfile!.preferences.topics.push(topic)
      }
    })

    // Update learning progress based on context
    if (context && context.keywords) {
      context.keywords.forEach((keyword: string) => {
        if (!this.userProfile!.history.learningProgress[keyword]) {
          this.userProfile!.history.learningProgress[keyword] = 0.1
        } else {
          this.userProfile!.history.learningProgress[keyword] = Math.min(
            1,
            this.userProfile!.history.learningProgress[keyword] + 0.05,
          )
        }
      })
    }

    // Save profile
    await this.saveUserProfile()
  }

  private extractTopics(input: string): string[] {
    const topics: string[] = []
    const lowercaseInput = input.toLowerCase()

    // Common topic categories
    const topicKeywords = {
      mathematics: ["math", "calculate", "equation", "number"],
      science: ["science", "physics", "chemistry", "biology"],
      technology: ["code", "program", "computer", "software"],
      philosophy: ["philosophy", "ethics", "moral", "meaning"],
      language: ["word", "define", "vocabulary", "grammar"],
    }

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowercaseInput.includes(keyword))) {
        topics.push(topic)
      }
    })

    return topics
  }

  private createDefaultProfile(): UserProfile {
    return {
      preferences: {
        responseStyle: "detailed",
        topics: [],
        learningLevel: "intermediate",
      },
      history: {
        commonQuestions: [],
        learningProgress: {},
        lastActive: Date.now(),
      },
    }
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const profileData = await storageManager.loadLearntData("/learnt/user-profile.json")
      if (profileData && profileData.profile) {
        this.userProfile = profileData.profile
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return

    const profileData = {
      metadata: {
        version: "1.0.0",
        lastUpdated: Date.now(),
      },
      profile: this.userProfile,
    }

    await storageManager.saveLearntData("/learnt/user-profile.json", profileData)
  }

  async learn(data: any): Promise<void> {
    // Learning is handled in updateUserProfile
    this.stats.lastUpdate = Date.now()
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile
  }
}

export const userInfoModule = new UserInfoModule()
