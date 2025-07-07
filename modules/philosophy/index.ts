import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

export class PhilosophyModule implements ModuleInterface {
  name = "philosophy"
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

    console.log("🤔 Initializing Philosophy Module...")

    try {
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Philosophy Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Philosophy Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      return await storageManager.loadSeedData("philosophy")
    } catch (error) {
      console.warn("Using fallback philosophy data")
      return this.getFallbackPhilosophyData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("philosophy")
    } catch (error) {
      console.warn("No learnt philosophy data found")
      return { entries: {} }
    }
  }

  private getFallbackPhilosophyData(): any {
    return {
      concepts: {
        consciousness: {
          name: "Consciousness",
          description:
            "The state of being aware of and able to think about one's existence, sensations, thoughts, and surroundings",
          school: "philosophy of mind",
          arguments: ["Consciousness is fundamental to experience"],
          counterArguments: ["Consciousness emerges from complex neural activity"],
        },
        ethics: {
          name: "Ethics",
          description: "The branch of philosophy that deals with moral principles and values",
          school: "moral philosophy",
          arguments: ["Moral principles are universal"],
          counterArguments: ["Morality is relative to culture"],
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const philosophicalQueries = this.extractPhilosophicalQueries(input)

      if (philosophicalQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const concepts: any[] = []

      for (const query of philosophicalQueries) {
        const concept = await this.getPhilosophicalConcept(query)
        if (concept) {
          concepts.push(concept)
        }
      }

      if (concepts.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildPhilosophyResponse(concepts)
      const confidence = this.calculatePhilosophyConfidence(concepts)

      await this.learn({ input, concepts, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Error in Philosophy Module processing:", error)
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

  private extractPhilosophicalQueries(input: string): string[] {
    const queries: string[] = []

    // Look for philosophical concepts
    const concepts = ["consciousness", "ethics", "morality", "existence", "reality", "truth"]
    for (const concept of concepts) {
      if (input.toLowerCase().includes(concept)) {
        queries.push(concept)
      }
    }

    return [...new Set(queries)]
  }

  private async getPhilosophicalConcept(query: string): Promise<any> {
    // Check seed data
    if (this.seedData?.concepts) {
      const concept = this.seedData.concepts[query.toLowerCase()]
      if (concept) {
        return concept
      }
    }

    return null
  }

  private buildPhilosophyResponse(concepts: any[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.name}**\n\n${concept.description}`

      if (concept.school) {
        response += `\n\n**Philosophical School:** ${concept.school}`
      }

      if (concept.arguments && concept.arguments.length > 0) {
        response += `\n\n**Arguments:**\n${concept.arguments.map((arg: string) => `• ${arg}`).join("\n")}`
      }

      if (concept.counterArguments && concept.counterArguments.length > 0) {
        response += `\n\n**Counter-arguments:**\n${concept.counterArguments.map((arg: string) => `• ${arg}`).join("\n")}`
      }

      return response
    } else {
      let response = "Here are the philosophical concepts:\n\n"
      concepts.forEach((concept, index) => {
        response += `**${index + 1}. ${concept.name}**\n${concept.description}\n\n`
      })
      return response
    }
  }

  private calculatePhilosophyConfidence(concepts: any[]): number {
    if (concepts.length === 0) return 0
    return 0.8 // Philosophy concepts have moderate confidence
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

export const philosophyModule = new PhilosophyModule()
