import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

export class CodingModule implements ModuleInterface {
  name = "coding"
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

    console.log("💻 Initializing Coding Module...")

    try {
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Coding Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Coding Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      return await storageManager.loadSeedData("coding")
    } catch (error) {
      console.warn("Using fallback coding data")
      return this.getFallbackCodingData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("coding")
    } catch (error) {
      console.warn("No learnt coding data found")
      return { entries: {} }
    }
  }

  private getFallbackCodingData(): any {
    return {
      concepts: {
        javascript: {
          name: "JavaScript",
          description: "A high-level, interpreted programming language that is widely used for web development.",
          examples: [
            {
              title: "Hello World",
              code: 'console.log("Hello, World!");',
              explanation: "This prints 'Hello, World!' to the console.",
            },
          ],
        },
        react: {
          name: "React",
          description: "A JavaScript library for building user interfaces, particularly web applications.",
          examples: [
            {
              title: "Simple Component",
              code: "function Welcome() { return <h1>Hello, World!</h1>; }",
              explanation: "A basic React functional component that renders a greeting.",
            },
          ],
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const codingQueries = this.extractCodingQueries(input)

      if (codingQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of codingQueries) {
        const result = await this.processCodingQuery(query)
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

      const response = this.buildCodingResponse(results)
      const confidence = this.calculateCodingConfidence(results)

      await this.learn({ input, results, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Error in Coding Module processing:", error)
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

  private extractCodingQueries(input: string): string[] {
    const queries: string[] = []

    // Look for programming language mentions
    const languages = ["javascript", "react", "python", "html", "css"]
    for (const lang of languages) {
      if (input.toLowerCase().includes(lang)) {
        queries.push(lang)
      }
    }

    return [...new Set(queries)]
  }

  private async processCodingQuery(query: string): Promise<any> {
    // Check seed data
    if (this.seedData?.concepts) {
      const concept = this.seedData.concepts[query.toLowerCase()]
      if (concept) {
        return {
          query,
          type: "concept",
          data: concept,
          confidence: 0.9,
        }
      }
    }

    return null
  }

  private buildCodingResponse(results: any[]): string {
    let response = "## Coding Knowledge\n\n"

    for (const result of results) {
      if (result.type === "concept") {
        const concept = result.data
        response += `**${concept.name}**\n\n${concept.description}\n\n`

        if (concept.examples && concept.examples.length > 0) {
          response += `**Example:**\n\`\`\`\n${concept.examples[0].code}\n\`\`\`\n`
          response += `${concept.examples[0].explanation}\n\n`
        }
      }
    }

    return response
  }

  private calculateCodingConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      totalConfidence += result.confidence
    }

    return Math.min(1, totalConfidence / results.length)
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

export const codingModule = new CodingModule()
