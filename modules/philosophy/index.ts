import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { PhilosophicalConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
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
      this.seedData = await storageManager.loadSeedData("/seed/philosophy.json")
      this.learntData = await storageManager.loadLearntData("/learnt/philosophy.json")

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
      const philosophicalTopics = this.extractPhilosophicalTopics(input)

      if (philosophicalTopics.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const concepts: PhilosophicalConcept[] = []

      for (const topic of philosophicalTopics) {
        const concept = await this.getPhilosophicalConcept(topic)
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
          topicsProcessed: philosophicalTopics.length,
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

  private extractPhilosophicalTopics(input: string): string[] {
    const topics: string[] = []
    const lowercaseInput = input.toLowerCase()

    // Philosophical concepts
    const concepts = [
      "ethics",
      "morality",
      "consciousness",
      "free will",
      "determinism",
      "existentialism",
      "nihilism",
      "stoicism",
      "utilitarianism",
      "virtue ethics",
      "metaphysics",
      "epistemology",
      "ontology",
      "phenomenology",
      "logic",
      "truth",
      "reality",
      "knowledge",
      "belief",
      "justice",
      "beauty",
      "good",
      "evil",
    ]

    concepts.forEach((concept) => {
      if (lowercaseInput.includes(concept)) {
        topics.push(concept)
      }
    })

    // Philosophers
    const philosophers = [
      "socrates",
      "plato",
      "aristotle",
      "kant",
      "nietzsche",
      "descartes",
      "hume",
      "locke",
      "mill",
      "bentham",
      "rawls",
      "sartre",
      "camus",
    ]

    philosophers.forEach((philosopher) => {
      if (lowercaseInput.includes(philosopher)) {
        topics.push(philosopher)
      }
    })

    // Philosophical questions
    if (lowercaseInput.includes("meaning of life") || lowercaseInput.includes("purpose")) {
      topics.push("meaning of life")
    }

    return [...new Set(topics)]
  }

  private async getPhilosophicalConcept(topic: string): Promise<PhilosophicalConcept | null> {
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

    // Generate basic concept
    return this.generateBasicConcept(topic)
  }

  private searchLearntData(topic: string): PhilosophicalConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.name.toLowerCase().includes(topic.toLowerCase())) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(topic: string): PhilosophicalConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    for (const concept of this.seedData.concepts) {
      if (
        concept.name.toLowerCase().includes(topic.toLowerCase()) ||
        concept.philosopher.toLowerCase().includes(topic.toLowerCase())
      ) {
        return concept
      }
    }

    return null
  }

  private generateBasicConcept(topic: string): PhilosophicalConcept | null {
    const basicConcepts: { [key: string]: Partial<PhilosophicalConcept> } = {
      ethics: {
        name: "Ethics",
        description: "The branch of philosophy that deals with moral principles and values.",
        philosopher: "Various",
        school: "Moral Philosophy",
        arguments: ["Actions should be judged by their consequences", "Moral duties are universal"],
        counterArguments: [
          "Cultural relativism challenges universal ethics",
          "Emotions play a role in moral decisions",
        ],
      },
      "free will": {
        name: "Free Will",
        description: "The ability to make choices that are genuinely one's own, not determined by prior causes.",
        philosopher: "Various",
        school: "Metaphysics",
        arguments: ["We experience making choices", "Moral responsibility requires free will"],
        counterArguments: [
          "Determinism suggests all events are caused",
          "Neuroscience shows decisions occur before awareness",
        ],
      },
      consciousness: {
        name: "Consciousness",
        description: "The state of being aware of and able to think about one's existence, sensations, and thoughts.",
        philosopher: "Various",
        school: "Philosophy of Mind",
        arguments: ["Consciousness is fundamental to experience", "It cannot be reduced to physical processes"],
        counterArguments: ["Consciousness emerges from brain activity", "It can be explained by neural processes"],
      },
    }

    const conceptData = basicConcepts[topic.toLowerCase()]
    if (conceptData) {
      return {
        id: generateId(),
        name: conceptData.name || topic,
        description: conceptData.description || `A philosophical concept related to ${topic}`,
        philosopher: conceptData.philosopher || "Various",
        school: conceptData.school || "General Philosophy",
        relatedConcepts: [],
        arguments: conceptData.arguments || [],
        counterArguments: conceptData.counterArguments || [],
      }
    }

    return null
  }

  private buildPhilosophyResponse(concepts: PhilosophicalConcept[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.name}**\n\n${concept.description}`

      if (concept.philosopher !== "Various") {
        response += `\n\n*Associated with: ${concept.philosopher} (${concept.school})*`
      }

      if (concept.arguments && concept.arguments.length > 0) {
        response += `\n\n**Key Arguments:**\n${concept.arguments.map((arg) => `• ${arg}`).join("\n")}`
      }

      if (concept.counterArguments && concept.counterArguments.length > 0) {
        response += `\n\n**Counter-Arguments:**\n${concept.counterArguments.map((arg) => `• ${arg}`).join("\n")}`
      }

      return response
    } else {
      let response = "Here are the philosophical concepts:\n\n"
      concepts.forEach((concept, index) => {
        response += `${index + 1}. **${concept.name}**: ${concept.description}\n\n`
      })
      return response
    }
  }

  private calculatePhilosophyConfidence(concepts: PhilosophicalConcept[]): number {
    if (concepts.length === 0) return 0

    // Philosophy is inherently subjective, so confidence is moderate
    let totalConfidence = 0
    for (const concept of concepts) {
      let confidence = 0.6 // Base confidence for philosophical concepts

      if (concept.arguments && concept.arguments.length > 0) confidence += 0.1
      if (concept.counterArguments && concept.counterArguments.length > 0) confidence += 0.1
      if (concept.philosopher !== "Various") confidence += 0.1

      totalConfidence += Math.min(0.8, confidence) // Cap at 0.8 for philosophy
    }

    return totalConfidence / concepts.length
  }

  async learn(data: any): Promise<void> {
    if (data.concepts && data.concepts.length > 0) {
      for (const concept of data.concepts) {
        const learntEntry = {
          id: generateId(),
          content: concept,
          confidence: 0.7,
          source: "philosophy-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: false, // Philosophy is subjective
          tags: ["philosophy", concept.school.toLowerCase()],
          relationships: [],
        }

        await storageManager.addLearntEntry("/learnt/philosophy.json", learntEntry)
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
