"use client"

export class ZacAI {
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private isInitialized = false
  private systemIdentity = {
    name: "ZacAI",
    version: "1.0.0",
    purpose: "A simple, effective AI assistant",
  }

  constructor() {
    console.log("🤖 ZacAI starting...")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 Initializing ZacAI...")

    try {
      // Load seed vocabulary (432 words)
      await this.loadSeedVocabulary()

      // Load seed mathematics
      await this.loadSeedMathematics()

      // Load system identity
      await this.loadSystemIdentity()

      // Load personal info from localStorage
      this.loadPersonalInfo()

      this.isInitialized = true
      console.log(`✅ ZacAI ready! Vocabulary: ${this.vocabulary.size} words`)
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
            partOfSpeech: entry.part_of_speech || "unknown",
            examples: entry.examples || [],
            source: "seed",
            confidence: 0.9,
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} vocabulary words`)
      }
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
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
        console.log(`✅ Loaded mathematics data`)
      }
    } catch (error) {
      console.warn("Failed to load mathematics:", error)
    }
  }

  private async loadSystemIdentity(): Promise<void> {
    try {
      const response = await fetch("/seed_system.json")
      if (response.ok) {
        const data = await response.json()
        if (data.identity) {
          this.systemIdentity = {
            ...this.systemIdentity,
            ...data.identity,
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load system identity:", error)
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
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🤖 Processing:", userMessage)

    // Extract and store personal info immediately
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
    return /who are you|what are you|your name/i.test(message)
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

      const greeting = userName ? `${userName}, ` : ""
      return {
        content: `${greeting}🧮 **${a} ${op} ${b} = ${result}**\n\nCalculation completed!`,
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
        content: `${greeting}📖 **${word}**\n\n**Definition:** ${entry.definition}\n\n**Part of Speech:** ${entry.partOfSpeech}\n\n✅ From my vocabulary.`,
        confidence: entry.confidence,
        reasoning: [`Found word in vocabulary`],
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

        return {
          content: `${greeting}📖 **${word}** (newly learned)\n\n**Definition:** ${wordData.definition}\n\n**Part of Speech:** ${wordData.partOfSpeech}\n\n✨ I've learned this word!`,
          confidence: 0.8,
          reasoning: ["Looked up word online and learned it"],
        }
      }
    } catch (error) {
      console.warn(`Failed to lookup word: ${word}`, error)
    }

    return {
      content: `${greeting}I don't know the word "${word}" yet.`,
      confidence: 0.4,
      reasoning: ["Word not found"],
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
          reasoning: ["Retrieved name from memory"],
        }
      } else {
        return {
          content: "I don't think you've told me your name yet. What's your name?",
          confidence: 0.8,
          reasoning: ["No name stored"],
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
        reasoning: ["Retrieved personal information"],
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

    return {
      content: `${greeting}👋 I'm ${this.systemIdentity.name}, ${this.systemIdentity.purpose}!\n\nI can help you with:\n• 🧮 Math calculations\n• 📖 Word definitions\n• 💾 Remember personal info\n\nWhat would you like to explore?`,
      confidence: 0.9,
      reasoning: ["Provided system information"],
    }
  }

  private handleGreeting(message: string, userName?: string): any {
    if (userName) {
      return {
        content: `Hello ${userName}! 👋 Great to see you again! I'm ${this.systemIdentity.name}, ready to help. What can I do for you today?`,
        confidence: 0.95,
        reasoning: ["Generated personalized greeting"],
      }
    } else {
      return {
        content: `Hello! 👋 I'm ${this.systemIdentity.name}, your AI assistant. I can help with math, vocabulary, and I'll remember what you tell me. What's your name?`,
        confidence: 0.9,
        reasoning: ["Generated friendly greeting"],
      }
    }
  }

  private handleGeneralConversation(message: string, userName?: string): any {
    const greeting = userName ? `Hello ${userName}! ` : "Hello! "

    return {
      content: `${greeting}I understand you said: "${message}"\n\nI can help you with:\n• 🧮 Math calculations (try "5×5")\n• 📖 Word definitions (try "what is science")\n• 💾 Remember personal info\n\nWhat would you like to know?`,
      confidence: 0.8,
      reasoning: ["Generated contextual response"],
    }
  }

  private savePersonalInfo(): void {
    try {
      const personalData = Array.from(this.personalInfo.values())
      localStorage.setItem("zacai_personal_info", JSON.stringify(personalData))
      console.log("📝 Saved personal info")
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      totalLearned: learnedVocab,
      systemStatus: "ready",
      avgConfidence: 0.85,
      breakdown: {
        seedVocab,
        learnedVocab,
      },
    }
  }

  public getConversationHistory(): any[] {
    return this.conversationHistory
  }

  public getSystemDebugInfo(): any {
    return {
      systemIdentity: this.systemIdentity,
      isInitialized: this.isInitialized,
      vocabularySize: this.vocabulary.size,
      mathSize: this.mathematics.size,
      personalInfoSize: this.personalInfo.size,
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      exportTimestamp: Date.now(),
    }
  }
}
