import { EnhancedAPIManager } from "../enhanced-api-manager"

export class VocabularyModule {
  private vocabulary: Map<string, any> = new Map()
  private apiManager: EnhancedAPIManager
  public isInitialized = false

  constructor() {
    this.apiManager = new EnhancedAPIManager()
    console.log("📚 Vocabulary Module initialized.")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    await this.loadSeedVocabulary()
    await this.loadLearnedVocabulary()
    this.isInitialized = true
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (!response.ok) throw new Error(`Failed to fetch seed_vocab.json: ${response.statusText}`)
      const data = await response.json()
      Object.entries(data).forEach(([word, entry]: [string, any]) => {
        this.vocabulary.set(word.toLowerCase(), { ...entry, source: "seed" })
      })
      console.log(`✅ [Vocab] Loaded ${Object.keys(data).length} seed words.`)
    } catch (error) {
      console.warn("[Vocab] Failed to load seed vocabulary:", error)
    }
  }

  private async loadLearnedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/learnt_vocab.json")
      if (!response.ok) return // It's okay if this file doesn't exist yet
      const data = await response.json()
      if (data.vocabulary) {
        Object.entries(data.vocabulary).forEach(([word, entry]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), { ...entry, source: "learned" })
        })
        console.log(`✅ [Vocab] Loaded ${Object.keys(data.vocabulary).length} learned words.`)
      }
    } catch (error) {
      console.warn("[Vocab] Failed to load learned vocabulary:", error)
    }
  }

  public async handleLookup(
    word: string,
    thinkingSteps: string[],
  ): Promise<{ responseText: string; knowledge: string[]; confidence: number }> {
    thinkingSteps.push(`📚 Entering Vocabulary Processor for word: "${word}".`)
    const lowerCaseWord = word.toLowerCase()

    // 1. Check combined memory (seed + learned)
    thinkingSteps.push("📖 Checking internal knowledge base...")
    if (this.vocabulary.has(lowerCaseWord)) {
      const entry = this.vocabulary.get(lowerCaseWord)
      const sourceText = entry.source === "seed" ? "initial knowledge" : "memory"
      const responseText = `From my ${sourceText}, "${word}" means: ${entry.definition || entry.meanings?.[0]?.definitions?.[0]?.definition}`
      thinkingSteps.push(`✅ Found in ${entry.source} data.`)
      return { responseText, knowledge: [`Vocabulary (${entry.source})`], confidence: 1.0 }
    }
    thinkingSteps.push("❌ Not found in internal knowledge.")

    // 2. Use API to look up the new word
    thinkingSteps.push("🤔 Self-prompt: How can I find the definition for a new word? -> Decision: Use external API.")
    thinkingSteps.push(`🌐 Querying external dictionary API for "${word}"...`)
    try {
      const apiData = await this.apiManager.lookupWord(word)
      if (apiData && apiData.meanings && apiData.meanings.length > 0) {
        const definition = apiData.meanings[0].definitions[0].definition
        const responseText = `According to my sources, "${word}" means: ${definition}`
        thinkingSteps.push(`✅ API lookup successful.`)

        // 3. Learn the new word
        thinkingSteps.push(`✍️ Learning new word and saving to memory...`)
        const newEntry = {
          ...apiData,
          source: "learned",
          timestamp: Date.now(),
        }
        this.vocabulary.set(lowerCaseWord, newEntry)
        await this.saveLearnedVocabulary() // This is a mock save for now
        thinkingSteps.push(`💾 Save successful.`)

        return { responseText, knowledge: ["Dictionary API"], confidence: 0.95 }
      } else {
        thinkingSteps.push(`❌ API did not return a valid definition for "${word}".`)
        return { responseText: `Sorry, I couldn't find a definition for "${word}".`, knowledge: [], confidence: 0.3 }
      }
    } catch (error) {
      console.error("[Vocab] API Error in handleLookup:", error)
      thinkingSteps.push(`🔥 API call failed.`)
      return { responseText: "I had trouble reaching my dictionary service.", knowledge: [], confidence: 0.2 }
    }
  }

  private async saveLearnedVocabulary(): Promise<void> {
    const learnedWords: { [key: string]: any } = {}
    this.vocabulary.forEach((entry, word) => {
      if (entry.source === "learned") {
        learnedWords[word] = entry
      }
    })
    console.log("📝 Simulating save of learned vocabulary:", Object.keys(learnedWords).length, "words")
    // In a real application, this would be a POST request to a server endpoint
    // e.g., await fetch('/api/vocabulary', { method: 'POST', body: JSON.stringify({ vocabulary: learnedWords }) })
  }

  public getVocabularyData(): Map<string, any> {
    return this.vocabulary
  }
}
