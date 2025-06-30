import { VocabularyModule } from "./modules/vocabulary"
import { MathematicsModule } from "./modules/mathematics"

export class CognitiveEngine {
  private vocabularyModule: VocabularyModule
  private mathematicsModule: MathematicsModule
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private isInitialized = false

  constructor() {
    console.log("🚀 Starting Cognitive Engine...")
    this.vocabularyModule = new VocabularyModule()
    this.mathematicsModule = new MathematicsModule()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("⚙️ Initializing all cognitive modules...")
    await Promise.all([this.vocabularyModule.initialize(), this.mathematicsModule.initialize()])
    this.isInitialized = true
    console.log("✅ Cognitive Engine ready!")
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const thinkingSteps: string[] = [`🧠 Analyzing input: "${userMessage}"`]
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

    thinkingSteps.push("🔍 Determining user intent...")
    const isMath = /(calculate|what is|what's|tesla|vortex|[\d\s]+[+\-*/x×÷^]+[\d\s]+)/i.test(lowerCaseMessage)
    const isVocab = /(define|what is the meaning of|what does.*mean)/i.test(lowerCaseMessage)
    const isMemory = /(my name is|remember that|what is my name)/i.test(lowerCaseMessage)
    const isDiagnostic = /(self diagnostic|status report)/i.test(lowerCaseMessage)

    if (isDiagnostic) {
      thinkingSteps.push("✅ Intent Recognized: System Diagnostic.")
      const result = this._handleDiagnostic(thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = 1.0
    } else if (isVocab) {
      thinkingSteps.push("✅ Intent Recognized: Vocabulary Lookup. Delegating to Vocabulary Module.")
      const word = lowerCaseMessage.replace(/(define|what is the meaning of|what does|mean)/gi, "").trim()
      const result = await this.vocabularyModule.handleLookup(word, thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = result.confidence
    } else if (isMath) {
      thinkingSteps.push("✅ Intent Recognized: Mathematical Calculation. Delegating to Mathematics Module.")
      const result = this.mathematicsModule.handleCalculation(lowerCaseMessage, thinkingSteps)
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
    }

    thinkingSteps.push("✨ Finalizing response.")
    const response = { content: responseText, confidence, knowledgeUsed, reasoning: thinkingSteps, mathAnalysis }
    this.conversationHistory.push({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      ...response,
      timestamp: Date.now(),
    })
    return response
  }

  private _handleMemory(message: string, thinkingSteps: string[]): { responseText: string; knowledge: string[] } {
    const nameMatch = message.match(/my name is (.*)/i)
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim()
      this.personalInfo.set("userName", { value: name, timestamp: Date.now() })
      thinkingSteps.push(`👤 Storing user name: "${name}".`)
      return { responseText: `Nice to meet you, ${name}! I'll remember that.`, knowledge: ["Memory System"] }
    }
    // Add other memory handlers here
    return { responseText: "I will try to remember that.", knowledge: ["Memory System"] }
  }

  private _handleDiagnostic(thinkingSteps: string[]): { responseText: string; knowledge: string[] } {
    const stats = this.getStats()
    thinkingSteps.push("📊 Compiling statistics from all modules...")
    return {
      responseText: `**System Diagnostic Report**\n- **Status:** ${stats.systemStatus}\n- **Version:** 3.0.0 (Modular)\n- **Vocabulary:** ${stats.vocabularySize} entries\n- **Math:** ${stats.mathFunctions} patterns`,
      knowledge: ["System Diagnostic"],
    }
  }

  public getSystemDebugInfo() {
    return { systemIdentity: { name: "ZacAI (Modular)", version: "3.0.0" } }
  }

  public getStats() {
    const vocabData = this.vocabularyModule.getVocabularyData()
    const mathData = this.mathematicsModule.getMathData()
    const seedVocab = Array.from(vocabData.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(vocabData.values()).filter((v) => v.source === "learned").length
    return {
      vocabularySize: vocabData.size,
      mathFunctions: mathData.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      systemStatus: "Ready",
      avgConfidence: 0.85,
      vocabularyData: vocabData,
      mathFunctionsData: mathData,
      personalInfoData: this.personalInfo,
      factsData: new Map(), // Placeholder for now
      breakdown: { seedVocab, learnedVocab, seedMath: mathData.size, learnedMath: 0 },
    }
  }

  public getConversationHistory() {
    return this.conversationHistory
  }

  public exportData() {
    return {
      conversationHistory: this.conversationHistory,
      vocabulary: Object.fromEntries(this.vocabularyModule.getVocabularyData()),
      mathematics: Object.fromEntries(this.mathematicsModule.getMathData()),
      personalInfo: Object.fromEntries(this.personalInfo),
    }
  }
}
