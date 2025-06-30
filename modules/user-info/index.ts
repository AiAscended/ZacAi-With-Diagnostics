import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { UserProfile } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

export class UserInfoModule implements ModuleInterface {
  name = "user-info"
  version = "1.0.0"
  initialized = false

  private userProfile: UserProfile = {
    preferences: {},
    learningHistory: [],
    interests: [],
    skillLevel: {},
  }
  private learntData: any = null
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
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.userInfo.learntFile)
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
      const userInfoQueries = this.extractUserInfoQueries(input)

      if (userInfoQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      let response = ""
      let confidence = 0

      for (const query of userInfoQueries) {
        if (query.type === "store") {
          await this.storeUserInfo(query.key, query.value)
          response += `I've remembered that ${query.key}: ${query.value}\n`
          confidence = 0.9
        } else if (query.type === "retrieve") {
          const info = this.getUserInfo(query.key)
          if (info) {
            response += `I remember that ${query.key}: ${info}\n`
            confidence = 0.8
          } else {
            response += `I don't have any information about ${query.key}\n`
            confidence = 0.3
          }
        } else if (query.type === "profile") {
          response += this.generateProfileSummary()
          confidence = 0.7
        }
      }

      await this.learn({
        input,
        queries: userInfoQueries,
        context,
        timestamp: Date.now(),
      })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response.trim(),
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: userInfoQueries.length,
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

  private extractUserInfoQueries(input: string): any[] {
    const queries: any[] = []

    // Look for "my name is X" patterns
    const nameMatch = input.match(/my name is (.+?)(?:\.|$)/i)
    if (nameMatch) {
      queries.push({
        type: "store",
        key: "name",
        value: nameMatch[1].trim(),
      })
    }

    // Look for "I am X" patterns
    const iAmMatch = input.match(/I am (.+?)(?:\.|$)/i)
    if (iAmMatch) {
      queries.push({
        type: "store",
        key: "description",
        value: iAmMatch[1].trim(),
      })
    }

    // Look for "I like X" patterns
    const likeMatch = input.match(/I like (.+?)(?:\.|$)/i)
    if (likeMatch) {
      queries.push({
        type: "store",
        key: "interests",
        value: likeMatch[1].trim(),
      })
    }

    // Look for "what do you remember about me" patterns
    if (input.toLowerCase().includes("remember about me") || input.toLowerCase().includes("know about me")) {
      queries.push({
        type: "profile",
      })
    }

    // Look for "do you remember my X" patterns
    const rememberMatch = input.match(/do you remember my (.+?)(?:\?|$)/i)
    if (rememberMatch) {
      queries.push({
        type: "retrieve",
        key: rememberMatch[1].trim(),
      })
    }

    return queries
  }

  private async storeUserInfo(key: string, value: string): Promise<void> {
    if (key === "interests") {
      if (!this.userProfile.interests.includes(value)) {
        this.userProfile.interests.push(value)
      }
    } else {
      this.userProfile.preferences[key] = value
    }

    await this.saveUserProfile()
    this.stats.learntEntries++
  }

  private getUserInfo(key: string): string | null {
    if (key === "interests") {
      return this.userProfile.interests.join(", ")
    }
    return this.userProfile.preferences[key] || null
  }

  private generateProfileSummary(): string {
    let summary = "Here's what I remember about you:\n\n"

    if (this.userProfile.preferences.name) {
      summary += `• Your name is ${this.userProfile.preferences.name}\n`
    }

    if (this.userProfile.preferences.description) {
      summary += `• You are ${this.userProfile.preferences.description}\n`
    }

    if (this.userProfile.interests.length > 0) {
      summary += `• Your interests include: ${this.userProfile.interests.join(", ")}\n`
    }

    if (this.userProfile.learningHistory.length > 0) {
      summary += `• You've asked about ${this.userProfile.learningHistory.length} different topics\n`
    }

    if (Object.keys(this.userProfile.preferences).length === 0 && this.userProfile.interests.length === 0) {
      summary = "I don't have any personal information about you yet. Feel free to tell me about yourself!"
    }

    return summary
  }

  private async loadUserProfile(): Promise<void> {
    if (this.learntData && this.learntData.entries) {
      for (const entry of Object.values(this.learntData.entries)) {
        const entryData = entry as any
        if (entryData.content && entryData.content.type === "user-profile") {
          this.userProfile = { ...this.userProfile, ...entryData.content.profile }
        }
      }
    }
  }

  private async saveUserProfile(): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: {
        type: "user-profile",
        profile: this.userProfile,
      },
      confidence: 1.0,
      source: "user-info-module",
      context: "User profile update",
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: true,
      tags: ["user-profile"],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.userInfo.learntFile, learntEntry)
  }

  async learn(data: any): Promise<void> {
    // Track learning history
    if (data.context && data.context.topics) {
      for (const topic of data.context.topics.slice(0, 3)) {
        this.userProfile.learningHistory.push({
          topic,
          timestamp: Date.now(),
          confidence: 0.8,
          source: "conversation",
          context: data.input,
        })
      }

      // Keep only recent history
      if (this.userProfile.learningHistory.length > 50) {
        this.userProfile.learningHistory = this.userProfile.learningHistory.slice(-50)
      }

      await this.saveUserProfile()
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

  getUserProfile(): UserProfile {
    return { ...this.userProfile }
  }
}

export const userInfoModule = new UserInfoModule()
