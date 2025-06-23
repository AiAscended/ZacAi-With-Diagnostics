export class ProgressiveLoader {
  private static instance: ProgressiveLoader
  private loadingQueue: string[] = []
  private isLoading = false
  private loadedChunks = new Set<string>()

  static getInstance(): ProgressiveLoader {
    if (!ProgressiveLoader.instance) {
      ProgressiveLoader.instance = new ProgressiveLoader()
    }
    return ProgressiveLoader.instance
  }

  async initializeCore(): Promise<void> {
    console.log("🚀 Initializing core AI systems...")

    // Load essential systems first
    await this.loadSystemData()
    await this.loadLearningInstructions()

    // Load first vocabulary chunk (most common words)
    await this.loadVocabularyChunk(1)

    // Load essential math data
    await this.loadCoreMathData()

    console.log("✅ Core systems initialized")
  }

  async loadOnDemand(category: string, priority = 1): Promise<void> {
    const loadKey = `${category}_${priority}`

    if (this.loadedChunks.has(loadKey) || this.loadingQueue.includes(loadKey)) {
      return
    }

    this.loadingQueue.push(loadKey)

    if (!this.isLoading) {
      this.processLoadingQueue()
    }
  }

  private async processLoadingQueue(): Promise<void> {
    this.isLoading = true

    while (this.loadingQueue.length > 0) {
      const loadKey = this.loadingQueue.shift()!
      const [category, priority] = loadKey.split("_")

      try {
        switch (category) {
          case "vocabulary":
            await this.loadVocabularyChunk(Number.parseInt(priority))
            break
          case "math":
            await this.loadMathChunk(Number.parseInt(priority))
            break
          case "knowledge":
            await this.loadKnowledgeChunk(Number.parseInt(priority))
            break
        }

        this.loadedChunks.add(loadKey)
        console.log(`📦 Loaded ${loadKey}`)
      } catch (error) {
        console.warn(`Failed to load ${loadKey}:`, error)
      }

      // Small delay to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    this.isLoading = false
  }

  private async loadSystemData(): Promise<void> {
    // System data is critical, load synchronously
    const response = await fetch("/seed_system_enhanced.json")
    if (response.ok) {
      const systemData = await response.json()
      localStorage.setItem("ai_system_data", JSON.stringify(systemData))
    }
  }

  private async loadLearningInstructions(): Promise<void> {
    const response = await fetch("/seed_learning_enhanced.json")
    if (response.ok) {
      const learningData = await response.json()
      localStorage.setItem("ai_learning_data", JSON.stringify(learningData))
    }
  }

  private async loadVocabularyChunk(chunkNumber: number): Promise<void> {
    const response = await fetch(`/seed_vocab_chunk_${chunkNumber}.json`)
    if (response.ok) {
      const vocabData = await response.json()
      const existing = JSON.parse(localStorage.getItem("ai_vocab_chunks") || "{}")
      existing[`chunk_${chunkNumber}`] = vocabData
      localStorage.setItem("ai_vocab_chunks", JSON.stringify(existing))
    }
  }

  private async loadCoreMathData(): Promise<void> {
    const response = await fetch("/seed_maths_enhanced.json")
    if (response.ok) {
      const mathData = await response.json()
      localStorage.setItem("ai_math_data", JSON.stringify(mathData))
    }
  }

  private async loadMathChunk(priority: number): Promise<void> {
    // For future expansion of math data into chunks
    console.log(`Loading math chunk ${priority}`)
  }

  private async loadKnowledgeChunk(priority: number): Promise<void> {
    // For future expansion of general knowledge
    console.log(`Loading knowledge chunk ${priority}`)
  }

  getLoadingStatus(): { loaded: string[]; queued: string[]; isLoading: boolean } {
    return {
      loaded: Array.from(this.loadedChunks),
      queued: [...this.loadingQueue],
      isLoading: this.isLoading,
    }
  }
}
