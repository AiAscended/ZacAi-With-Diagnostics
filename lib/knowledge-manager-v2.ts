interface LearnedKnowledge {
  vocabulary: Map<string, VocabularyEntry>
  mathematics: Map<string, MathEntry>
  userInfo: Map<string, UserInfoEntry>
  facts: Map<string, FactEntry>
  conversations: ConversationEntry[]
  metadata: {
    totalEntries: number
    lastUpdated: number
    version: string
  }
}

interface VocabularyEntry {
  word: string
  definition: string
  partOfSpeech: string
  phonetic?: string
  synonyms: string[]
  antonyms: string[]
  examples: string[]
  frequency: number
  learned: number
  category: string
}

interface MathEntry {
  concept: string
  formula?: string
  examples: string[]
  category: string
  difficulty: number
  learned: number
}

interface UserInfoEntry {
  key: string
  value: string
  importance: number
  timestamp: number
  category: string
}

interface FactEntry {
  fact: string
  source: string
  category: string
  confidence: number
  timestamp: number
}

interface ConversationEntry {
  id: string
  timestamp: number
  userMessage: string
  aiResponse: string
  knowledgeExtracted: string[]
}

export class KnowledgeManagerV2 {
  private learnedKnowledge: LearnedKnowledge
  private sessionData: any = {}
  private dbName = "AIKnowledgeDB"
  private dbVersion = 1
  private db: IDBDatabase | null = null

  constructor() {
    this.learnedKnowledge = {
      vocabulary: new Map(),
      mathematics: new Map(),
      userInfo: new Map(),
      facts: new Map(),
      conversations: [],
      metadata: {
        totalEntries: 0,
        lastUpdated: Date.now(),
        version: "2.0.0",
      },
    }
    this.initializeDB()
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("learned")) {
          db.createObjectStore("learned", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("seed")) {
          db.createObjectStore("seed", { keyPath: "type" })
        }
      }
    })
  }

  public async loadSeedData(): Promise<void> {
    try {
      console.log("🌱 Loading seed data...")

      // Load all seed files directly for now
      const [vocab, maths, system, learning] = await Promise.all([
        this.loadSeedFile("/seed_vocab.json").catch(() => ({})),
        this.loadSeedFile("/seed_maths.json").catch(() => ({})),
        this.loadSeedFile("/seed_system.json").catch(() => ({})),
        this.loadSeedFile("/seed_learning.json").catch(() => ({})),
      ])

      // Process vocabulary seed
      if (vocab && Object.keys(vocab).length > 0) {
        Object.entries(vocab).forEach(([word, data]: [string, any]) => {
          this.learnedKnowledge.vocabulary.set(word, {
            word,
            definition: data.definition || data.d || "",
            partOfSpeech: data.part_of_speech || data.p || "unknown",
            phonetic: data.phonetic || data.ph,
            synonyms: data.synonyms || data.s || [],
            antonyms: data.antonyms || data.a || [],
            examples: data.examples || data.e || [],
            frequency: data.frequency || data.f || 1,
            learned: Date.now(),
            category: "seed",
          })
        })
      }

      // Process mathematics seed
      if (maths && Object.keys(maths).length > 0) {
        Object.entries(maths).forEach(([concept, data]: [string, any]) => {
          this.learnedKnowledge.mathematics.set(concept, {
            concept,
            formula: data.formula,
            examples: data.examples || [],
            category: data.category || "arithmetic",
            difficulty: data.difficulty || 1,
            learned: Date.now(),
          })
        })
      }

      // Store system and learning data
      if (system && Object.keys(system).length > 0) {
        this.sessionData.system = system
      }
      if (learning && Object.keys(learning).length > 0) {
        this.sessionData.learning = learning
      }

      await this.saveToIndexedDB()
      console.log("✅ Seed data loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load seed data:", error)
      // Don't throw the error, just log it so the system can still function
    }
  }

  private async loadSeedFile(path: string): Promise<any> {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`Failed to load ${path}`)
    return response.json()
  }

  public async learnFromMessage(userMessage: string, aiResponse: string): Promise<void> {
    const extractedKnowledge: string[] = []

    // Extract vocabulary
    const newWords = this.extractNewVocabulary(userMessage)
    for (const word of newWords) {
      if (!this.learnedKnowledge.vocabulary.has(word)) {
        // Try to get definition from online sources
        const definition = await this.lookupWordDefinition(word)
        if (definition) {
          this.learnedKnowledge.vocabulary.set(word, {
            word,
            definition: definition.definition,
            partOfSpeech: definition.partOfSpeech || "unknown",
            phonetic: definition.phonetic,
            synonyms: definition.synonyms || [],
            antonyms: definition.antonyms || [],
            examples: definition.examples || [],
            frequency: 1,
            learned: Date.now(),
            category: "learned",
          })
          extractedKnowledge.push(`vocabulary: ${word}`)
        }
      }
    }

    // Extract mathematical concepts
    const mathConcepts = this.extractMathConcepts(userMessage)
    for (const concept of mathConcepts) {
      if (!this.learnedKnowledge.mathematics.has(concept.name)) {
        this.learnedKnowledge.mathematics.set(concept.name, {
          concept: concept.name,
          formula: concept.formula,
          examples: [userMessage],
          category: concept.category,
          difficulty: concept.difficulty || 1,
          learned: Date.now(),
        })
        extractedKnowledge.push(`math: ${concept.name}`)
      }
    }

    // Extract user information
    const userInfo = this.extractUserInfo(userMessage)
    for (const info of userInfo) {
      this.learnedKnowledge.userInfo.set(info.key, {
        key: info.key,
        value: info.value,
        importance: info.importance,
        timestamp: Date.now(),
        category: "personal",
      })
      extractedKnowledge.push(`user_info: ${info.key}`)
    }

    // Store conversation
    const conversation: ConversationEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      userMessage,
      aiResponse,
      knowledgeExtracted: extractedKnowledge,
    }
    this.learnedKnowledge.conversations.push(conversation)

    // Keep only recent conversations
    if (this.learnedKnowledge.conversations.length > 100) {
      this.learnedKnowledge.conversations = this.learnedKnowledge.conversations.slice(-80)
    }

    // Update metadata
    this.learnedKnowledge.metadata.totalEntries =
      this.learnedKnowledge.vocabulary.size +
      this.learnedKnowledge.mathematics.size +
      this.learnedKnowledge.userInfo.size +
      this.learnedKnowledge.facts.size
    this.learnedKnowledge.metadata.lastUpdated = Date.now()

    // Save to storage
    await this.saveToIndexedDB()
    this.saveSessionToLocalStorage()

    console.log(`🧠 Learned: ${extractedKnowledge.join(", ")}`)
  }

  private extractNewVocabulary(message: string): string[] {
    const words = message.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    return words.filter(
      (word) => word.length > 2 && !this.learnedKnowledge.vocabulary.has(word) && !this.isCommonWord(word),
    )
  }

  private extractMathConcepts(message: string): any[] {
    const concepts: any[] = []

    // Look for mathematical expressions
    const mathPatterns = [
      { pattern: /(\d+)\s*\+\s*(\d+)/g, name: "addition", category: "arithmetic" },
      { pattern: /(\d+)\s*-\s*(\d+)/g, name: "subtraction", category: "arithmetic" },
      { pattern: /(\d+)\s*\*\s*(\d+)/g, name: "multiplication", category: "arithmetic" },
      { pattern: /(\d+)\s*\/\s*(\d+)/g, name: "division", category: "arithmetic" },
      { pattern: /sqrt$$(\d+)$$/g, name: "square_root", category: "algebra" },
      { pattern: /sin$$(\d+)$$/g, name: "sine", category: "trigonometry" },
      { pattern: /cos$$(\d+)$$/g, name: "cosine", category: "trigonometry" },
    ]

    for (const { pattern, name, category } of mathPatterns) {
      const matches = message.match(pattern)
      if (matches) {
        concepts.push({
          name,
          category,
          formula: matches[0],
          difficulty: category === "arithmetic" ? 1 : 3,
        })
      }
    }

    return concepts
  }

  private extractUserInfo(message: string): any[] {
    const userInfo: any[] = []

    const patterns = [
      { pattern: /my name is (\w+)/i, key: "name", importance: 0.9 },
      { pattern: /i am (\d+) years old/i, key: "age", importance: 0.7 },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job", importance: 0.8 },
      { pattern: /i like (.+)/i, key: "likes", importance: 0.6 },
      { pattern: /i live in (.+)/i, key: "location", importance: 0.7 },
      { pattern: /remember (?:that )?(.+)/i, key: "remember", importance: 0.8 },
    ]

    for (const { pattern, key, importance } of patterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        userInfo.push({
          key: key === "remember" ? `memory_${Date.now()}` : key,
          value: match[1].trim(),
          importance,
        })
      }
    }

    return userInfo
  }

  private async lookupWordDefinition(word: string): Promise<any | null> {
    try {
      // Try Wiktionary API first
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.en && data.en.length > 0) {
          const definition = data.en[0]
          return {
            definition: definition.definition,
            partOfSpeech: definition.partOfSpeech,
            examples: definition.examples || [],
          }
        }
      }

      // Fallback to Dictionary API
      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

      if (dictResponse.ok) {
        const dictData = await dictResponse.json()
        if (dictData.length > 0) {
          const entry = dictData[0]
          const meaning = entry.meanings[0]
          return {
            definition: meaning.definitions[0].definition,
            partOfSpeech: meaning.partOfSpeech,
            phonetic: entry.phonetic,
            examples: meaning.definitions[0].example ? [meaning.definitions[0].example] : [],
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to lookup definition for "${word}":`, error)
    }

    return null
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "its",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use",
    ])
    return commonWords.has(word)
  }

  public async saveToIndexedDB(): Promise<void> {
    if (!this.db) return

    try {
      const transaction = this.db.transaction(["learned"], "readwrite")
      const store = transaction.objectStore("learned")

      const learnedData = {
        id: "main",
        vocabulary: Array.from(this.learnedKnowledge.vocabulary.entries()),
        mathematics: Array.from(this.learnedKnowledge.mathematics.entries()),
        userInfo: Array.from(this.learnedKnowledge.userInfo.entries()),
        facts: Array.from(this.learnedKnowledge.facts.entries()),
        conversations: this.learnedKnowledge.conversations,
        metadata: this.learnedKnowledge.metadata,
      }

      await store.put(learnedData)
    } catch (error) {
      console.error("Failed to save to IndexedDB:", error)
    }
  }

  public async loadFromIndexedDB(): Promise<void> {
    if (!this.db) return

    try {
      const transaction = this.db.transaction(["learned"], "readonly")
      const store = transaction.objectStore("learned")
      const request = store.get("main")

      request.onsuccess = () => {
        const data = request.result
        if (data) {
          this.learnedKnowledge.vocabulary = new Map(data.vocabulary)
          this.learnedKnowledge.mathematics = new Map(data.mathematics)
          this.learnedKnowledge.userInfo = new Map(data.userInfo)
          this.learnedKnowledge.facts = new Map(data.facts)
          this.learnedKnowledge.conversations = data.conversations || []
          this.learnedKnowledge.metadata = data.metadata || this.learnedKnowledge.metadata
          console.log("✅ Loaded knowledge from IndexedDB")
        }
      }
    } catch (error) {
      console.error("Failed to load from IndexedDB:", error)
    }
  }

  private saveSessionToLocalStorage(): void {
    try {
      const sessionData = {
        ...this.sessionData,
        timestamp: Date.now(),
        knowledgeStats: {
          vocabulary: this.learnedKnowledge.vocabulary.size,
          mathematics: this.learnedKnowledge.mathematics.size,
          userInfo: this.learnedKnowledge.userInfo.size,
          facts: this.learnedKnowledge.facts.size,
          conversations: this.learnedKnowledge.conversations.length,
        },
      }
      localStorage.setItem("ai_session", JSON.stringify(sessionData))
    } catch (error) {
      console.warn("Failed to save session to localStorage:", error)
    }
  }

  public loadSessionFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem("ai_session")
      if (stored) {
        this.sessionData = JSON.parse(stored)
        console.log("✅ Loaded session from localStorage")
      }
    } catch (error) {
      console.warn("Failed to load session from localStorage:", error)
    }
  }

  public searchKnowledge(query: string): any[] {
    const results: any[] = []
    const queryLower = query.toLowerCase()

    // Search vocabulary
    for (const [word, entry] of this.learnedKnowledge.vocabulary) {
      if (word.includes(queryLower) || entry.definition.toLowerCase().includes(queryLower)) {
        results.push({ type: "vocabulary", data: entry, relevance: this.calculateRelevance(query, word) })
      }
    }

    // Search mathematics
    for (const [concept, entry] of this.learnedKnowledge.mathematics) {
      if (concept.includes(queryLower) || entry.formula?.toLowerCase().includes(queryLower)) {
        results.push({ type: "mathematics", data: entry, relevance: this.calculateRelevance(query, concept) })
      }
    }

    // Search user info
    for (const [key, entry] of this.learnedKnowledge.userInfo) {
      if (key.includes(queryLower) || entry.value.toLowerCase().includes(queryLower)) {
        results.push({ type: "userInfo", data: entry, relevance: this.calculateRelevance(query, entry.value) })
      }
    }

    // Search facts
    for (const [topic, entry] of this.learnedKnowledge.facts) {
      if (topic.includes(queryLower) || entry.fact.toLowerCase().includes(queryLower)) {
        results.push({ type: "facts", data: entry, relevance: this.calculateRelevance(query, entry.fact) })
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
  }

  private calculateRelevance(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(" ")
    const textWords = text.toLowerCase().split(" ")
    let matches = 0

    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matches++
        }
      }
    }

    return matches / queryWords.length
  }

  public exportKnowledge(): any {
    return {
      vocabulary: Array.from(this.learnedKnowledge.vocabulary.entries()),
      mathematics: Array.from(this.learnedKnowledge.mathematics.entries()),
      userInfo: Array.from(this.learnedKnowledge.userInfo.entries()),
      facts: Array.from(this.learnedKnowledge.facts.entries()),
      conversations: this.learnedKnowledge.conversations,
      metadata: this.learnedKnowledge.metadata,
      session: this.sessionData,
      exportDate: new Date().toISOString(),
    }
  }

  public importKnowledge(data: any): void {
    try {
      if (data.vocabulary) {
        this.learnedKnowledge.vocabulary = new Map(data.vocabulary)
      }
      if (data.mathematics) {
        this.learnedKnowledge.mathematics = new Map(data.mathematics)
      }
      if (data.userInfo) {
        this.learnedKnowledge.userInfo = new Map(data.userInfo)
      }
      if (data.facts) {
        this.learnedKnowledge.facts = new Map(data.facts)
      }
      if (data.conversations) {
        this.learnedKnowledge.conversations = data.conversations
      }
      if (data.metadata) {
        this.learnedKnowledge.metadata = data.metadata
      }
      if (data.session) {
        this.sessionData = data.session
      }

      this.saveToIndexedDB()
      this.saveSessionToLocalStorage()
      console.log("✅ Knowledge imported successfully")
    } catch (error) {
      console.error("❌ Failed to import knowledge:", error)
    }
  }

  public getStats(): any {
    return {
      vocabulary: this.learnedKnowledge.vocabulary.size,
      mathematics: this.learnedKnowledge.mathematics.size,
      userInfo: this.learnedKnowledge.userInfo.size,
      facts: this.learnedKnowledge.facts.size,
      conversations: this.learnedKnowledge.conversations.length,
      totalEntries: this.learnedKnowledge.metadata.totalEntries,
      lastUpdated: this.learnedKnowledge.metadata.lastUpdated,
      version: this.learnedKnowledge.metadata.version,
    }
  }

  public getSystemInfo(): any {
    return this.sessionData.system || {}
  }

  public getLearningInstructions(): any {
    return this.sessionData.learning || {}
  }
}
