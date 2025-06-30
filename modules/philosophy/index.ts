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

      const results: any[] = []

      for (const query of philosophicalQueries) {
        const result = await this.processPhilosophicalQuery(query)
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

      const response = this.buildPhilosophicalResponse(results)
      const confidence = this.calculatePhilosophicalConfidence(results)

      await this.learn({
        input,
        results,
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
          resultsFound: results.length,
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

    // Philosophical question patterns
    const patterns = [
      /what\s+is\s+the\s+meaning\s+of\s+(.+?)(?:\?|$)/i,
      /why\s+do\s+we\s+(.+?)(?:\?|$)/i,
      /what\s+is\s+(.+?)\s+philosophy(?:\?|$)/i,
      /ethics?\s+of\s+(.+?)(?:\?|$)/i,
      /moral\s+(.+?)(?:\?|$)/i,
      /philosophy\s+of\s+(.+?)(?:\?|$)/i,
      /existential\s+(.+?)(?:\?|$)/i,
      /consciousness\s+(.+?)(?:\?|$)/i,
      /free\s+will\s+(.+?)(?:\?|$)/i,
      /determinism\s+(.+?)(?:\?|$)/i,
    ]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        queries.push(match[1].trim())
      }
    }

    // Check for philosophical keywords
    const philosophicalKeywords = [
      "ethics",
      "morality",
      "consciousness",
      "existence",
      "reality",
      "truth",
      "knowledge",
      "wisdom",
      "justice",
      "freedom",
      "determinism",
      "nihilism",
      "existentialism",
      "stoicism",
      "utilitarianism",
      "deontology",
      "virtue",
    ]

    for (const keyword of philosophicalKeywords) {
      if (input.toLowerCase().includes(keyword)) {
        queries.push(keyword)
      }
    }

    return queries.length > 0 ? queries : [input]
  }

  private async processPhilosophicalQuery(query: string): Promise<any> {
    // Check learnt data first
    const learntConcept = this.searchLearntConcepts(query)
    if (learntConcept) {
      return learntConcept
    }

    // Check seed data
    const seedConcept = this.searchSeedConcepts(query)
    if (seedConcept) {
      return seedConcept
    }

    // Generate philosophical response
    return this.generatePhilosophicalResponse(query)
  }

  private searchLearntConcepts(query: string): PhilosophicalConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (
        entryData.content &&
        (entryData.content.name?.toLowerCase().includes(query.toLowerCase()) ||
          entryData.content.description?.toLowerCase().includes(query.toLowerCase()))
      ) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedConcepts(query: string): PhilosophicalConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    for (const concept of this.seedData.concepts) {
      if (
        concept.name.toLowerCase().includes(query.toLowerCase()) ||
        concept.description.toLowerCase().includes(query.toLowerCase()) ||
        concept.school.toLowerCase().includes(query.toLowerCase())
      ) {
        return concept
      }
    }

    return null
  }

  private generatePhilosophicalResponse(query: string): any {
    const commonConcepts = {
      ethics: {
        name: "Ethics",
        description:
          "The branch of philosophy that deals with moral principles and values, examining what is right and wrong, good and bad.",
        school: "Various",
        arguments: [
          "Moral actions should maximize happiness (Utilitarianism)",
          "Actions are right if they follow moral duties (Deontology)",
          "Virtue and character are central to moral behavior (Virtue Ethics)",
        ],
        counterArguments: [
          "Moral relativism suggests ethics vary by culture",
          "Moral nihilism questions the existence of objective moral truths",
          "Evolutionary ethics argues morality is just survival instinct",
        ],
        relatedConcepts: ["morality", "justice", "virtue", "duty"],
        modernRelevance:
          "Essential for addressing contemporary issues like AI ethics, bioethics, and environmental responsibility",
      },
      consciousness: {
        name: "Consciousness",
        description:
          "The state of being aware of and able to think about one's existence, sensations, thoughts, and surroundings.",
        school: "Philosophy of Mind",
        arguments: [
          "Consciousness is fundamental to reality (Panpsychism)",
          "Consciousness emerges from complex brain activity (Emergentism)",
          "Consciousness is an illusion created by information processing (Illusionism)",
        ],
        counterArguments: [
          "The hard problem of consciousness remains unsolved",
          "Qualia cannot be reduced to physical processes",
          "Zombie argument suggests consciousness is non-physical",
        ],
        relatedConcepts: ["mind", "qualia", "awareness", "perception"],
        modernRelevance: "Critical for understanding AI consciousness and machine sentience",
      },
      "free will": {
        name: "Free Will",
        description:
          "The ability to make choices that are genuinely one's own, not determined by prior causes or divine decree.",
        school: "Metaphysics",
        arguments: [
          "Libertarian free will exists despite determinism",
          "Compatibilist free will is consistent with determinism",
          "We experience making free choices in daily life",
        ],
        counterArguments: [
          "Hard determinism denies the existence of free will",
          "Neuroscience shows decisions are made before conscious awareness",
          "Quantum indeterminacy doesn't create meaningful freedom",
        ],
        relatedConcepts: ["determinism", "responsibility", "choice", "causation"],
        modernRelevance: "Impacts legal responsibility, moral accountability, and AI decision-making",
      },
      existence: {
        name: "Existence",
        description:
          "The state or fact of being; the fundamental question of why there is something rather than nothing.",
        school: "Existentialism/Metaphysics",
        arguments: [
          "Existence precedes essence (Sartre)",
          "Being-in-the-world defines human existence (Heidegger)",
          "Existence is absurd but must be embraced (Camus)",
        ],
        counterArguments: [
          "Essence precedes existence in traditional metaphysics",
          "Existence may be illusory (Eastern philosophy)",
          "The question of existence may be meaningless",
        ],
        relatedConcepts: ["being", "nothingness", "essence", "reality"],
        modernRelevance: "Relevant to questions of meaning, purpose, and authenticity in modern life",
      },
    }

    const concept = commonConcepts[query.toLowerCase()]
    if (concept) {
      return {
        id: generateId(),
        type: "philosophical_concept",
        ...concept,
      }
    }

    // Generate a general philosophical reflection
    return {
      id: generateId(),
      type: "philosophical_reflection",
      name: `Philosophical Inquiry: ${query}`,
      description: `This question touches on fundamental philosophical concerns about ${query}. Philosophy approaches such questions through rigorous analysis, logical reasoning, and consideration of multiple perspectives.`,
      school: "General Philosophy",
      arguments: [
        "Multiple philosophical traditions offer different perspectives on this question",
        "Critical thinking and logical analysis can illuminate various aspects",
        "Historical philosophical thought provides valuable insights",
      ],
      counterArguments: [
        "Some questions may be beyond human comprehension",
        "Cultural and historical context influences philosophical perspectives",
        "Empirical evidence may be limited for purely philosophical questions",
      ],
      relatedConcepts: [query],
      modernRelevance: "Philosophical inquiry remains relevant for understanding complex modern issues",
    }
  }

  private buildPhilosophicalResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]
      let response = `**${result.name}**\n\n${result.description}\n\n`

      if (result.philosopher) {
        response += `**Key Philosopher:** ${result.philosopher}\n\n`
      }

      if (result.school) {
        response += `**Philosophical School:** ${result.school}\n\n`
      }

      if (result.arguments && result.arguments.length > 0) {
        response += `**Key Arguments:**\n${result.arguments.map((arg) => `• ${arg}`).join("\n")}\n\n`
      }

      if (result.counterArguments && result.counterArguments.length > 0) {
        response += `**Counter-Arguments:**\n${result.counterArguments.map((arg) => `• ${arg}`).join("\n")}\n\n`
      }

      if (result.modernRelevance) {
        response += `**Modern Relevance:** ${result.modernRelevance}`
      }

      return response
    } else {
      let response = "Here are the philosophical insights:\n\n"
      results.forEach((result, index) => {
        response += `${index + 1}. **${result.name}**: ${result.description.substring(0, 150)}${result.description.length > 150 ? "..." : ""}\n\n`
      })
      return response
    }
  }

  private calculatePhilosophicalConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      if (result.type === "philosophical_concept") {
        totalConfidence += 0.85 // High confidence for established concepts
      } else if (result.type === "philosophical_reflection") {
        totalConfidence += 0.7 // Good confidence for general reflections
      } else {
        totalConfidence += 0.6 // Medium confidence for other results
      }
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        const learntEntry = {
          id: generateId(),
          content: result,
          confidence: 0.8,
          source: "philosophy-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: true,
          tags: ["philosophy", result.school?.toLowerCase() || "general"],
          relationships: result.relatedConcepts || [],
        }

        await storageManager.addLearntEntry(MODULE_CONFIG.philosophy.learntFile, learntEntry)
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

export const philosophyModule = new PhilosophyModule()
