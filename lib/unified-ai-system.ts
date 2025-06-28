"use client"

export class UnifiedAISystem {
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private facts: Map<string, any> = new Map()
  private coding: Map<string, any> = new Map()
  private conversationHistory: any[] = []

  private isInitialized = false
  private systemIdentity = { name: "ZacAI", version: "2.0.0" }

  constructor() {
    console.log("🧠 ZacAI System starting...")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 Initializing ZacAI System...")

    try {
      // Load seed data FIRST
      await this.loadSeedVocabulary()
      await this.loadSeedMathematics()
      await this.loadSeedFacts()
      await this.loadSeedCoding()

      // Load learned data (should be empty on fresh install)
      await this.loadLearnedData()

      this.isInitialized = true
      console.log("✅ ZacAI System initialized successfully")
      console.log(`📚 Total Vocabulary: ${this.vocabulary.size} words`)
      console.log(`🧮 Mathematics: ${this.mathematics.size} concepts`)
      console.log(`🧠 Facts: ${this.facts.size} facts`)
      console.log(`💻 Coding: ${this.coding.size} concepts`)

      // Log breakdown
      const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
      const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length
      console.log(`📊 Seed vocabulary: ${seedVocab} words`)
      console.log(`📊 Learned vocabulary: ${learnedVocab} words`)
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      this.isInitialized = false
    }
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: entry.definition,
            partOfSpeech: entry.part_of_speech || entry.partOfSpeech || "unknown",
            examples: entry.examples || [],
            source: "seed",
            confidence: 0.9,
            phonetic: entry.phonetic || "",
            synonyms: entry.synonyms || [],
            antonyms: entry.antonyms || [],
            frequency: entry.frequency || 1,
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} seed vocabulary words`)
      }
    } catch (error) {
      console.warn("Failed to load seed vocabulary:", error)
    }
  }

  private async loadSeedMathematics(): Promise<void> {
    try {
      const response = await fetch("/seed_maths.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([concept, entry]: [string, any]) => {
          this.mathematics.set(concept, {
            concept,
            data: entry,
            source: "seed",
            confidence: 0.95,
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} seed math concepts`)
      }
    } catch (error) {
      console.warn("Failed to load seed mathematics:", error)
    }
  }

  private async loadSeedFacts(): Promise<void> {
    try {
      const response = await fetch("/seed_knowledge.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([domain, domainData]: [string, any]) => {
          if (typeof domainData === "object") {
            Object.entries(domainData).forEach(([topic, info]: [string, any]) => {
              this.facts.set(`${domain}_${topic}`, {
                topic: `${domain}_${topic}`,
                content: typeof info === "string" ? info : JSON.stringify(info),
                category: domain,
                source: "seed",
                confidence: 0.9,
              })
            })
          }
        })
        console.log(`✅ Loaded seed knowledge facts`)
      }
    } catch (error) {
      console.warn("Failed to load seed facts:", error)
    }
  }

  private async loadSeedCoding(): Promise<void> {
    try {
      const response = await fetch("/seed_coding.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([concept, entry]: [string, any]) => {
          this.coding.set(concept, {
            concept,
            data: entry,
            source: "seed",
            confidence: 0.9,
          })
        })
        console.log(`✅ Loaded seed coding concepts`)
      }
    } catch (error) {
      console.warn("Failed to load seed coding:", error)
    }
  }

  private async loadLearnedData(): Promise<void> {
    try {
      // Load learned vocabulary
      const vocabResponse = await fetch("/learnt_vocab.json")
      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json()
        if (vocabData.vocabulary) {
          Object.entries(vocabData.vocabulary).forEach(([word, entry]: [string, any]) => {
            this.vocabulary.set(word.toLowerCase(), {
              word: word.toLowerCase(),
              definition: entry.definition,
              partOfSpeech: entry.partOfSpeech || "unknown",
              examples: entry.examples || [],
              source: "learned_api",
              confidence: entry.confidence || 0.8,
              phonetic: entry.phonetic || "",
              synonyms: entry.synonyms || [],
              antonyms: entry.antonyms || [],
              frequency: entry.frequency || 1,
            })
          })
          console.log(`✅ Loaded ${Object.keys(vocabData.vocabulary).length} learned vocabulary words`)
        }
      }

      // Load learned math
      const mathResponse = await fetch("/learnt_maths.json")
      if (mathResponse.ok) {
        const mathData = await mathResponse.json()
        if (mathData.mathematics) {
          Object.entries(mathData.mathematics).forEach(([concept, entry]: [string, any]) => {
            this.mathematics.set(concept, {
              concept,
              data: entry,
              source: "learned",
              confidence: 0.8,
            })
          })
          console.log(`✅ Loaded learned mathematics`)
        }
      }

      // Load learned coding
      const codingResponse = await fetch("/learnt_coding.json")
      if (codingResponse.ok) {
        const codingData = await codingResponse.json()
        if (codingData.coding) {
          Object.entries(codingData.coding).forEach(([concept, entry]: [string, any]) => {
            this.coding.set(concept, {
              concept,
              data: entry,
              source: "learned",
              confidence: 0.8,
            })
          })
          console.log(`✅ Loaded learned coding`)
        }
      }
    } catch (error) {
      console.warn("Failed to load learned data:", error)
    }
  }

  public async processMessage(message: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.conversationHistory.push({
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    })

    let response = ""

    // Check for math calculations
    if (this.isMathQuery(message)) {
      response = this.processMathQuery(message)
    }
    // Check for vocabulary lookup
    else if (this.isVocabularyQuery(message)) {
      response = await this.processVocabularyQuery(message)
    }
    // General conversation
    else {
      response = this.processGeneralQuery(message)
    }

    this.conversationHistory.push({
      type: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    })

    return response
  }

  private isMathQuery(message: string): boolean {
    const mathPatterns = [
      /\d+\s*[+\-*/%]\s*\d+/,
      /what\s+is\s+\d+/i,
      /calculate/i,
      /solve/i,
      /math/i,
      /\d+\s*\^\s*\d+/,
      /sqrt\(/i,
      /sin\(/i,
      /cos\(/i,
      /tan\(/i,
    ]
    return mathPatterns.some((pattern) => pattern.test(message))
  }

  private processMathQuery(message: string): string {
    try {
      // Extract mathematical expressions
      const mathExpression = message.match(/[\d+\-*/$$$$.\s^]+/)?.[0]?.trim()

      if (!mathExpression) {
        return "I couldn't find a mathematical expression to calculate."
      }

      // Simple calculator for basic operations
      let result: number

      // Handle basic arithmetic
      if (mathExpression.includes("+")) {
        const parts = mathExpression.split("+").map((p) => Number.parseFloat(p.trim()))
        result = parts.reduce((a, b) => a + b, 0)
      } else if (mathExpression.includes("-")) {
        const parts = mathExpression.split("-").map((p) => Number.parseFloat(p.trim()))
        result = parts[0] - parts.slice(1).reduce((a, b) => a + b, 0)
      } else if (mathExpression.includes("*")) {
        const parts = mathExpression.split("*").map((p) => Number.parseFloat(p.trim()))
        result = parts.reduce((a, b) => a * b, 1)
      } else if (mathExpression.includes("/")) {
        const parts = mathExpression.split("/").map((p) => Number.parseFloat(p.trim()))
        result = parts[0] / parts[1]
      } else {
        result = Number.parseFloat(mathExpression)
      }

      if (isNaN(result)) {
        return "I couldn't calculate that expression. Please check your math."
      }

      // Store the calculation
      const calculationKey = `calc_${Date.now()}`
      this.mathematics.set(calculationKey, {
        expression: mathExpression,
        result: result,
        timestamp: new Date().toISOString(),
        source: "calculated",
      })

      return `The answer is: ${result}`
    } catch (error) {
      return "I encountered an error while calculating. Please check your expression."
    }
  }

  private isVocabularyQuery(message: string): boolean {
    const vocabPatterns = [
      /what\s+does\s+(\w+)\s+mean/i,
      /define\s+(\w+)/i,
      /definition\s+of\s+(\w+)/i,
      /meaning\s+of\s+(\w+)/i,
      /what\s+is\s+(\w+)/i,
    ]
    return vocabPatterns.some((pattern) => pattern.test(message))
  }

  private async processVocabularyQuery(message: string): Promise<string> {
    // Extract the word from the query
    const patterns = [
      /what\s+does\s+(\w+)\s+mean/i,
      /define\s+(\w+)/i,
      /definition\s+of\s+(\w+)/i,
      /meaning\s+of\s+(\w+)/i,
      /what\s+is\s+(\w+)/i,
    ]

    let word = ""
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        word = match[1].toLowerCase()
        break
      }
    }

    if (!word) {
      return "I couldn't identify which word you want me to define."
    }

    // Check if we already know this word
    const existingEntry = this.vocabulary.get(word)
    if (existingEntry) {
      return this.formatVocabularyResponse(existingEntry)
    }

    // Try to look up the word using a dictionary API
    try {
      const definition = await this.lookupWordDefinition(word)
      if (definition) {
        // Store the new word
        this.vocabulary.set(word, definition)
        await this.saveLearnedVocabulary()
        return this.formatVocabularyResponse(definition)
      }
    } catch (error) {
      console.warn("Dictionary API lookup failed:", error)
    }

    return `I don't know the definition of "${word}". You could try teaching me by saying something like: "The word ${word} means..."`
  }

  private async lookupWordDefinition(word: string): Promise<any | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data[0]) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]

          return {
            word: word.toLowerCase(),
            definition: definition?.definition || "No definition available",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            examples: definition?.example ? [definition.example] : [],
            source: "learned_api",
            confidence: 0.8,
            phonetic: entry.phonetic || "",
            synonyms: definition?.synonyms || [],
            antonyms: definition?.antonyms || [],
            frequency: 1,
          }
        }
      }
    } catch (error) {
      console.warn("Dictionary API error:", error)
    }
    return null
  }

  private formatVocabularyResponse(entry: any): string {
    let response = `**${entry.word}** (${entry.partOfSpeech})\n\n`
    response += `Definition: ${entry.definition}\n\n`

    if (entry.phonetic) {
      response += `Pronunciation: ${entry.phonetic}\n\n`
    }

    if (entry.examples && entry.examples.length > 0) {
      response += `Example: "${entry.examples[0]}"\n\n`
    }

    if (entry.synonyms && entry.synonyms.length > 0) {
      response += `Synonyms: ${entry.synonyms.slice(0, 3).join(", ")}\n\n`
    }

    response += `Source: ${entry.source === "seed" ? "Built-in knowledge" : "Dictionary API"}`

    return response
  }

  private processGeneralQuery(message: string): string {
    // Simple pattern matching for common queries
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm ZacAI, your personal AI assistant. I can help with math calculations, vocabulary definitions, and general conversation. What would you like to know?"
    }

    if (lowerMessage.includes("how are you")) {
      return "I'm doing well, thank you! I'm ready to help you with any questions you have. I can calculate math problems, define words, or just chat."
    }

    if (lowerMessage.includes("what can you do")) {
      return `I can help you with:
• Math calculations (try "what is 15 + 27?")
• Word definitions (try "what does 'serendipity' mean?")
• General conversation
• Learning new information from our chats

I currently know ${this.vocabulary.size} words and ${this.mathematics.size} math concepts. What would you like to explore?`
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! I'm happy to help. Is there anything else you'd like to know?"
    }

    // Default response
    return (
      "I understand you're saying: \"" +
      message +
      "\". I'm still learning how to respond to all types of messages. You can ask me to define words, solve math problems, or just chat!"
    )
  }

  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedWords = Array.from(this.vocabulary.entries())
        .filter(([_, entry]) => entry.source === "learned_api")
        .reduce((acc, [word, entry]) => {
          acc[word] = entry
          return acc
        }, {} as any)

      const data = {
        metadata: {
          version: "2.0.0",
          lastUpdated: new Date().toISOString(),
          totalEntries: Object.keys(learnedWords).length,
          source: "learned_api",
          description: "Vocabulary words learned through conversations and API lookups",
        },
        vocabulary: learnedWords,
      }

      // In a real app, you'd save this to a server or local storage
      console.log("📝 Would save learned vocabulary:", data)
    } catch (error) {
      console.error("Failed to save learned vocabulary:", error)
    }
  }

  public getSystemStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length
    const calculatedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "calculated").length
    const seedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "seed").length

    return {
      isInitialized: this.isInitialized,
      identity: this.systemIdentity,
      vocabulary: {
        total: this.vocabulary.size,
        seed: seedVocab,
        learned: learnedVocab,
      },
      mathematics: {
        total: this.mathematics.size,
        seed: seedMath,
        calculated: calculatedMath,
      },
      facts: {
        total: this.facts.size,
      },
      coding: {
        total: this.coding.size,
      },
      conversations: this.conversationHistory.length,
      lastActivity:
        this.conversationHistory.length > 0
          ? this.conversationHistory[this.conversationHistory.length - 1].timestamp
          : null,
    }
  }

  public getSystemDebugInfo(): any {
    return {
      initialized: this.isInitialized,
      vocabularySize: this.vocabulary.size,
      mathSize: this.mathematics.size,
      factsSize: this.facts.size,
      codingSize: this.coding.size,
      conversationCount: this.conversationHistory.length,
      sampleVocabulary: Array.from(this.vocabulary.entries()).slice(0, 5),
      sampleMath: Array.from(this.mathematics.entries()).slice(0, 3),
      recentConversations: this.conversationHistory.slice(-3),
    }
  }

  public getVocabularyList(): Array<{ word: string; definition: string; source: string }> {
    return Array.from(this.vocabulary.values()).map((entry) => ({
      word: entry.word,
      definition: entry.definition,
      source: entry.source,
    }))
  }

  public getMathematicsHistory(): Array<{ concept: string; data: any; source: string }> {
    return Array.from(this.mathematics.values()).map((entry) => ({
      concept: entry.concept || "calculation",
      data: entry.data || entry,
      source: entry.source,
    }))
  }

  public getConversationHistory(): any[] {
    return [...this.conversationHistory]
  }

  public clearHistory(): void {
    this.conversationHistory = []
  }

  public exportData(): any {
    return {
      vocabulary: Object.fromEntries(this.vocabulary),
      mathematics: Object.fromEntries(this.mathematics),
      facts: Object.fromEntries(this.facts),
      coding: Object.fromEntries(this.coding),
      conversations: this.conversationHistory,
      stats: this.getSystemStats(),
    }
  }
}

// Create a singleton instance
export const unifiedAI = new UnifiedAISystem()
