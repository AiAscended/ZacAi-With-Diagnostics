import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { FactEntry } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { apiManager } from "@/core/api/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

export class FactsModule implements ModuleInterface {
  name = "facts"
  version = "1.0.0"
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

    console.log("Initializing Facts Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.facts.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.facts.learntFile)

      this.initialized = true
      console.log("Facts Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Facts Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Extract topics to research
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
        const fact = await this.getFactInformation(topic)
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

      // Learn from this interaction
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
        },
      }
    } catch (error) {
      console.error("Error in Facts Module processing:", error)
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

    // Look for "tell me about" patterns
    const tellMeMatch = input.match(/tell\s+me\s+about\s+(.+?)(?:\.|$)/i)
    if (tellMeMatch) {
      topics.push(tellMeMatch[1].trim())
    }

    // Look for "what is" patterns
    const whatIsMatch = input.match(/what\s+is\s+(.+?)(?:\?|$)/i)
    if (whatIsMatch) {
      topics.push(whatIsMatch[1].trim())
    }

    // Look for "information about" patterns
    const infoMatch = input.match(/information\s+about\s+(.+?)(?:\.|$)/i)
    if (infoMatch) {
      topics.push(infoMatch[1].trim())
    }

    // Extract potential topics from keywords
    if (topics.length === 0) {
      const keywords = input
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 3)
        .slice(0, 3)

      topics.push(...keywords)
    }

    return [...new Set(topics)]
  }

  private async getFactInformation(topic: string): Promise<FactEntry | null> {
    // Check learnt data first
    const learntFact = this.searchLearntData(topic)
    if (learntFact) {
      return learntFact
    }

    // Check seed data
    const seedFact = this.searchSeedData(topic)
    if (seedFact) {
      return seedFact
    }

    // Try Wikipedia API
    const wikipediaFact = await this.lookupWikipedia(topic)
    if (wikipediaFact) {
      await this.saveToLearntData(topic, wikipediaFact)
      return wikipediaFact
    }

    return null
  }

  private searchLearntData(topic: string): FactEntry | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.topic.toLowerCase().includes(topic.toLowerCase())) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(topic: string): FactEntry | null {
    if (!this.seedData || !this.seedData.facts) return null

    for (const fact of this.seedData.facts) {
      if (
        fact.topic.toLowerCase().includes(topic.toLowerCase()) ||
        fact.fact.toLowerCase().includes(topic.toLowerCase())
      ) {
        return fact
      }
    }

    return null
  }

  private async lookupWikipedia(topic: string): Promise<FactEntry | null> {
    try {
      // First, search for the topic
      const searchUrl = `${MODULE_CONFIG.facts.apiEndpoints.wikipedia}/page/summary/${encodeURIComponent(topic)}`
      const cacheKey = `wiki_${topic.toLowerCase().replace(/\s+/g, "_")}`

      const response = await apiManager.makeRequest(searchUrl, {}, cacheKey, 3600000) // 1 hour cache

      if (response && response.extract) {
        return {
          id: generateId(),
          topic: response.title || topic,
          fact: response.extract,
          category: "wikipedia",
          sources: [response.content_urls?.desktop?.page || searchUrl],
          reliability: 0.8, // Wikipedia is generally reliable
          lastVerified: Date.now(),
          relatedFacts: [],
        }
      }
    } catch (error) {
      console.error(`Error looking up Wikipedia for "${topic}":`, error)
    }

    return null
  }

  private async saveToLearntData(topic: string, fact: FactEntry): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: fact,
      confidence: fact.reliability,
      source: "wikipedia-api",
      context: `Looked up information about "${topic}"`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: fact.reliability > 0.7,
      tags: ["wikipedia", fact.category],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.facts.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  private buildFactResponse(facts: FactEntry[]): string {
    if (facts.length === 1) {
      const fact = facts[0]
      let response = `**${fact.topic}**\n\n${fact.fact}`

      if (fact.sources && fact.sources.length > 0) {
        response += `\n\n*Source: ${fact.sources[0]}*`
      }

      return response
    } else {
      let response = "Here's what I found:\n\n"
      facts.forEach((fact, index) => {
        response += `${index + 1}. **${fact.topic}**: ${fact.fact.substring(0, 200)}${fact.fact.length > 200 ? "..." : ""}\n\n`
      })
      return response
    }
  }

  private calculateFactConfidence(facts: FactEntry[]): number {
    if (facts.length === 0) return 0

    const avgReliability = facts.reduce((sum, fact) => sum + fact.reliability, 0) / facts.length

    // Adjust confidence based on number of facts found
    const countBonus = Math.min(0.1, facts.length * 0.02)

    return Math.min(1, avgReliability + countBonus)
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

export const factsModule = new FactsModule()
