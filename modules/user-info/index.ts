import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { UserMemorySystem } from "@/core/memory/user-memory"

export class UserInfoModule implements ModuleInterface {
  name = "userInfo"
  version = "2.0.0"
  initialized = false

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
      // Extract personal information from input
      const personalInfo = UserMemorySystem.extractPersonalInfo(input)

      // Check if any personal information was found
      const hasPersonalInfo =
        personalInfo.name ||
        personalInfo.age ||
        personalInfo.location ||
        personalInfo.interests.length > 0 ||
        Object.keys(personalInfo.preferences).length > 0

      if (!hasPersonalInfo) {
        // Check if user is asking about themselves
        const isPersonalQuery = this.isPersonalQuery(input)
        if (isPersonalQuery) {
          const userProfile = UserMemorySystem.getUserProfile()
          const response = this.buildProfileResponse(userProfile, input)

          this.updateStats(Date.now() - startTime, true)

          return {
            success: true,
            data: response,
            confidence: 0.8,
            source: this.name,
            timestamp: Date.now(),
            metadata: {
              profileData: userProfile,
            },
          }
        }

        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      // Build response about learned information
      const response = this.buildPersonalInfoResponse(personalInfo)

      // Save to learnt data
      await this.savePersonalInfo(personalInfo, input)

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence: 0.9,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          extractedInfo: personalInfo,
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

  private isPersonalQuery(input: string): boolean {
    const personalQueries = [
      /what.*my name/i,
      /who am i/i,
      /tell me about myself/i,
      /what do you know about me/i,
      /my profile/i,
      /my information/i,
      /remember.*about me/i,
    ]

    return personalQueries.some((pattern) => pattern.test(input))
  }

  private buildPersonalInfoResponse(personalInfo: any): string {
    let response = "I've learned some information about you:\n\n"

    if (personalInfo.name) {
      response += `• Your name is ${personalInfo.name}\n`
    }

    if (personalInfo.age) {
      response += `• You are ${personalInfo.age} years old\n`
    }

    if (personalInfo.location) {
      response += `• You live in ${personalInfo.location}\n`
    }

    if (personalInfo.interests.length > 0) {
      response += `• You're interested in: ${personalInfo.interests.join(", ")}\n`
    }

    if (Object.keys(personalInfo.preferences).length > 0) {
      response += `• Your preferences: ${Object.entries(personalInfo.preferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}\n`
    }

    response += "\nI'll remember this information for our future conversations!"

    return response
  }

  private buildProfileResponse(userProfile: any, query: string): string {
    if (
      !userProfile.name &&
      !userProfile.age &&
      !userProfile.location &&
      userProfile.interests.length === 0 &&
      Object.keys(userProfile.preferences).length === 0
    ) {
      return "I don't have any personal information about you yet. Feel free to tell me about yourself!"
    }

    let response = "Here's what I know about you:\n\n"

    if (userProfile.name) {
      response += `**Name:** ${userProfile.name}\n`
    }

    if (userProfile.age) {
      response += `**Age:** ${userProfile.age}\n`
    }

    if (userProfile.location) {
      response += `**Location:** ${userProfile.location}\n`
    }

    if (userProfile.interests.length > 0) {
      response += `**Interests:** ${userProfile.interests.join(", ")}\n`
    }

    if (Object.keys(userProfile.preferences).length > 0) {
      response += `**Preferences:**\n`
      Object.entries(userProfile.preferences).forEach(([key, value]) => {
        response += `  • ${key}: ${value}\n`
      })
    }

    if (userProfile.conversationHistory.length > 0) {
      response += `\n**Conversation History:** ${userProfile.conversationHistory.length} previous interactions`
    }

    return response
  }

  private async savePersonalInfo(personalInfo: any, context: string): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: personalInfo,
      confidence: 0.9,
      source: "user-input",
      context: context,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: false,
      tags: ["personal-info", "user-data"],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.userInfo.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  async learn(data: any): Promise<void> {
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
}

export const userInfoModule = new UserInfoModule()
