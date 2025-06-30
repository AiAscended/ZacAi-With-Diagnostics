import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { CodingConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

export class CodingModule implements ModuleInterface {
  name = "coding"
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

    console.log("Initializing Coding Module...")

    try {
      this.seedData = await storageManager.loadSeedData("/seed/coding.json")
      this.learntData = await storageManager.loadLearntData("/learnt/coding.json")

      this.initialized = true
      console.log("Coding Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Coding Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Check if input is coding-related
      const codingTopics = this.extractCodingTopics(input)

      if (codingTopics.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const concepts: CodingConcept[] = []

      for (const topic of codingTopics) {
        const concept = await this.getCodingConcept(topic)
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

      const response = this.buildCodingResponse(concepts)
      const confidence = this.calculateCodingConfidence(concepts)

      // Learn from this interaction
      await this.learn({
        input,
        concepts,
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
          topicsProcessed: codingTopics.length,
          conceptsFound: concepts.length,
        },
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

  private extractCodingTopics(input: string): string[] {
    const topics: string[] = []
    const lowercaseInput = input.toLowerCase()

    // Programming languages
    const languages = ["javascript", "python", "java", "c++", "c#", "go", "rust", "typescript", "php", "ruby"]
    languages.forEach((lang) => {
      if (lowercaseInput.includes(lang)) {
        topics.push(lang)
      }
    })

    // Programming concepts
    const concepts = ["function", "variable", "loop", "array", "object", "class", "method", "algorithm", "recursion"]
    concepts.forEach((concept) => {
      if (lowercaseInput.includes(concept)) {
        topics.push(concept)
      }
    })

    // Code-related keywords
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program") || lowercaseInput.includes("develop")) {
      topics.push("programming")
    }

    return [...new Set(topics)]
  }

  private async getCodingConcept(topic: string): Promise<CodingConcept | null> {
    // Check learnt data first
    const learntConcept = this.searchLearntData(topic)
    if (learntConcept) {
      return learntConcept
    }

    // Check seed data
    const seedConcept = this.searchSeedData(topic)
    if (seedConcept) {
      return seedConcept
    }

    // Generate basic concept if not found
    return this.generateBasicConcept(topic)
  }

  private searchLearntData(topic: string): CodingConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.concept.toLowerCase().includes(topic.toLowerCase())) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(topic: string): CodingConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    for (const concept of this.seedData.concepts) {
      if (
        concept.concept.toLowerCase().includes(topic.toLowerCase()) ||
        concept.language.toLowerCase().includes(topic.toLowerCase())
      ) {
        return concept
      }
    }

    return null
  }

  private generateBasicConcept(topic: string): CodingConcept | null {
    const basicConcepts: { [key: string]: Partial<CodingConcept> } = {
      javascript: {
        language: "JavaScript",
        concept: "JavaScript Programming",
        description: "A versatile programming language used for web development, both frontend and backend.",
        examples: [
          {
            title: "Hello World",
            code: 'console.log("Hello, World!");',
            explanation: 'This prints "Hello, World!" to the console.',
          },
        ],
      },
      python: {
        language: "Python",
        concept: "Python Programming",
        description: "A high-level programming language known for its simplicity and readability.",
        examples: [
          {
            title: "Hello World",
            code: 'print("Hello, World!")',
            explanation: 'This prints "Hello, World!" to the console.',
          },
        ],
      },
      function: {
        language: "General",
        concept: "Functions",
        description: "A reusable block of code that performs a specific task.",
        examples: [
          {
            title: "Basic Function",
            code: 'function greet(name) {\n  return "Hello, " + name;\n}',
            explanation: "This function takes a name parameter and returns a greeting.",
          },
        ],
      },
    }

    const conceptData = basicConcepts[topic.toLowerCase()]
    if (conceptData) {
      return {
        id: generateId(),
        language: conceptData.language || "General",
        concept: conceptData.concept || topic,
        description: conceptData.description || `Information about ${topic}`,
        examples: conceptData.examples || [],
        bestPractices: [],
        commonMistakes: [],
      }
    }

    return null
  }

  private buildCodingResponse(concepts: CodingConcept[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.concept}** (${concept.language})\n\n${concept.description}`

      if (concept.examples && concept.examples.length > 0) {
        response += `\n\n**Example:**\n\`\`\`${concept.language.toLowerCase()}\n${concept.examples[0].code}\n\`\`\``
        response += `\n\n${concept.examples[0].explanation}`
      }

      if (concept.bestPractices && concept.bestPractices.length > 0) {
        response += `\n\n**Best Practices:**\n${concept.bestPractices.map((practice) => `• ${practice}`).join("\n")}`
      }

      return response
    } else {
      let response = "Here are the coding concepts:\n\n"
      concepts.forEach((concept, index) => {
        response += `${index + 1}. **${concept.concept}** (${concept.language}): ${concept.description}\n\n`
      })
      return response
    }
  }

  private calculateCodingConfidence(concepts: CodingConcept[]): number {
    if (concepts.length === 0) return 0

    // Higher confidence for concepts with examples and best practices
    let totalConfidence = 0
    for (const concept of concepts) {
      let confidence = 0.6 // Base confidence

      if (concept.examples && concept.examples.length > 0) confidence += 0.2
      if (concept.bestPractices && concept.bestPractices.length > 0) confidence += 0.1
      if (concept.description && concept.description.length > 50) confidence += 0.1

      totalConfidence += Math.min(1, confidence)
    }

    return totalConfidence / concepts.length
  }

  async learn(data: any): Promise<void> {
    if (data.concepts && data.concepts.length > 0) {
      for (const concept of data.concepts) {
        const learntEntry = {
          id: generateId(),
          content: concept,
          confidence: 0.8,
          source: "coding-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: true,
          tags: [concept.language.toLowerCase(), "coding"],
          relationships: [],
        }

        await storageManager.addLearntEntry("/learnt/coding.json", learntEntry)
        this.stats.learntEntries++
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
}

export const codingModule = new CodingModule()
