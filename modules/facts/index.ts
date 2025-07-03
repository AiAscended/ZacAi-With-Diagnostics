import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { FactEntry } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { wikipediaAPI } from "./wikipedia-api"

export class FactsModule implements ModuleInterface {
  name = "facts"
  version = "2.0.0"
  initialized = false

  private seedData: any = null
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

    console.log("🌍 Initializing Facts Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.facts.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.facts.learntFile)

      this.initialized = true
      console.log("✅ Facts Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Facts Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const topics = this.extractTopics(input)

      if (topics.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const facts: FactEntry[] = []

      for (const topic of topics) {
        // Check learnt data first
        let fact = await this.getFactFromLearnt(topic)

        if (!fact) {
          // Check seed data
          fact = await this.getFactFromSeed(topic)
        }

        if (!fact) {
          // Look up online via Wikipedia
          fact = await wikipediaAPI.lookupTopic(topic)

          if (fact) {
            // Save to learnt data for future use
            await this.saveFactToLearnt(fact, input)
          }
        }

        if (fact) {
          facts.push(fact)
        }
      }

      if (facts.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildFactResponse(facts)
      const confidence = this.calculateFactConfidence(facts)

      await this.learn({
        input,
        facts,
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
          topicsProcessed: topics.length,
          factsFound: facts.length,
          sources: facts.map((f) => f.source),
        },
      }
    } catch (error) {
      console.error("❌ Error in Facts Module processing:", error)
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

  private extractTopics(input: string): string[] {
    const topics: string[] = []

    // Look for "tell me about X" patterns
    const tellMeMatch = input.match(/tell me about (.+?)(?:\.|$|\?)/i)
    if (tellMeMatch) {
      topics.push(tellMeMatch[1].trim())
    }

    // Look for "what is X" patterns
    const whatIsMatch = input.match(/what is (.+?)(?:\?|$|\.|,)/i)
    if (whatIsMatch) {
      topics.push(whatIsMatch[1].trim())
    }

    // Look for "information about X" patterns
    const infoMatch = input.match(/information about (.+?)(?:\.|$|\?)/i)
    if (infoMatch) {
      topics.push(infoMatch[1].trim())
    }

    // Look for "explain X" patterns
    const explainMatch = input.match(/explain (.+?)(?:\.|$|\?)/i)
    if (explainMatch) {
      topics.push(explainMatch[1].trim())
    }

    // Look for "who is X" patterns
    const whoIsMatch = input.match(/who is (.+?)(?:\?|$|\.|,)/i)
    if (whoIsMatch) {
      topics.push(whoIsMatch[1].trim())
    }

    // Extract potential topics from keywords
    const keywords = [
      "science",
      "history",
      "technology",
      "nature",
      "space",
      "earth",
      "biology",
      "physics",
      "chemistry",
      "astronomy",
      "geography",
      "mathematics",
      "philosophy",
      "psychology",
      "sociology",
      "economics",
    ]

    for (const keyword of keywords) {
      if (input.toLowerCase().includes(keyword)) {
        topics.push(keyword)
      }
    }

    return [...new Set(topics)] // Remove duplicates
  }

  private async getFactFromLearnt(topic: string): Promise<FactEntry | null> {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (
        entryData.content &&
        (entryData.content.topic?.toLowerCase() === topic.toLowerCase() ||
          entryData.content.content?.toLowerCase().includes(topic.toLowerCase()))
      ) {
        return entryData.content
      }
    }

    return null
  }

  private async getFactFromSeed(topic: string): Promise<FactEntry | null> {
    if (!this.seedData || !this.seedData.facts) return null

    const factData = this.seedData.facts[topic.toLowerCase()]
    if (factData) {
      return {
        topic,
        content: factData.content || factData.description,
        source: "seed-data",
        category: factData.category || "general",
        verified: true,
        lastUpdated: Date.now(),
        relatedTopics: factData.relatedTopics || [],
      }
    }

    return null
  }

  private async saveFactToLearnt(fact: FactEntry, context: string): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: fact,
      confidence: 0.8, // Wikipedia data is generally reliable
      source: "wikipedia-api",
      context: `Looked up information about "${fact.topic}" - ${context}`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: true,
      tags: ["api-lookup", fact.category, "wikipedia"],
      relationships: fact.relatedTopics || [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.facts.learntFile, learntEntry)
    this.stats.learntEntries++

    console.log(`💾 Saved new fact to learnt data: ${fact.topic}`)
  }

  private buildFactResponse(facts: FactEntry[]): string {
    if (facts.length === 1) {
      const fact = facts[0]
      let response = `**${fact.topic}**\n\n${fact.content}`

      if (fact.relatedTopics && fact.relatedTopics.length > 0) {
        response += `\n\n**Related topics:** ${fact.relatedTopics.slice(0, 3).join(", ")}`
      }

      response += `\n\n*Source: ${fact.source}*`
      return response
    } else {
      let response = "Here's what I found:\n\n"
      facts.forEach((fact, index) => {
        response += `**${index + 1}. ${fact.topic}**\n${fact.content}\n\n`
      })
      response += `*Sources: ${[...new Set(facts.map((f) => f.source))].join(", ")}*`
      return response
    }
  }

  private calculateFactConfidence(facts: FactEntry[]): number {
    if (facts.length === 0) return 0

    let totalConfidence = 0
    for (const fact of facts) {
      if (fact.source === "wikipedia") totalConfidence += 0.9
      else if (fact.source === "seed-data") totalConfidence += 0.95
      else totalConfidence += 0.7
    }

    return Math.min(1, totalConfidence / facts.length)
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

  async getRandomFact(): Promise<FactEntry | null> {
    return await wikipediaAPI.getRandomFact()
  }
}

export const factsModule = new FactsModule()
