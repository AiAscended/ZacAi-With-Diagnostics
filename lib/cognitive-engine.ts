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
    this.loadPersonalInfo()
    this.isInitialized = true
    console.log("✅ Cognitive Engine ready!")
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

    // --- High-Level Intent Recognition ---
    thinkingSteps.push("🔍 Determining user intent...")
    const isMath =
      /\b(calculate|what is|tesla|vortex)\b/i.test(lowerCaseMessage) ||
      /[\d\s]+[+\-*/x×÷^]+[\d\s]+/.test(lowerCaseMessage)
    const isVocab = /\b(define|what is the meaning of|what does)\b/i.test(lowerCaseMessage)
    const isMemory = /\b(my name is|remember that|what is my name)\b/i.test(lowerCaseMessage)
    const isDiagnostic = /\b(self diagnostic|status report)\b/i.test(lowerCaseMessage)

    if (isDiagnostic) {
      thinkingSteps.push("✅ Intent Recognized: System Diagnostic. Delegating to Diagnostic Handler.")
      const result = this._handleDiagnostic(thinkingSteps)
      responseText = result.responseText
      knowledgeUsed = result.knowledge
      confidence = 1.0
    } else if (isVocab) {
      thinkingSteps.push("✅ Intent Recognized: Vocabulary Lookup. Delegating to Vocabulary Module.")
      const word = lowerCaseMessage.replace(/\b(define|what is the meaning of|what does)\b/i, "").trim()
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
      thinkingSteps.push("✅ Intent Recognized: Memory Storage/Retrieval. Delegating to Memory Handler.")
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

  private _handleMemory(message: string, thinkingSteps: string[]): { responseText: string; knowledge: string[] } {
    thinkingSteps.push("✍️ Entering Memory Handler.")
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
    thinkingSteps.push("📊 Compiling statistics from all modules...")
    const responseText = `
**System Diagnostic Report**
- **Status:** ${stats.systemStatus}
- **Version:** 2.1.0 (Modular)
- **Vocabulary:** ${stats.vocabularySize} entries (${stats.breakdown.seedVocab} seed, ${stats.breakdown.learnedVocab} learned)
- **Math:** ${stats.mathFunctions} patterns
- **Conversations:** ${stats.totalMessages} messages in history.
- **User Memory:** ${stats.memoryEntries} entries.
   `
    thinkingSteps.push("✅ Report generated.")
    return { responseText, knowledge: ["System Diagnostic"] }
  }

  private loadPersonalInfo(): void {
    try {
      const stored = localStorage.getItem("zacai_personal_info")
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((entry: any) => this.personalInfo.set(entry.key, entry))
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
    }
  }

  private savePersonalInfo(): void {
    try {
      localStorage.setItem("zacai_personal_info", JSON.stringify(Array.from(this.personalInfo.values())))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  public getStats(): any {
    const vocabData = this.vocabularyModule.getVocabularyData()
    const mathData = this.mathematicsModule.getMathData()

    const seedVocab = Array.from(vocabData.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(vocabData.values()).filter((v) => v.source === "learned").length

    return {
      vocabularySize: vocabData.size,
      mathFunctions: mathData.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      systemStatus: "ready",
      vocabularyData: vocabData,
      mathFunctionsData: mathData,
      personalInfoData: this.personalInfo,
      breakdown: {
        seedVocab,
        learnedVocab,
      },
    }
  }

  public getConversationHistory(): any[] {
    return this.conversationHistory
  }
}
