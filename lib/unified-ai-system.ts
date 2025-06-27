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
      const seedVocab = Array.from(this.vocabulary.values()).filter(v => v.source === "seed").length
      const learnedVocab = Array.from(this.vocabulary.values()).filter(v => v.source === "learned_api").length
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
    }\
