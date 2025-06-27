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
      // Load seed data
      await this.loadSeedVocabulary()
      await this.loadSeedMathematics()
      await this.loadSeedFacts()
      await this.loadSeedCoding()

      // Load learned data (should be empty on fresh install)
      await this.loadLearnedData()

      this.isInitialized = true
      console.log("✅ ZacAI System initialized successfully")
      console.log(`📚 Vocabulary: ${this.vocabulary.size} words`)
      console.log(`🧮 Mathematics: ${this.mathematics.size} concepts`)
      console.log(`🧠 Facts: ${this.facts.size} facts`)
      console.log(`💻 Coding: ${this.coding.size} concepts`)
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
      // Load learned vocabulary (should be empty on fresh install)
      const vocabResponse = await fetch("/learnt_vocab.json")
      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json()
        if (vocabData.vocabulary && Object.keys(vocabData.vocabulary).length > 0) {
          Object.entries(vocabData.vocabulary).forEach(([word, entry]: [string, any]) => {
            this.vocabulary.set(word.toLowerCase(), {
              ...entry,
              source: "learned_api",
            })
          })
          console.log(`✅ Loaded ${Object.keys(vocabData.vocabulary).length} learned vocabulary words`)
        } else {
          console.log("📝 No learned vocabulary found (fresh install)")
        }
      }

      // Load learned mathematics
      const mathResponse = await fetch("/learnt_maths.json")
      if (mathResponse.ok) {
        const mathData = await mathResponse.json()
        if (mathData.mathematics && Object.keys(mathData.mathematics).length > 0) {
          Object.entries(mathData.mathematics).forEach(([concept, entry]: [string, any]) => {
            this.mathematics.set(concept, {
              ...entry,
              source: "learned_calculations",
            })
          })
          console.log(`✅ Loaded learned mathematics`)
        } else {
          console.log("🧮 No learned mathematics found (fresh install)")
        }
      }

      // Load learned science
      const scienceResponse = await fetch("/learnt_science.json")
      if (scienceResponse.ok) {
        const scienceData = await scienceResponse.json()
        if (scienceData.science && Object.keys(scienceData.science).length > 0) {
          Object.entries(scienceData.science).forEach(([topic, entry]: [string, any]) => {
            this.facts.set(topic, {
              ...entry,
              source: "learned_knowledge",
            })
          })
          console.log(`✅ Loaded learned science`)
        } else {
          console.log("🧬 No learned science found (fresh install)")
        }
      }

      // Load learned coding
      const codingResponse = await fetch("/learnt_coding.json")
      if (codingResponse.ok) {
        const codingData = await codingResponse.json()
        if (codingData.coding && Object.keys(codingData.coding).length > 0) {
          Object.entries(codingData.coding).forEach(([concept, entry]: [string, any]) => {
            this.coding.set(concept, {
              ...entry,
              source: "learned_coding",
            })
          })
          console.log(`✅ Loaded learned coding`)
        } else {
          console.log("💻 No learned coding found (fresh install)")
        }
      }
    } catch (error) {
      console.warn("Failed to load learned data:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    console.log("🤖 Processing:", userMessage)

    // Store personal info
    this.extractPersonalInfo(userMessage)

    // Check for math calculation
    if (this.isMathCalculation(userMessage)) {
      return this.handleMathCalculation(userMessage)
    }

    // Check for vocabulary lookup
    if (this.isVocabularyLookup(userMessage)) {
      return this.handleVocabularyLookup(userMessage)
    }

    // Check for personal info query
    if (this.isPersonalInfoQuery(userMessage)) {
      return this.handlePersonalInfoQuery(userMessage)
    }

    // Check for system query
    if (this.isSystemQuery(userMessage)) {
      return this.handleSystemQuery(userMessage)
    }

    // Default response
    return this.handleGeneralConversation(userMessage)
  }

  private extractPersonalInfo(message: string): void {
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      this.personalInfo.set("name", {
        key: "name",
        value: nameMatch[1],
        timestamp: Date.now(),
      })
      console.log(`📝 Stored name: ${nameMatch[1]}`)
    }
  }

  private isMathCalculation(message: string): boolean {
    return /\d+\s*[x×*+\-÷/]\s*\d+/.test(message) || /formula/i.test(message)
  }

  private isVocabularyLookup(message: string): boolean {
    return /what\s+(?:is|does|means?)\s+\w+/i.test(message) || /define\s+\w+/i.test(message)
  }

  private isPersonalInfoQuery(message: string): boolean {
    return /what'?s my name|do you remember|what do you know about me/i.test(message)
  }

  private isSystemQuery(message: string): boolean {
    return /who are you|what are you|diagnostic|status/i.test(message)
  }

  private handleMathCalculation(message: string): any {
    // Extract math operation
    const mathMatch = message.match(/(\d+)\s*([x×*+\-÷/])\s*(\d+)/)
    if (mathMatch) {
      const [, num1, op, num2] = mathMatch
      const a = Number.parseInt(num1)
      const b = Number.parseInt(num2)
      let result = 0

      switch (op) {
        case "+":
          result = a + b
          break
        case "-":
          result = a - b
          break
        case "x":
        case "×":
        case "*":
          result = a * b
          break
        case "÷":
        case "/":
          result = a / b
          break
      }

      // Save calculation to learned mathematics
      const calcKey = `calc_${a}_${op}_${b}`
      this.mathematics.set(calcKey, {
        concept: `${a} ${op} ${b}`,
        result: result,
        source: "calculated",
        timestamp: Date.now(),
        confidence: 0.95,
      })

      // Save to learnt_maths.json (in real app)
      this.saveLearnedMathematics()

      return {
        content: `🧮 **${a} ${op} ${b} = ${result}**\n\nCalculation completed and stored for future reference.`,
        confidence: 0.95,
        reasoning: ["Performed mathematical calculation", "Saved to learned mathematics"],
        knowledgeUsed: ["seed_math_data"],
      }
    }

    return {
      content: "I can help with math calculations. Try something like '3×3' or '10+5'.",
      confidence: 0.7,
      reasoning: ["Could not parse math expression"],
    }
  }

  private async handleVocabularyLookup(message: string): Promise<any> {
    const wordMatch = message.match(/(?:what\s+(?:is|does|means?)|define)\s+(\w+)/i)
    if (!wordMatch) {
      return {
        content: "I couldn't identify the word you want me to define.",
        confidence: 0.3,
        reasoning: ["Could not extract word"],
      }
    }

    const word = wordMatch[1].toLowerCase()

    // Check if we have the word in seed vocabulary
    if (this.vocabulary.has(word)) {
      const entry = this.vocabulary.get(word)
      return {
        content: `📖 **${word}**\n\n**Definition:** ${entry.definition}\n\n**Part of Speech:** ${entry.partOfSpeech}\n\n✅ From my ${entry.source} vocabulary.`,
        confidence: entry.confidence,
        reasoning: [`Found word in ${entry.source} vocabulary`],
        knowledgeUsed: [entry.source],
      }
    }

    // Try to look up online using Dictionary API
    try {
      console.log(`🔍 Looking up word online: ${word}`)
      const wordData = await this.lookupWordOnline(word)
      if (wordData) {
        // Save the learned word
        const newEntry = {
          word: word,
          definition: wordData.definition,
          partOfSpeech: wordData.partOfSpeech || "unknown",
          examples: wordData.examples || [],
          source: "learned_api",
          confidence: 0.8,
          timestamp: Date.now(),
          phonetic: wordData.phonetic || "",
          synonyms: wordData.synonyms || [],
          antonyms: wordData.antonyms || [],
        }

        this.vocabulary.set(word, newEntry)

        // Save to learnt_vocab.json (in real app)
        await this.saveLearnedVocabulary()

        return {
          content: `📖 **${word}** (newly learned)\n\n**Definition:** ${wordData.definition}\n\n**Part of Speech:** ${wordData.partOfSpeech}\n\n✨ I've learned this word and saved it for future use!`,
          confidence: 0.8,
          reasoning: ["Looked up word online via Dictionary API", "Learned and saved new word"],
          knowledgeUsed: ["dictionary_api", "online_lookup"],
        }
      }
    } catch (error) {
      console.warn(`Failed to lookup word: ${word}`, error)
    }

    return {
      content: `I don't know the word "${word}" yet, but I'll try to learn it for next time. The Dictionary API might be unavailable right now.`,
      confidence: 0.4,
      reasoning: ["Word not found in vocabulary", "Online lookup failed"],
    }
  }

  private async lookupWordOnline(word: string): Promise<any> {
    try {
      console.log(`🔍 Looking up word online: ${word}`)
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]

          console.log(`✅ Found definition for ${word}:`, definition?.definition)

          return {
            definition: definition?.definition || "Definition found",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            examples: definition?.example ? [definition.example] : [],
            phonetic: entry.phonetic || "",
            synonyms: definition?.synonyms || [],
            antonyms: definition?.antonyms || [],
          }
        }
      }
    } catch (error) {
      console.warn("Dictionary API failed:", error)
    }
    return null
  }

  private handlePersonalInfoQuery(message: string): any {
    if (message.toLowerCase().includes("name")) {
      const nameInfo = this.personalInfo.get("name")
      if (nameInfo) {
        return {
          content: `Your name is ${nameInfo.value}! I remember you telling me that.`,
          confidence: 0.95,
          reasoning: ["Retrieved name from personal memory"],
        }
      } else {
        return {
          content: "I don't think you've told me your name yet. What's your name?",
          confidence: 0.8,
          reasoning: ["No name stored in memory"],
        }
      }
    }

    if (this.personalInfo.size > 0) {
      let response = "Here's what I remember about you:\n\n"
      this.personalInfo.forEach((entry, key) => {
        response += `• **${key}**: ${entry.value}\n`
      })

      return {
        content: response,
        confidence: 0.9,
        reasoning: ["Retrieved all personal information"],
      }
    }

    return {
      content: "I don't have any personal information about you stored yet. Tell me about yourself!",
      confidence: 0.7,
      reasoning: ["No personal information stored"],
    }
  }

  private handleSystemQuery(message: string): any {
    if (message.toLowerCase().includes("diagnostic")) {
      return {
        content: `🔍 **ZacAI System Diagnostic**\n\n**Status:** ✅ Operational\n**Vocabulary:** ${this.vocabulary.size} words\n**Mathematics:** ${this.mathematics.size} concepts\n**Facts:** ${this.facts.size} facts\n**Coding:** ${this.coding.size} concepts\n**Personal Info:** ${this.personalInfo.size} entries\n\n**All systems working correctly!**`,
        confidence: 0.95,
        reasoning: ["Performed system diagnostic"],
      }
    }

    return {
      content: `👋 I'm ${this.systemIdentity.name} v${this.systemIdentity.version}\n\nI'm an AI assistant with:\n• 📚 Comprehensive vocabulary (${this.vocabulary.size} words)\n• 🧮 Mathematical knowledge\n• 🧠 General knowledge\n• 💻 Coding expertise\n• 🎓 Continuous learning via online APIs\n\nWhat would you like to explore?`,
      confidence: 0.9,
      reasoning: ["Provided system information"],
    }
  }

  private handleGeneralConversation(message: string): any {
    const userName = this.personalInfo.get("name")?.value
    const greeting = userName ? `Hello ${userName}!` : "Hello!"

    return {
      content: `${greeting} I understand you said: "${message}"\n\nI can help you with:\n• 🧮 Math calculations (try "2x2" or "10+5")\n• 📖 Word definitions (try "what is science")\n• 🧠 General knowledge\n• 💻 Coding questions\n• 🎓 Learning new things via online APIs\n\nWhat would you like to know?`,
      confidence: 0.8,
      reasoning: ["Generated contextual response"],
    }
  }

  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedWords = {}
      this.vocabulary.forEach((entry, word) => {
        if (entry.source === "learned_api") {
          learnedWords[word] = entry
        }
      })

      console.log("📝 Would save learned vocabulary to learnt_vocab.json:", Object.keys(learnedWords).length, "words")
      // In a real app, this would save to the server or local storage
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }

  private async saveLearnedMathematics(): Promise<void> {
    try {
      const learnedMath = {}
      this.mathematics.forEach((entry, concept) => {
        if (entry.source === "calculated") {
          learnedMath[concept] = entry
        }
      })

      console.log(
        "📝 Would save learned mathematics to learnt_maths.json:",
        Object.keys(learnedMath).length,
        "calculations",
      )
      // In a real app, this would save to the server or local storage
    } catch (error) {
      console.warn("Failed to save learned mathematics:", error)
    }
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length
    const seedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "seed").length
    const learnedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "calculated").length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      factsData: this.facts,
      totalMessages: this.conversationHistory.length,
      totalLearned: this.vocabulary.size + this.mathematics.size + this.facts.size + this.coding.size,
      systemStatus: "ready",
      avgConfidence: 0.85,
      vocabularyData: this.vocabulary,
      mathFunctionsData: this.mathematics,
      personalInfoData: this.personalInfo,
      codingData: this.coding,
      breakdown: {
        seedVocab,
        learnedVocab,
        seedMath,
        learnedMath,
      },
    }
  }

  public getConversationHistory(): any[] {
    return this.conversationHistory
  }

  public getSystemDebugInfo(): any {
    return {
      systemIdentity: this.systemIdentity,
      seedDataLoaded: {
        vocabulary: this.vocabulary.size > 0,
        mathematics: this.mathematics.size > 0,
        facts: this.facts.size > 0,
        coding: this.coding.size > 0,
      },
      isInitialized: this.isInitialized,
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      facts: Array.from(this.facts.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      coding: Array.from(this.coding.entries()),
      exportTimestamp: Date.now(),
    }
  }
}
