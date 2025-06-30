import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { CodingConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
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
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.coding.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.coding.learntFile)

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

      const concepts: CodingConcept[] = []

      for (const query of codingQueries) {
        const concept = await this.getCodingConcept(query)
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
          queriesProcessed: codingQueries.length,
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

  private extractCodingQueries(input: string): string[] {
    const queries: string[] = []

    // Look for programming language mentions
    const languages = ["javascript", "python", "java", "c++", "html", "css", "react", "node"]
    for (const lang of languages) {
      if (input.toLowerCase().includes(lang)) {
        queries.push(lang)
      }
    }

    // Look for coding concepts
    const concepts = ["function", "variable", "loop", "array", "object", "class", "method", "algorithm"]
    for (const concept of concepts) {
      if (input.toLowerCase().includes(concept)) {
        queries.push(concept)
      }
    }

    // Look for "how to code" patterns
    const howToMatch = input.match(/how to (?:code|program|write) (.+?)(?:\?|$)/i)
    if (howToMatch) {
      queries.push(howToMatch[1].trim())
    }

    return [...new Set(queries)] // Remove duplicates
  }

  private async getCodingConcept(query: string): Promise<CodingConcept | null> {
    // Check learnt data first
    const learntConcept = this.searchLearntData(query)
    if (learntConcept) {
      return learntConcept
    }

    // Check seed data
    const seedConcept = this.searchSeedData(query)
    if (seedConcept) {
      return seedConcept
    }

    // Generate basic concept if it's a common programming term
    const generatedConcept = this.generateBasicConcept(query)
    if (generatedConcept) {
      await this.saveToLearntData(query, generatedConcept)
      return generatedConcept
    }

    return null
  }

  private searchLearntData(query: string): CodingConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.name === query) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(query: string): CodingConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    const conceptData = this.seedData.concepts[query.toLowerCase()]
    if (conceptData) {
      return {
        name: query,
        language: conceptData.language || "general",
        description: conceptData.description,
        syntax: conceptData.syntax || "",
        examples: conceptData.examples || [],
        difficulty: conceptData.difficulty || 1,
        category: conceptData.category || "general",
      }
    }

    return null
  }

  private generateBasicConcept(query: string): CodingConcept | null {
    const basicConcepts: { [key: string]: Partial<CodingConcept> } = {
      function: {
        description: "A reusable block of code that performs a specific task",
        syntax: "function functionName() { /* code */ }",
        examples: [
          {
            title: "Basic Function",
            code: "function greet(name) {\n  return 'Hello, ' + name + '!';\n}",
            explanation: "A simple function that takes a name parameter and returns a greeting",
          },
        ],
        difficulty: 2,
        category: "fundamentals",
      },
      variable: {
        description: "A container that stores data values",
        syntax: "let variableName = value;",
        examples: [
          {
            title: "Variable Declaration",
            code: "let message = 'Hello World';\nconst pi = 3.14159;",
            explanation: "Examples of declaring variables with let and const",
          },
        ],
        difficulty: 1,
        category: "fundamentals",
      },
      loop: {
        description: "A programming construct that repeats a block of code",
        syntax: "for (let i = 0; i < length; i++) { /* code */ }",
        examples: [
          {
            title: "For Loop",
            code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}",
            explanation: "A for loop that prints numbers 0 through 4",
          },
        ],
        difficulty: 2,
        category: "control-flow",
      },
    }

    const concept = basicConcepts[query.toLowerCase()]
    if (concept) {
      return {
        name: query,
        language: "javascript",
        description: concept.description!,
        syntax: concept.syntax!,
        examples: concept.examples!,
        difficulty: concept.difficulty!,
        category: concept.category!,
      }
    }

    return null
  }

  private async saveToLearntData(query: string, concept: CodingConcept): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: concept,
      confidence: 0.7,
      source: "coding-module",
      context: `Generated concept for "${query}"`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: false,
      tags: ["generated", concept.category],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.coding.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  private buildCodingResponse(concepts: CodingConcept[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.name}** (${concept.language})\n\n${concept.description}`

      if (concept.syntax) {
        response += `\n\n**Syntax:**\n\`\`\`${concept.language}\n${concept.syntax}\n\`\`\``
      }

      if (concept.examples && concept.examples.length > 0) {
        const example = concept.examples[0]
        response += `\n\n**Example:**\n\`\`\`${concept.language}\n${example.code}\n\`\`\``
        response += `\n\n${example.explanation}`
      }

      return response
    } else {
      let response = "Here are the coding concepts:\n\n"
      concepts.forEach((concept, index) => {
        response += `**${index + 1}. ${concept.name}** (${concept.language})\n${concept.description}\n\n`
      })
      return response
    }
  }

  private calculateCodingConfidence(concepts: CodingConcept[]): number {
    if (concepts.length === 0) return 0

    let totalConfidence = 0
    for (const concept of concepts) {
      if (concept.examples && concept.examples.length > 0) totalConfidence += 0.9
      else totalConfidence += 0.6
    }

    return Math.min(1, totalConfidence / concepts.length)
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
