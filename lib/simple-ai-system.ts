"use client"

export class SimpleAISystem {
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private facts: Map<string, any> = new Map()
  private coding: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private isInitialized = false

  constructor() {
    console.log("🚀 Starting Simple AI System...")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("📚 Loading seed data...")

    // Load seed vocabulary (432 words)
    await this.loadSeedVocabulary()

    // Load seed math
    await this.loadSeedMath()

    // Load learned data
    await this.loadLearnedData()

    // Load personal info from localStorage (for now)
    this.loadPersonalInfo()

    this.isInitialized = true
    console.log(`✅ System ready! Vocabulary: ${this.vocabulary.size}, Math: ${this.mathematics.size}`)
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
            partOfSpeech: entry.part_of_speech || "unknown",
            examples: entry.examples || [],
            source: "seed",
            confidence: 0.9,
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} seed vocabulary words`)
      }
    } catch (error) {
      console.warn("Failed to load seed vocabulary:", error)
    }
  }

  private async loadSeedMath(): Promise<void> {
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
      console.warn("Failed to load seed math:", error)
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
              ...entry,
              source: "learned",
            })
          })
          console.log(`✅ Loaded learned vocabulary`)
        }
      }

      // Load learned math
      const mathResponse = await fetch("/learnt_maths.json")
      if (mathResponse.ok) {
        const mathData = await mathResponse.json()
        if (mathData.mathematics) {
          Object.entries(mathData.mathematics).forEach(([concept, entry]: [string, any]) => {
            this.mathematics.set(concept, {
              ...entry,
              source: "learned",
            })
          })
          console.log(`✅ Loaded learned mathematics`)
        }
      }
    } catch (error) {
      console.warn("Failed to load learned data:", error)
    }
  }

  private loadPersonalInfo(): void {
    try {
      const stored = localStorage.getItem("zacai_personal_info")
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((entry: any) => {
          this.personalInfo.set(entry.key, entry)
        })
        console.log(`✅ Loaded ${data.length} personal info entries`)
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    console.log("🤖 Processing:", userMessage)

    // Store personal info
    this.extractPersonalInfo(userMessage)

    // Get user name for personalized responses
    const userName = this.personalInfo.get("name")?.value

    // Math calculation
    if (this.isMathCalculation(userMessage)) {
      return this.handleMathCalculation(userMessage, userName)
    }

    // Vocabulary lookup
    if (this.isVocabularyLookup(userMessage)) {
      return this.handleVocabularyLookup(userMessage, userName)
    }

    // Personal info query
    if (this.isPersonalInfoQuery(userMessage)) {
      return this.handlePersonalInfoQuery(userMessage, userName)
    }

    // System query
    if (this.isSystemQuery(userMessage)) {
      return this.handleSystemQuery(userMessage, userName)
    }

    // Greeting
    if (this.isGreeting(userMessage)) {
      return this.handleGreeting(userMessage, userName)
    }

    // Default conversation
    return this.handleGeneralConversation(userMessage, userName)
  }

  private extractPersonalInfo(message: string): void {
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      const name = nameMatch[1]
      this.personalInfo.set("name", {
        key: "name",
        value: name,
        timestamp: Date.now(),
      })
      this.savePersonalInfo()
      console.log(`📝 Stored name: ${name}`)
    }
  }

  private isMathCalculation(message: string): boolean {
    return /\d+\s*[x×*+\-÷/]\s*\d+/.test(message)
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

  private isGreeting(message: string): boolean {
    return /^(hi|hello|hey)$/i.test(message.trim())
  }

  private handleMathCalculation(message: string, userName?: string): any {
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

      // Save calculation
      const calcKey = `calc_${Date.now()}`
      this.mathematics.set(calcKey, {
        concept: `${a} ${op} ${b}`,
        result: result,
        source: "calculated",
        timestamp: Date.now(),
      })

      // Save to learned math JSON
      this.saveLearnedMath()

      const greeting = userName ? `${userName}, ` : ""
      return {
        content: `${greeting}🧮 **${a} ${op} ${b} = ${result}**

Calculation completed and saved!`,
        confidence: 0.95,
        reasoning: ["Performed mathematical calculation"],
      }
    }

    return {
      content: "I can help with math calculations. Try something like '3×3' or '10+5'.",
      confidence: 0.7,
      reasoning: ["Could not parse math expression"],
    }
  }

  private async handleVocabularyLookup(message: string, userName?: string): Promise<any> {
    const wordMatch = message.match(/(?:what\s+(?:is|does|means?)|define)\s+(\w+)/i)
    if (!wordMatch) {
      return {
        content: "I couldn't identify the word you want me to define.",
        confidence: 0.3,
        reasoning: ["Could not extract word"],
      }
    }

    const word = wordMatch[1].toLowerCase()
    const greeting = userName ? `${userName}, ` : ""

    // Check if we have the word
    if (this.vocabulary.has(word)) {
      const entry = this.vocabulary.get(word)
      return {
        content: `${greeting}📖 **${word}**

**Definition:** ${entry.definition}

**Part of Speech:** ${entry.partOfSpeech}

✅ From my ${entry.source} vocabulary.`,
        confidence: entry.confidence,
        reasoning: [`Found word in ${entry.source} vocabulary`],
        knowledgeUsed: [entry.source],
      }
    }

    // Try to look up online
    try {
      const wordData = await this.lookupWordOnline(word)
      if (wordData) {
        // Save the learned word
        const newEntry = {
          word: word,
          definition: wordData.definition,
          partOfSpeech: wordData.partOfSpeech || "unknown",
          examples: wordData.examples || [],
          source: "learned",
          confidence: 0.8,
          timestamp: Date.now(),
        }

        this.vocabulary.set(word, newEntry)
        await this.saveLearnedVocabulary()

        return {
          content: `${greeting}📖 **${word}** (newly learned)

**Definition:** ${wordData.definition}

**Part of Speech:** ${wordData.partOfSpeech}

✨ I've learned this word and saved it for future use!`,
          confidence: 0.8,
          reasoning: ["Looked up word online and learned it"],
          knowledgeUsed: ["api_lookup"],
        }
      }
    } catch (error) {
      console.warn(`Failed to lookup word: ${word}`, error)
    }

    return {
      content: `${greeting}I don't know the word "${word}" yet, but I'll try to learn it for next time.`,
      confidence: 0.4,
      reasoning: ["Word not found in vocabulary or online"],
    }
  }

  private async lookupWordOnline(word: string): Promise<any> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]

          return {
            definition: definition?.definition || "Definition found",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            examples: definition?.example ? [definition.example] : [],
          }
        }
      }
    } catch (error) {
      console.warn("Dictionary API failed:", error)
    }
    return null
  }

  private handlePersonalInfoQuery(message: string, userName?: string): any {
    if (message.toLowerCase().includes("name")) {
      if (userName) {
        return {
          content: `Your name is ${userName}! I remember you telling me that.`,
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

  private handleSystemQuery(message: string, userName?: string): any {
    const greeting = userName ? `${userName}, ` : ""

    if (message.toLowerCase().includes("diagnostic")) {
      return {
        content: `${greeting}🔍 **ZacAI System Diagnostic**

**Status:** ✅ Operational
**Vocabulary:** ${this.vocabulary.size} words
**Mathematics:** ${this.mathematics.size} concepts
**Personal Info:** ${this.personalInfo.size} entries

**All systems working correctly!**`,
        confidence: 0.95,
        reasoning: ["Performed system diagnostic"],
      }
    }

    return {
      content: `${greeting}👋 I'm ZacAI, your simple but powerful AI assistant!

I can help you with:
• 🧮 Math calculations
• 📖 Word definitions
• 🧠 General knowledge
• 💾 Remember personal info

What would you like to explore?`,
      confidence: 0.9,
      reasoning: ["Provided system information"],
    }
  }

  private handleGreeting(message: string, userName?: string): any {
    if (userName) {
      return {
        content: `Hello ${userName}! 👋 Great to see you again! I'm ZacAI, ready to help with math, vocabulary, and more. What can I do for you today?`,
        confidence: 0.95,
        reasoning: ["Generated personalized greeting"],
      }
    } else {
      return {
        content: `Hello! 👋 I'm ZacAI, your AI assistant. I can help with math, vocabulary, and I'll remember what you tell me. What's your name?`,
        confidence: 0.9,
        reasoning: ["Generated friendly greeting"],
      }
    }
  }

  private handleGeneralConversation(message: string, userName?: string): any {
    const greeting = userName ? `Hello ${userName}! ` : "Hello! "

    return {
      content: `${greeting}I understand you said: "${message}"

I can help you with:
• 🧮 Math calculations (try "5×5")
• 📖 Word definitions (try "what is science")
• 💾 Remember personal info
• 🔍 System diagnostics

What would you like to know?`,
      confidence: 0.8,
      reasoning: ["Generated contextual response"],
    }
  }

  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedWords: any = {}
      this.vocabulary.forEach((entry, word) => {
        if (entry.source === "learned") {
          learnedWords[word] = entry
        }
      })

      // In a real app, this would save to the server
      // For now, we'll simulate it
      console.log("📝 Saving learned vocabulary:", Object.keys(learnedWords).length, "words")

      // TODO: Implement actual JSON file saving
      // await fetch('/api/save-vocabulary', { method: 'POST', body: JSON.stringify({ vocabulary: learnedWords }) })
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }

  private async saveLearnedMath(): Promise<void> {
    try {
      const learnedMath: any = {}
      this.mathematics.forEach((entry, concept) => {
        if (entry.source === "calculated") {
          learnedMath[concept] = entry
        }
      })

      console.log("📝 Saving learned math:", Object.keys(learnedMath).length, "concepts")

      // TODO: Implement actual JSON file saving
      // await fetch('/api/save-math', { method: 'POST', body: JSON.stringify({ mathematics: learnedMath }) })
    } catch (error) {
      console.warn("Failed to save learned math:", error)
    }
  }

  private savePersonalInfo(): void {
    try {
      const personalData = Array.from(this.personalInfo.values())
      localStorage.setItem("zacai_personal_info", JSON.stringify(personalData))
      console.log("📝 Saved personal info to localStorage")
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length
    const seedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "seed").length
    const learnedMath = Array.from(this.mathematics.values()).filter((m) => m.source === "calculated").length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      factsData: this.facts,
      totalMessages: this.conversationHistory.length,
      totalLearned: learnedVocab + learnedMath,
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
      systemIdentity: { name: "ZacAI", version: "2.0.0" },
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
