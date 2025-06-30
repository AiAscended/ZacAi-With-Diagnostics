import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { PhilosophicalConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

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

    console.log("Initializing Philosophy Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.philosophy.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.philosophy.learntFile)

      this.initialized = true
      console.log("Philosophy Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Philosophy Module:", error)
      throw error
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

      const concepts: PhilosophicalConcept[] = []

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
          queriesProcessed: philosophicalQueries.length,
          conceptsFound: concepts.length,
        },
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
    const concepts = [
      "consciousness",
      "ethics",
      "morality",
      "existence",
      "reality",
      "truth",
      "knowledge",
      "meaning",
      "free will",
      "determinism",
    ]
    for (const concept of concepts) {
      if (input.toLowerCase().includes(concept)) {
        queries.push(concept)
      }
    }

    // Look for philosophical questions
    const philosophicalPatterns = [
      /what is the meaning of (.+?)(?:\?|$)/i,
      /what does it mean to (.+?)(?:\?|$)/i,
      /is (.+?) moral(?:\?|$)/i,
      /what is (.+?) philosophy(?:\?|$)/i,
    ]

    for (const pattern of philosophicalPatterns) {
      const match = input.match(pattern)
      if (match) {
        queries.push(match[1].trim())
      }
    }

    return [...new Set(queries)] // Remove duplicates
  }

  private async getPhilosophicalConcept(query: string): Promise<PhilosophicalConcept | null> {
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

    // Generate basic concept if it's a common philosophical term
    const generatedConcept = this.generateBasicConcept(query)
    if (generatedConcept) {
      await this.saveToLearntData(query, generatedConcept)
      return generatedConcept
    }

    return null
  }

  private searchLearntData(query: string): PhilosophicalConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.name === query) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(query: string): PhilosophicalConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    const conceptData = this.seedData.concepts[query.toLowerCase()]
    if (conceptData) {
      return {
        name: query,
        description: conceptData.description,
        philosopher: conceptData.philosopher,
        school: conceptData.school || "general",
        relatedConcepts: conceptData.relatedConcepts || [],
        arguments: conceptData.arguments || [],
        counterArguments: conceptData.counterArguments || [],
      }
    }

    return null
  }

  private generateBasicConcept(query: string): PhilosophicalConcept | null {
    const basicConcepts: { [key: string]: Partial<PhilosophicalConcept> } = {
      consciousness: {
        description:
          "The state of being aware of and able to think about one's existence, sensations, thoughts, and surroundings",
        school: "philosophy of mind",
        relatedConcepts: ["awareness", "self-awareness", "qualia"],
        arguments: ["Consciousness is fundamental to experience", "It cannot be reduced to physical processes"],
        counterArguments: [
          "Consciousness emerges from complex neural activity",
          "It can be explained through materialism",
        ],
      },
      ethics: {
        description: "The branch of philosophy that deals with moral principles and values",
        school: "moral philosophy",
        relatedConcepts: ["morality", "virtue", "duty", "consequences"],
        arguments: ["Moral principles are universal", "Ethics guide human behavior"],
        counterArguments: ["Morality is relative to culture", "Ethical systems can conflict"],
      },
      existence: {
        description: "The fact or state of being; the nature of what it means to exist",
        school: "metaphysics",
        relatedConcepts: ["being", "reality", "essence", "ontology"],
        arguments: ["Existence precedes essence", "Being is the fundamental question"],
        counterArguments: ["Essence defines existence", "Existence is an illusion"],
      },
      "free will": {
        description: "The ability to make choices that are genuinely one's own and not determined by prior causes",
        school: "philosophy of action",
        relatedConcepts: ["determinism", "choice", "responsibility", "agency"],
        arguments: ["We experience making free choices", "Moral responsibility requires free will"],
        counterArguments: ["All events are causally determined", "Free will is incompatible with physics"],
      },
    }

    const concept = basicConcepts[query.toLowerCase()]
    if (concept) {
      return {
        name: query,
        description: concept.description!,
        philosopher: concept.philosopher,
        school: concept.school!,
        relatedConcepts: concept.relatedConcepts!,
        arguments: concept.arguments!,
        counterArguments: concept.counterArguments!,
      }
    }

    return null
  }

  private async saveToLearntData(query: string, concept: PhilosophicalConcept): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: concept,
      confidence: 0.7,
      source: "philosophy-module",
      context: `Generated concept for "${query}"`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: false,
      tags: ["generated", concept.school],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.philosophy.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  private buildPhilosophyResponse(concepts: PhilosophicalConcept[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.name}**\n\n${concept.description}`

      if (concept.philosopher) {
        response += `\n\n**Key Philosopher:** ${concept.philosopher}`
      }

      if (concept.school) {
        response += `\n\n**Philosophical School:** ${concept.school}`
      }

      if (concept.arguments && concept.arguments.length > 0) {
        response += `\n\n**Arguments:**\n${concept.arguments.map((arg) => `• ${arg}`).join("\n")}`
      }

      if (concept.counterArguments && concept.counterArguments.length > 0) {
        response += `\n\n**Counter-arguments:**\n${concept.counterArguments.map((arg) => `• ${arg}`).join("\n")}`
      }

      if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
        response += `\n\n**Related concepts:** ${concept.relatedConcepts.join(", ")}`
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

  private calculatePhilosophyConfidence(concepts: PhilosophicalConcept[]): number {
    if (concepts.length === 0) return 0

    let totalConfidence = 0
    for (const concept of concepts) {
      if (concept.arguments && concept.arguments.length > 0) totalConfidence += 0.8
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

export const philosophyModule = new PhilosophyModule()
