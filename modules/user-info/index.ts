import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { UserProfile } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

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
      const userQueries = this.extractUserQueries(input)

      if (userQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of userQueries) {
        const result = await this.processUserQuery(query, context)
        if (result) {
          results.push(result)
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildUserResponse(results)
      const confidence = 0.9 // High confidence for user data

      await this.learn({
        input,
        results,
        context,
        timestamp: Date.now(),
      })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: userQueries.length,
          resultsFound: results.length,
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

  private extractUserQueries(input: string): string[] {
    const queries: string[] = []

    // User preference queries
    if (input.toLowerCase().includes("my preference") || input.toLowerCase().includes("i prefer")) {
      queries.push("preferences")
    }

    // Learning style queries
    if (input.toLowerCase().includes("learning style") || input.toLowerCase().includes("how i learn")) {
      queries.push("learning_style")
    }

    // Progress queries
    if (input.toLowerCase().includes("my progress") || input.toLowerCase().includes("how am i doing")) {
      queries.push("progress")
    }

    // Settings queries
    if (input.toLowerCase().includes("settings") || input.toLowerCase().includes("configuration")) {
      queries.push("settings")
    }

    // History queries
    if (input.toLowerCase().includes("history") || input.toLowerCase().includes("what have we discussed")) {
      queries.push("history")
    }

    return queries
  }

  private async processUserQuery(query: string, context?: any): Promise<any> {
    if (!this.userProfile) {
      await this.createDefaultProfile()
    }

    switch (query) {
      case "preferences":
        return this.getUserPreferences()
      case "learning_style":
        return this.getLearningStyle()
      case "progress":
        return this.getProgress()
      case "settings":
        return this.getSettings()
      case "history":
        return this.getHistory(context)
      default:
        return null
    }
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const profileData = await storageManager.loadLearntData("/learnt/user-profile.json")
      if (profileData && profileData.profile) {
        this.userProfile = profileData.profile
      } else {
        await this.createDefaultProfile()
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      await this.createDefaultProfile()
    }
  }

  private async createDefaultProfile(): Promise<void> {
    this.userProfile = {
      id: generateId(),
      preferences: {
        learningStyle: "adaptive",
        difficultyLevel: 3,
        interests: [],
        goals: [],
      },
      history: {
        totalInteractions: 0,
        favoriteTopics: [],
        learningProgress: {},
        achievements: [],
      },
      settings: {
        responseStyle: "detailed",
        verbosity: 2,
        showSources: true,
        showReasoning: true,
      },
    }

    await this.saveUserProfile()
  }

  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return

    const profileData = {
      metadata: {
        version: "1.0.0",
        lastUpdated: Date.now(),
        totalEntries: 1,
      },
      profile: this.userProfile,
    }

    await storageManager.saveLearntData("/learnt/user-profile.json", profileData)
  }

  private getUserPreferences(): any {
    return {
      type: "preferences",
      data: this.userProfile?.preferences,
      description: "Your current learning preferences and interests",
    }
  }

  private getLearningStyle(): any {
    const learningStyles = {
      visual: "You learn best through visual aids, diagrams, and images",
      auditory: "You learn best through listening and verbal explanations",
      kinesthetic: "You learn best through hands-on activities and practice",
      reading: "You learn best through reading and written materials",
      adaptive: "Your learning style adapts based on the content and context",
    }

    const currentStyle = this.userProfile?.preferences.learningStyle || "adaptive"

    return {
      type: "learning_style",
      style: currentStyle,
      description: learningStyles[currentStyle as keyof typeof learningStyles],
      recommendations: this.getLearningRecommendations(currentStyle),
    }
  }

  private getLearningRecommendations(style: string): string[] {
    const recommendations = {
      visual: [
        "Use diagrams and flowcharts when explaining concepts",
        "Include visual examples and illustrations",
        "Break down complex information into visual chunks",
      ],
      auditory: [
        "Provide verbal explanations and discussions",
        "Use analogies and storytelling",
        "Include audio examples when possible",
      ],
      kinesthetic: [
        "Include practical examples and exercises",
        "Provide step-by-step instructions",
        "Encourage hands-on practice",
      ],
      reading: [
        "Provide detailed written explanations",
        "Include references and further reading",
        "Use structured text with clear headings",
      ],
      adaptive: [
        "Mix different presentation styles",
        "Adjust based on topic complexity",
        "Provide multiple explanation formats",
      ],
    }

    return recommendations[style as keyof typeof recommendations] || recommendations.adaptive
  }

  private getProgress(): any {
    const progress = this.userProfile?.history.learningProgress || {}
    const totalInteractions = this.userProfile?.history.totalInteractions || 0

    return {
      type: "progress",
      totalInteractions,
      topicProgress: progress,
      achievements: this.userProfile?.history.achievements || [],
      favoriteTopics: this.userProfile?.history.favoriteTopics || [],
    }
  }

  private getSettings(): any {
    return {
      type: "settings",
      data: this.userProfile?.settings,
      description: "Your current system settings and preferences",
    }
  }

  private getHistory(context?: any): any {
    const recentTopics = context?.topics || []
    const conversationLength = context?.conversationLength || 0

    return {
      type: "history",
      recentTopics,
      conversationLength,
      sessionDuration: context?.sessionDuration || 0,
      totalInteractions: this.userProfile?.history.totalInteractions || 0,
    }
  }

  private buildUserResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]

      switch (result.type) {
        case "preferences":
          return `**Your Preferences:**\n\n**Learning Style:** ${result.data.learningStyle}\n**Difficulty Level:** ${result.data.difficultyLevel}/5\n**Interests:** ${result.data.interests.join(", ") || "None set"}\n**Goals:** ${result.data.goals.join(", ") || "None set"}`

        case "learning_style":
          return `**Your Learning Style: ${result.style}**\n\n${result.description}\n\n**Recommendations:**\n${result.recommendations.map((rec: string) => `• ${rec}`).join("\n")}`

        case "progress":
          return `**Your Learning Progress:**\n\n**Total Interactions:** ${result.totalInteractions}\n**Favorite Topics:** ${result.favoriteTopics.join(", ") || "None yet"}\n**Achievements:** ${result.achievements.join(", ") || "None yet"}`

        case "settings":
          return `**Your Settings:**\n\n**Response Style:** ${result.data.responseStyle}\n**Verbosity:** ${result.data.verbosity}/3\n**Show Sources:** ${result.data.showSources ? "Yes" : "No"}\n**Show Reasoning:** ${result.data.showReasoning ? "Yes" : "No"}`

        case "history":
          return `**Session History:**\n\n**Messages:** ${result.conversationLength}\n**Duration:** ${Math.round(result.sessionDuration / 60000)} minutes\n**Recent Topics:** ${result.recentTopics.join(", ") || "None"}\n**Total Interactions:** ${result.totalInteractions}`

        default:
          return JSON.stringify(result, null, 2)
      }
    }

    let response = "Here's your user information:\n\n"
    results.forEach((result, index) => {
      response += `${index + 1}. **${result.type}**: ${result.description || "User data"}\n`
    })
    return response
  }

  async updateUserPreference(key: string, value: any): Promise<void> {
    if (!this.userProfile) await this.createDefaultProfile()

    if (this.userProfile) {
      // Update preferences based on key
      if (key in this.userProfile.preferences) {
        ;(this.userProfile.preferences as any)[key] = value
      } else if (key in this.userProfile.settings) {
        ;(this.userProfile.settings as any)[key] = value
      }

      await this.saveUserProfile()
    }
  }

  async recordInteraction(topic: string, success: boolean): Promise<void> {
    if (!this.userProfile) await this.createDefaultProfile()

    if (this.userProfile) {
      this.userProfile.history.totalInteractions++

      // Update favorite topics
      const favoriteTopics = this.userProfile.history.favoriteTopics
      const existingIndex = favoriteTopics.indexOf(topic)

      if (existingIndex > -1) {
        // Move to front if already exists
        favoriteTopics.splice(existingIndex, 1)
        favoriteTopics.unshift(topic)
      } else {
        // Add new topic
        favoriteTopics.unshift(topic)
        if (favoriteTopics.length > 10) {
          favoriteTopics.pop()
        }
      }

      // Update learning progress
      if (!this.userProfile.history.learningProgress[topic]) {
        this.userProfile.history.learningProgress[topic] = 0
      }

      if (success) {
        this.userProfile.history.learningProgress[topic]++
      }

      await this.saveUserProfile()
    }
  }

  async learn(data: any): Promise<void> {
    // Extract learning insights from interaction
    if (data.context && data.context.topics) {
      for (const topic of data.context.topics) {
        await this.recordInteraction(topic, data.results.length > 0)
      }
    }

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
