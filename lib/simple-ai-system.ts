import { loadSeedData, loadLearnedData, saveLearnedData, fetchDictionaryAPI } from "./knowledge-manager"

interface MemoryEntry {
  value: any
  timestamp: number
  importance: number
}

export class SimpleAISystem {
  private seedVocabulary: Map<string, any> = new Map()
  private learnedVocabulary: Map<string, any> = new Map()
  private seedMath: Map<string, any> = new Map()
  private learnedMath: Map<string, any> = new Map()
  private personalInfo: Map<string, MemoryEntry> = new Map()
  private facts: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private systemIdentity: any = {}
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    console.log("SimpleAISystem: Initializing...")
    try {
      ;[this.seedVocabulary, this.learnedVocabulary, this.seedMath, this.learnedMath, this.systemIdentity] =
        await Promise.all([
          loadSeedData("seed_vocab.json", "words"),
          loadLearnedData("learnt_vocab.json"),
          loadSeedData("seed_maths.json", "patterns"),
          loadLearnedData("learnt_maths.json"),
          loadSeedData("seed_system.json", "identity").then((data) => data.get("ZacAI") || {}),
        ])

      this.isInitialized = true
      console.log("SimpleAISystem: Initialization complete.")
    } catch (error) {
      console.error("SimpleAISystem: Initialization failed", error)
      throw error
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
    let responseText = "I'm not sure how to respond to that."
    let knowledgeUsed: string[] = []
    let confidence = 0.5
    let mathAnalysis: any = null

    const isMath =
      lowerCaseMessage.includes("calculate") || lowerCaseMessage.includes("what is") || /\d/.test(lowerCaseMessage)
    const isVocab = lowerCaseMessage.startsWith("what is the meaning of") || lowerCaseMessage.startsWith("define")
    const isMemory = lowerCaseMessage.startsWith("my name is") || lowerCaseMessage.startsWith("remember that")
    const isDiagnostic = lowerCaseMessage.includes("self diagnostic")

    if (isDiagnostic) {
      thinkingSteps.push("✅ Intent Recognized: System Diagnostic.")
      const result = this._handleDiagnostic(thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = 1.0
    } else if (isVocab) {
      thinkingSteps.push("✅ Intent Recognized: Vocabulary Lookup.")
      const word = lowerCaseMessage.replace("what is the meaning of", "").replace("define", "").trim()
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
      thinkingSteps.push("✅ Intent Recognized: Memory Storage.")
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

    // Simple calculation: "calculate 2 + 2"
    const calcMatch = message.match(/(calculate|what is)\s*([0-9\s+\-*/$$$$]+)/)
    if (calcMatch && calcMatch[2]) {
      const expression = calcMatch[2].trim()
      thinkingSteps.push(`🔍 Evaluating simple expression: "${expression}"`)
      try {
        // WARNING: Using eval is unsafe. This is for demonstration only.
        // In a real app, use a math parsing library like math.js
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

    // Tesla/Vortex Math
    const teslaMatch = message.match(/tesla.* for (\d+)/)
    if (teslaMatch && teslaMatch[1]) {
      const num = Number.parseInt(teslaMatch[1], 10)
      thinkingSteps.push(`🌀 Performing Tesla/Vortex analysis for number: ${num}`)
      let current = num
      while (current > 9) {
        current = String(current)
          .split("")
          .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0)
      }
      responseText = `The digital root (Tesla pattern) for ${num} is ${current}.`
      knowledge = ["Vortex Math", "Digital Root"]
      mathAnalysis = { operation: "Digital Root", input: num, result: current, confidence: 1.0, seedDataUsed: true }
      confidence = 1.0
      thinkingSteps.push(`✅ Digital root found: ${current}.`)
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    thinkingSteps.push("⚠️ No specific math operation found.")
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
    if (this.seedVocabulary.has(word)) {
      const entry = this.seedVocabulary.get(word)
      responseText = `From my initial knowledge, "${word}" means: ${entry.definition}`
      knowledge = ["Seed Vocabulary"]
      confidence = 1.0
      thinkingSteps.push(`✅ Found in seed data.`)
      return { responseText, knowledge, confidence }
    }

    thinkingSteps.push("🧠 Checking learned vocabulary...")
    if (this.learnedVocabulary.has(word)) {
      const entry = this.learnedVocabulary.get(word)
      responseText = `I learned that "${word}" means: ${entry.definition}`
      knowledge = ["Learned Vocabulary"]
      confidence = 0.9
      thinkingSteps.push(`✅ Found in learned data.`)
      return { responseText, knowledge, confidence }
    }

    thinkingSteps.push(`🌐 Word not found locally. Querying external dictionary API...`)
    try {
      const apiData = await fetchDictionaryAPI(word)
      if (apiData && apiData.definition) {
        responseText = `According to my sources, "${word}" means: ${apiData.definition}`
        knowledge = ["Dictionary API"]
        confidence = 0.95
        thinkingSteps.push(`✅ API lookup successful.`)

        // Learn the new word
        thinkingSteps.push(`✍️ Learning new word and saving to memory...`)
        this.learnedVocabulary.set(word, {
          ...apiData,
          source: "Dictionary API",
          timestamp: Date.now(),
        })
        await saveLearnedData("learnt_vocab.json", this.learnedVocabulary)
        thinkingSteps.push(`💾 Save successful.`)
      } else {
        thinkingSteps.push(`❌ API did not return a definition.`)
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
      this.personalInfo.set("userName", { value: name, timestamp: Date.now(), importance: 0.9 })
      responseText = `Nice to meet you, ${name}! I'll remember that.`
      thinkingSteps.push(`👤 Storing user name: "${name}".`)
    }

    const rememberMatch = message.match(/remember that (.*)/i)
    if (rememberMatch && rememberMatch[1]) {
      const fact = rememberMatch[1].trim()
      const key = `user_fact_${Date.now()}`
      this.personalInfo.set(key, { value: fact, timestamp: Date.now(), importance: 0.7 })
      responseText = `Okay, I've stored that information.`
      thinkingSteps.push(`ℹ️ Storing user fact: "${fact}".`)
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
- **Version:** ${this.systemIdentity.version || "2.0.0"}
- **Vocabulary:** ${stats.vocabularySize} entries (${stats.breakdown.seedVocab} seed, ${stats.breakdown.learnedVocab} learned)
- **Math:** ${stats.mathFunctions} patterns (${stats.breakdown.seedMath} seed, ${stats.breakdown.learnedMath} learned)
- **Conversations:** ${stats.totalMessages} messages in history.
- **User Memory:** ${stats.memoryEntries} entries.
    `
    thinkingSteps.push("✅ Report generated.")
    return { responseText, knowledge: ["System Diagnostic"] }
  }

  public getStats() {
    const seedVocab = this.seedVocabulary.size
    const learnedVocab = this.learnedVocabulary.size
    const seedMath = this.seedMath.size
    const learnedMath = this.learnedMath.size

    return {
      vocabularySize: seedVocab + learnedVocab,
      mathFunctions: seedMath + learnedMath,
      memoryEntries: this.personalInfo.size,
      factsData: this.facts,
      totalMessages: this.conversationHistory.length,
      totalLearned: learnedVocab + learnedMath + this.personalInfo.size,
      systemStatus: this.isInitialized ? "Operational" : "Initializing",
      avgConfidence: 0.85, // Placeholder
      breakdown: {
        seedVocab,
        learnedVocab,
        seedMath,
        learnedMath,
      },
    }
  }

  public getConversationHistory() {
    return this.conversationHistory
  }

  public getSystemDebugInfo() {
    return {
      systemIdentity: this.systemIdentity,
      isInitialized: this.isInitialized,
      vocabSize: this.seedVocabulary.size + this.learnedVocabulary.size,
      mathSize: this.seedMath.size + this.learnedMath.size,
    }
  }

  public exportData() {
    return {
      seedVocabulary: Object.fromEntries(this.seedVocabulary),
      learnedVocabulary: Object.fromEntries(this.learnedVocabulary),
      seedMath: Object.fromEntries(this.seedMath),
      learnedMath: Object.fromEntries(this.learnedMath),
      personalInfo: Object.fromEntries(this.personalInfo),
      conversationHistory: this.conversationHistory,
    }
  }
}
