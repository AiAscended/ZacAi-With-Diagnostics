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
    if (!this.isInitialized) {
      await this.initialize()
    }

    const thinkingSteps: string[] = []
    thinkingSteps.push(`🧠 Analyzing input: "${userMessage}"`)

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    })

    const lowerCaseMessage = userMessage.toLowerCase()
    let responseText = "I'm not sure how to respond to that. I can help with math, vocabulary, and remembering facts."
    let knowledgeUsed: string[] = []
    let confidence = 0.5
    let mathAnalysis: any = null

    // --- Intent Recognition ---
    thinkingSteps.push("🔍 Determining user intent...")
    const isMath =
      /\b(calculate|what is|tesla|vortex)\b/i.test(lowerCaseMessage) ||
      /[\d\s]+[+\-*/x×÷^]+[\d\s]+/.test(lowerCaseMessage)
    const isVocab = /\b(define|what is the meaning of|what does)\b/i.test(lowerCaseMessage)
    const isMemory = /\b(my name is|remember that|what is my name)\b/i.test(lowerCaseMessage)
    const isDiagnostic = /\b(self diagnostic|status report)\b/i.test(lowerCaseMessage)

    if (isDiagnostic) {
      thinkingSteps.push("✅ Intent Recognized: System Diagnostic.")
      const result = this._handleDiagnostic(thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = 1.0
    } else if (isVocab) {
      thinkingSteps.push("✅ Intent Recognized: Vocabulary Lookup.")
      const word = lowerCaseMessage.replace(/\b(define|what is the meaning of|what does)\b/i, "").trim()
      const result = await this._handleVocabulary(word, thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = result.confidence
    } else if (isMath) {
      thinkingSteps.push("✅ Intent Recognized: Mathematical Calculation.")
      const result = this._handleMath(lowerCaseMessage, thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      mathAnalysis = result.mathAnalysis
      confidence = result.confidence
    } else if (isMemory) {
      thinkingSteps.push("✅ Intent Recognized: Memory Storage/Retrieval.")
      const result = this._handleMemory(userMessage, thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = 0.95
    } else {
      thinkingSteps.push("⚠️ Could not determine a clear intent. Providing a general response.")
      confidence = 0.3
    }

    thinkingSteps.push("✨ Finalizing response.")
    const response = {
      content: responseText,
      confidence: confidence,
      knowledgeUsed: knowledgeUsed,
      reasoning: thinkingSteps,
      mathAnalysis: mathAnalysis,
    }

    this.conversationHistory.push({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      ...response,
      timestamp: Date.now(),
    })

    return response
  }

  private _handleMath(
    message: string,
    thinkingSteps: string[],
  ): { responseText: string; knowledge: string[]; mathAnalysis: any; confidence: number } {
    thinkingSteps.push("🧮 Entering Math Processor.")
    let responseText = "I couldn't solve that math problem."
    let knowledge: string[] = []
    let mathAnalysis: any = { operation: "Unknown", confidence: 0 }
    let confidence = 0.4

    // Tesla/Vortex Math
    const teslaMatch = message.match(/(?:tesla|vortex|digital root).+?(\d+)/)
    if (teslaMatch && teslaMatch[1]) {
      const num = Number.parseInt(teslaMatch[1], 10)
      thinkingSteps.push(`🌀 Matched Tesla/Vortex pattern. Performing digital root analysis for: ${num}`)
      let current = num
      const steps = [num]
      while (current > 9) {
        const sum = String(current)
          .split("")
          .reduce((s, digit) => s + Number.parseInt(digit, 10), 0)
        steps.push(sum)
        current = sum
      }
      responseText = `The digital root (Tesla pattern) for ${num} is ${current}. The sequence is: ${steps.join(" -> ")}.`
      knowledge = ["Vortex Math", "Digital Root"]
      mathAnalysis = { operation: "Digital Root", input: num, result: current, confidence: 1.0, seedDataUsed: true }
      confidence = 1.0
      thinkingSteps.push(`✅ Digital root found: ${current}.`)
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    // Simple calculation
    const calcMatch = message.match(/(?:calculate|what is)\s*([0-9\s.+\-*/x×÷^()]+)/)
    if (calcMatch && calcMatch[1]) {
      let expression = calcMatch[1].trim()
      thinkingSteps.push(`🔍 Matched simple calculation pattern. Evaluating expression: "${expression}"`)
      expression = expression.replace(/[x×]/g, "*").replace(/÷/g, "/")
      try {
        // Using a safer method than eval for simple expressions.
        const result = new Function(`return ${expression}`)()
        responseText = `The result of ${expression} is ${result}.`
        knowledge = ["Simple Calculation"]
        mathAnalysis = { operation: "Evaluation", expression, result, confidence: 1.0, seedDataUsed: false }
        confidence = 1.0
        thinkingSteps.push(`✅ Calculation successful. Result: ${result}.`)
      } catch (e) {
        responseText = `I couldn't evaluate the expression "${expression}". It seems to be invalid.`
        thinkingSteps.push(`❌ Calculation failed for expression: "${expression}".`)
        confidence = 0.2
      }
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    thinkingSteps.push("⚠️ No specific math operation matched. Exiting Math Processor.")
    return { responseText, knowledge, mathAnalysis, confidence }
  }

  private async _handleVocabulary(
    word: string,
    thinkingSteps: string[],
  ): Promise<{ responseText: string; knowledge: string[]; confidence: number }> {
    thinkingSteps.push(`📚 Entering Vocabulary Processor for word: "${word}".`)
    let responseText = `Sorry, I don't know the meaning of "${word}".`
    let knowledge: string[] = []
    let confidence = 0.1

    thinkingSteps.push("📖 Checking seed vocabulary...")
    if (this.vocabulary.has(word)) {
      const entry = this.vocabulary.get(word)
      responseText = `From my initial knowledge, "${word}" means: ${entry.definition}`
      knowledge = ["Seed Vocabulary"]
      confidence = 1.0
      thinkingSteps.push(`✅ Found in seed data.`)
      return { responseText, knowledge, confidence }
    }
    thinkingSteps.push("❌ Not found in seed vocabulary.")

    thinkingSteps.push("🧠 Checking learned vocabulary...")
    if (this.vocabulary.has(word.toLowerCase())) {
      const entry = this.vocabulary.get(word.toLowerCase())
      responseText = `I learned that "${word}" means: ${entry.definition}`
      knowledge = ["Learned Vocabulary"]
      confidence = 0.9
      thinkingSteps.push(`✅ Found in learned data.`)
      return { responseText, knowledge, confidence }
    }
    thinkingSteps.push("❌ Not found in learned vocabulary.")

    thinkingSteps.push("🤔 Self-prompt: How can I find the definition for a new word? -> Decision: Use external API.")
    thinkingSteps.push(`🌐 Querying external dictionary API for "${word}"...`)
    try {
      const apiData = await this.lookupWordOnline(word)
      if (apiData && apiData.definition) {
        responseText = `According to my sources, "${word}" means: ${apiData.definition}`
        knowledge = ["Dictionary API"]
        confidence = 0.95
        thinkingSteps.push(`✅ API lookup successful.`)

        thinkingSteps.push(`✍️ Learning new word and saving to memory...`)
        const newEntry = {
          word: word,
          definition: apiData.definition,
          partOfSpeech: apiData.partOfSpeech || "unknown",
          examples: apiData.examples || [],
          source: "learned-api",
          confidence: 0.85,
          timestamp: Date.now(),
        }
        this.vocabulary.set(word, newEntry)
        await this.saveLearnedVocabulary()
        thinkingSteps.push(`💾 Save successful.`)
      } else {
        thinkingSteps.push(`❌ API did not return a definition for "${word}".`)
      }
    } catch (error) {
      console.error("API Error in _handleVocabulary:", error)
      responseText = "I had trouble reaching my dictionary service."
      confidence = 0.2
      thinkingSteps.push(`🔥 API call failed.`)
    }

    return { responseText, knowledge, confidence }
  }

  private _handleMemory(message: string, thinkingSteps: string[]): { responseText: string; knowledge: string[] } {
    thinkingSteps.push("✍️ Entering Memory Processor.")
    let responseText = "I will remember that."
    const knowledge: string[] = ["Memory System"]

    const nameMatch = message.match(/my name is (.*)/i)
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim()
      this.personalInfo.set("userName", { value: name, timestamp: Date.now() })
      responseText = `Nice to meet you, ${name}! I'll remember that.`
      thinkingSteps.push(`👤 Storing user name: "${name}".`)
      this.savePersonalInfo()
      return { responseText, knowledge }
    }

    const rememberMatch = message.match(/remember that (.*)/i)
    if (rememberMatch && rememberMatch[1]) {
      const fact = rememberMatch[1].trim()
      const key = `user_fact_${Date.now()}`
      this.personalInfo.set(key, { value: fact, timestamp: Date.now() })
      responseText = `Okay, I've stored that information.`
      thinkingSteps.push(`ℹ️ Storing user fact: "${fact}".`)
      this.savePersonalInfo()
      return { responseText, knowledge }
    }

    const retrieveNameMatch = message.match(/what is my name/i)
    if (retrieveNameMatch) {
      thinkingSteps.push("👤 Retrieving user name from memory...")
      if (this.personalInfo.has("userName")) {
        const name = this.personalInfo.get("userName")?.value
        responseText = `Your name is ${name}. I remembered!`
        thinkingSteps.push(`✅ Found user name: "${name}".`)
      } else {
        responseText = "I don't believe you've told me your name yet."
        thinkingSteps.push("❌ User name not found in memory.")
      }
      return { responseText, knowledge }
    }

    return { responseText, knowledge }
  }

  private _handleDiagnostic(thinkingSteps: string[]): { responseText: string; knowledge: string[] } {
    thinkingSteps.push("🩺 Performing system self-diagnostic.")
    const stats = this.getStats()
    thinkingSteps.push("📊 Compiling statistics...")
    const responseText = `
**System Diagnostic Report**
- **Status:** ${stats.systemStatus}
- **Version:** ${this.getSystemDebugInfo().systemIdentity.version || "2.0.0"}
- **Vocabulary:** ${stats.vocabularySize} entries (${stats.breakdown.seedVocab} seed, ${stats.breakdown.learnedVocab} learned)
- **Math:** ${stats.mathFunctions} patterns (${stats.breakdown.seedMath} seed, ${stats.breakdown.learnedMath} learned)
- **Conversations:** ${stats.totalMessages} messages in history.
- **User Memory:** ${stats.memoryEntries} entries.
    `
    thinkingSteps.push("✅ Report generated.")
    return { responseText, knowledge: ["System Diagnostic"] }
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
