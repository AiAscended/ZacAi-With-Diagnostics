export interface LearningEntry {
  id: string
  type: "vocabulary" | "math" | "pattern" | "knowledge"
  content: any
  source: string
  confidence: number
  timestamp: number
  usage_count: number
  last_used: number
}

export class LearningManager {
  private learntData: Map<string, LearningEntry> = new Map()
  private learningQueue: LearningEntry[] = []
  private patterns: Map<string, number> = new Map()

  constructor() {
    console.log("🎓 LearningManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    await this.loadLearntData()
    console.log("✅ LearningManager: Initialized successfully")
  }

  public async learnVocabulary(word: string, definition: any, source: string): Promise<void> {
    const entry: LearningEntry = {
      id: `vocab_${word.toLowerCase()}`,
      type: "vocabulary",
      content: {
        word: word.toLowerCase(),
        definition: definition.definition || "",
        partOfSpeech: definition.partOfSpeech || "",
        examples: definition.examples || [],
        synonyms: definition.synonyms || [],
        antonyms: definition.antonyms || [],
        phonetic: definition.phonetic || "",
      },
      source,
      confidence: 0.8,
      timestamp: Date.now(),
      usage_count: 0,
      last_used: 0,
    }

    this.learntData.set(entry.id, entry)
    this.learningQueue.push(entry)

    console.log(`📚 Learned new word: ${word} from ${source}`)
    await this.saveLearntData()
  }

  public async learnMathConcept(concept: string, explanation: any, source: string): Promise<void> {
    const entry: LearningEntry = {
      id: `math_${concept.toLowerCase().replace(/\s+/g, "_")}`,
      type: "math",
      content: {
        concept,
        explanation,
        examples: explanation.examples || [],
        formula: explanation.formula || "",
        steps: explanation.steps || [],
      },
      source,
      confidence: 0.7,
      timestamp: Date.now(),
      usage_count: 0,
      last_used: 0,
    }

    this.learntData.set(entry.id, entry)
    this.learningQueue.push(entry)

    console.log(`🔢 Learned new math concept: ${concept} from ${source}`)
    await this.saveLearntData()
  }

  public async learnPattern(pattern: string, context: string, frequency: number): Promise<void> {
    const existingCount = this.patterns.get(pattern) || 0
    this.patterns.set(pattern, existingCount + frequency)

    const entry: LearningEntry = {
      id: `pattern_${pattern.toLowerCase().replace(/\s+/g, "_")}`,
      type: "pattern",
      content: {
        pattern,
        context,
        frequency: existingCount + frequency,
        contexts: [context],
      },
      source: "conversation",
      confidence: Math.min(0.9, 0.3 + frequency * 0.1),
      timestamp: Date.now(),
      usage_count: frequency,
      last_used: Date.now(),
    }

    this.learntData.set(entry.id, entry)
    console.log(`🧩 Learned pattern: ${pattern} (frequency: ${existingCount + frequency})`)
  }

  public async learnKnowledge(topic: string, information: any, source: string): Promise<void> {
    const entry: LearningEntry = {
      id: `knowledge_${topic.toLowerCase().replace(/\s+/g, "_")}`,
      type: "knowledge",
      content: {
        topic,
        information,
        summary: information.summary || "",
        details: information.details || {},
        related_topics: information.related || [],
      },
      source,
      confidence: 0.6,
      timestamp: Date.now(),
      usage_count: 0,
      last_used: 0,
    }

    this.learntData.set(entry.id, entry)
    this.learningQueue.push(entry)

    console.log(`🧠 Learned new knowledge: ${topic} from ${source}`)
    await this.saveLearntData()
  }

  public getRelevantLearning(query: string, type?: string): LearningEntry[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const relevant: Array<{ entry: LearningEntry; score: number }> = []

    for (const entry of this.learntData.values()) {
      if (type && entry.type !== type) continue

      let score = 0
      const content = JSON.stringify(entry.content).toLowerCase()

      queryWords.forEach((word) => {
        if (content.includes(word)) {
          score += 1
        }
      })

      // Boost score based on usage and recency
      score += entry.usage_count * 0.1
      score += Math.max(0, 1 - (Date.now() - entry.last_used) / (7 * 24 * 60 * 60 * 1000)) * 0.5

      if (score > 0) {
        relevant.push({ entry, score })
      }
    }

    return relevant
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.entry)
  }

  public markAsUsed(entryId: string): void {
    const entry = this.learntData.get(entryId)
    if (entry) {
      entry.usage_count++
      entry.last_used = Date.now()
      entry.confidence = Math.min(0.95, entry.confidence + 0.05)
    }
  }

  public reinforceLearning(entryId: string, feedback: "positive" | "negative"): void {
    const entry = this.learntData.get(entryId)
    if (!entry) return

    if (feedback === "positive") {
      entry.confidence = Math.min(0.95, entry.confidence + 0.1)
      entry.usage_count++
    } else {
      entry.confidence = Math.max(0.1, entry.confidence - 0.1)
    }

    console.log(`🔄 Reinforced learning for ${entryId}: ${feedback} (confidence: ${entry.confidence})`)
  }

  public consolidateLearning(): void {
    console.log("🧠 Consolidating learning...")

    // Remove low-confidence, unused entries
    const toRemove: string[] = []
    for (const [id, entry] of this.learntData.entries()) {
      if (entry.confidence < 0.2 && entry.usage_count === 0 && Date.now() - entry.timestamp > 7 * 24 * 60 * 60 * 1000) {
        toRemove.push(id)
      }
    }

    toRemove.forEach((id) => {
      this.learntData.delete(id)
      console.log(`🗑️ Removed low-confidence entry: ${id}`)
    })

    // Merge similar entries
    this.mergeSimilarEntries()

    console.log(`✅ Learning consolidated. Removed ${toRemove.length} entries.`)
  }

  private mergeSimilarEntries(): void {
    // This would implement logic to merge similar learning entries
    // For now, we'll just log that it would happen
    console.log("🔄 Merging similar entries...")
  }

  public exportLearning(): any {
    return {
      learntData: Array.from(this.learntData.entries()),
      patterns: Array.from(this.patterns.entries()),
      queue: this.learningQueue,
      stats: this.getStats(),
    }
  }

  public importLearning(data: any): void {
    if (data.learntData) {
      this.learntData = new Map(data.learntData)
    }
    if (data.patterns) {
      this.patterns = new Map(data.patterns)
    }
    if (data.queue) {
      this.learningQueue = data.queue
    }
    console.log("📥 Learning data imported successfully")
  }

  private async loadLearntData(): Promise<void> {
    // In a real implementation, this would load from IndexedDB
    // For now, we start with empty learning data
    console.log("📚 Loading learnt data...")
  }

  private async saveLearntData(): Promise<void> {
    // In a real implementation, this would save to IndexedDB
    // For now, we just log that it would save
    console.log("💾 Saving learnt data...")
  }

  public getStats(): any {
    const typeStats = new Map<string, number>()
    for (const entry of this.learntData.values()) {
      typeStats.set(entry.type, (typeStats.get(entry.type) || 0) + 1)
    }

    return {
      totalEntries: this.learntData.size,
      byType: Object.fromEntries(typeStats),
      queueSize: this.learningQueue.length,
      patterns: this.patterns.size,
      averageConfidence:
        Array.from(this.learntData.values()).reduce((sum, entry) => sum + entry.confidence, 0) / this.learntData.size ||
        0,
    }
  }
}
