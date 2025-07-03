import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { userMemory } from "@/core/memory/user-memory"

export class UserInfoModule implements ModuleInterface {
  name = "user-info"
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

    console.log("👤 Initializing User Info Module...")

    try {
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.userInfo.learntFile)
      this.initialized = true
      console.log("✅ User Info Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing User Info Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Extract personal information from input
      const personalInfo = userMemory.extractPersonalInfo(input)

      // Check if any personal information was found
      const hasPersonalInfo = this.hasExtractedInfo(personalInfo)

      // Check if user is asking about themselves
      const isPersonalQuery = this.isPersonalQuery(input)

      if (isPersonalQuery) {
        const summary = userMemory.getPersonalSummary()

        this.updateStats(Date.now() - startTime, true)

        return {
          success: true,
          data: summary,
          confidence: 0.9,
          source: this.name,
          timestamp: Date.now(),
          metadata: {
            queryType: "personal_summary",
            memoryStats: userMemory.getStats(),
          },
        }
      }

      if (!hasPersonalInfo) {
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
          queryType: "personal_extraction",
        },
      }
    } catch (error) {
      console.error("❌ Error in User Info Module processing:", error)
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

  private hasExtractedInfo(personalInfo: any): boolean {
    return (
      personalInfo.name ||
      personalInfo.age ||
      personalInfo.location ||
      personalInfo.interests.length > 0 ||
      Object.keys(personalInfo.preferences).length > 0 ||
      personalInfo.facts.length > 0
    )
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
      /what.*remember.*me/i,
      /my details/i,
      /personal information/i,
    ]

    return personalQueries.some((pattern) => pattern.test(input))
  }

  private buildPersonalInfoResponse(personalInfo: any): string {
    let response = "I've learned some information about you:\n\n"

    if (personalInfo.name) {
      response += `• Your name is **${personalInfo.name}**\n`
    }

    if (personalInfo.age) {
      response += `• You are **${personalInfo.age} years old**\n`
    }

    if (personalInfo.location) {
      response += `• You live in **${personalInfo.location}**\n`
    }

    if (personalInfo.interests.length > 0) {
      response += `• You're interested in: **${personalInfo.interests.join(", ")}**\n`
    }

    if (Object.keys(personalInfo.preferences).length > 0) {
      response += `• Your preferences:\n`
      Object.entries(personalInfo.preferences).forEach(([key, value]) => {
        response += `  - ${key}: **${value}**\n`
      })
    }

    if (personalInfo.facts.length > 0) {
      response += `• Additional facts:\n`
      personalInfo.facts.forEach((fact: string) => {
        response += `  - ${fact}\n`
      })
    }

    response += "\n✅ I'll remember this information for our future conversations!"

    return response
  }

  private async savePersonalInfo(personalInfo: any, context: string): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: {
        type: "personal_info_extraction",
        data: personalInfo,
        extractedFrom: context,
      },
      confidence: 0.9,
      source: "user-input",
      context: context,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: false,
      tags: ["personal-info", "user-data", "extraction"],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.userInfo.learntFile, learntEntry)
    this.stats.learntEntries++

    console.log(`💾 Saved personal info extraction to learnt data`)
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
    return {
      ...this.stats,
      memoryStats: userMemory.getStats(),
    }
  }

  getUserProfile(): any {
    return {
      summary: userMemory.getPersonalSummary(),
      stats: userMemory.getStats(),
      recentMemories: userMemory.search("").slice(0, 10),
    }
  }
}

export const userInfoModule = new UserInfoModule()
