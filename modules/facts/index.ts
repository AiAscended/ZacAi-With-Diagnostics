import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

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
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Facts Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Facts Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      return await storageManager.loadSeedData("facts")
    } catch (error) {
      console.warn("Using fallback facts data")
      return this.getFallbackFactsData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("facts")
    } catch (error) {
      console.warn("No learnt facts data found")
      return { entries: {} }
    }
  }

  private getFallbackFactsData(): any {
    return {
      facts: {
        "artificial intelligence": {
          content:
            "Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
          category: "technology",
          verified: true,
        },
        "machine learning": {
          content:
            "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.",
          category: "technology",
          verified: true,
        },
      },
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

      const facts: any[] = []

      for (const topic of topics) {
        const fact = await this.getFactFromData(topic)
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

      await this.learn({ input, facts, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
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

    return [...new Set(topics)]
  }

  private async getFactFromData(topic: string): Promise<any> {
    // Check seed data first
    if (this.seedData?.facts) {
      const factData = this.seedData.facts[topic.toLowerCase()]
      if (factData) {
        return {
          topic,
          content: factData.content,
          source: "seed-data",
          category: factData.category || "general",
          verified: factData.verified || false,
        }
      }
    }

    // Check learnt data
    if (this.learntData?.entries) {
      for (const entry of Object.values(this.learntData.entries)) {
        const entryData = entry as any
        if (entryData.content?.topic?.toLowerCase() === topic.toLowerCase()) {
          return entryData.content
        }
      }
    }

    return null
  }

  private buildFactResponse(facts: any[]): string {
    if (facts.length === 1) {
      const fact = facts[0]
      let response = `**${fact.topic}**\n\n${fact.content}`
      response += `\n\n*Source: ${fact.source}*`
      return response
    } else {
      let response = "Here's what I found:\n\n"
      facts.forEach((fact, index) => {
        response += `**${index + 1}. ${fact.topic}**\n${fact.content}\n\n`
      })
      return response
    }
  }

  private calculateFactConfidence(facts: any[]): number {
    if (facts.length === 0) return 0

    let totalConfidence = 0
    for (const fact of facts) {
      if (fact.source === "seed-data") totalConfidence += 0.95
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
}

export const factsModule = new FactsModule()
