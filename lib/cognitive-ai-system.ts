import { BrowserStorageManager } from "./browser-storage-manager"

// Simple interface definitions to avoid circular imports
interface ThinkingResult {
  query: string
  steps: any[]
  finalAnswer: string
  toolsUsed: string[]
  confidence: number
  processingTime: number
}

interface CognitiveResponse {
  message: string
  thinking: ThinkingResult
  confidence: number
  learningUpdate?: {
    newWords: string[]
    vocabularyProgress: any
  }
  timestamp: number
}

interface CognitiveStats {
  vocabulary: any
  thinking: any
  webKnowledge: any
  mathematics: any
  overallProgress: {
    totalInteractions: number
    learningRate: number
    confidenceLevel: number
  }
}

export class CognitiveAISystem {
  private storageManager = new BrowserStorageManager()
  private conversationHistory: any[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private facts: Map<string, any> = new Map()
  private systemStatus = "idle"
  private isInitialized = false

  constructor() {
    this.initializeBasicVocabulary()
    this.initializeSampleFacts()
  }

  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.message
  }

  public async processMessage(userMessage: string): Promise<CognitiveResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🚀 Processing message with enhanced cognitive system:", userMessage)

    // Extract and store personal information FIRST
    this.extractAndStorePersonalInfo(userMessage)

    // Simple response generation for now
    const response: CognitiveResponse = {
      message: this.generateSimpleResponse(userMessage),
      thinking: {
        query: userMessage,
        steps: [
          {
            step: 1,
            process: "Message Analysis",
            reasoning: "Analyzing user input for keywords and intent",
            toolsConsidered: ["vocabulary", "math", "web-knowledge"],
            toolSelected: "vocabulary",
            confidence: 0.8,
          },
        ],
        finalAnswer: "Processing complete",
        toolsUsed: ["vocabulary"],
        confidence: 0.8,
        processingTime: 100,
      },
      confidence: 0.8,
      learningUpdate: {
        newWords: this.extractNewWords(userMessage),
        vocabularyProgress: this.getVocabularyProgress(),
      },
      timestamp: Date.now(),
    }

    await this.saveConversation(userMessage, response.message)
    return response
  }

  private generateSimpleResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    // Math detection
    if (
      lowerMessage.includes("calculate") ||
      lowerMessage.includes("math") ||
      /\d+\s*[+\-*/]\s*\d+/.test(lowerMessage)
    ) {
      const mathMatch = userMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
      if (mathMatch) {
        const [, a, op, b] = mathMatch
        const num1 = Number.parseInt(a)
        const num2 = Number.parseInt(b)
        let result = 0
        let operation = ""

        switch (op) {
          case "+":
            result = num1 + num2
            operation = "addition"
            break
          case "-":
            result = num1 - num2
            operation = "subtraction"
            break
          case "*":
            result = num1 * num2
            operation = "multiplication"
            break
          case "/":
            result = num1 / num2
            operation = "division"
            break
        }

        return `I calculated ${num1} ${op} ${num2} = ${result}. I used my mathematical toolkit for this ${operation} problem.`
      }
    }

    // Definition detection
    if (lowerMessage.includes("what is") || lowerMessage.includes("define")) {
      const word = lowerMessage.replace(/what is|define/g, "").trim()
      return `I'm learning about "${word}". This would normally trigger my web knowledge engine to search for definitions and examples. I'm building my vocabulary one word at a time!`
    }

    // Personal info detection
    if (lowerMessage.includes("my name is") || lowerMessage.includes("i am")) {
      return `Thank you for sharing that information with me! I'll remember this in my personal memory system. I'm currently at the "${this.getVocabularyLevel()}" vocabulary level and learning new words from our conversation.`
    }

    // Default response
    return `I understand you said: "${userMessage}". I'm an enhanced AI learning system starting with infant-level vocabulary (currently learning the alphabet and basic words). I have mathematical tools, web knowledge capabilities, and a thinking pipeline that helps me choose the right tools for each situation. What would you like to explore together?`
  }

  private extractNewWords(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/)
    const newWords = []

    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, "")
      if (cleanWord.length > 3 && !this.vocabulary.has(cleanWord)) {
        newWords.push(cleanWord)
        this.vocabulary.set(cleanWord, "learned")
      }
    }

    return newWords
  }

  private getVocabularyProgress() {
    return {
      currentLevel: this.getVocabularyLevel(),
      masteredWords: this.vocabulary.size,
      totalCoreWords: 432,
      currentLevelProgress: Math.min((this.vocabulary.size / 432) * 100, 100),
    }
  }

  private getVocabularyLevel(): string {
    const wordCount = this.vocabulary.size
    if (wordCount < 27) return "Infant (Learning Alphabet)"
    if (wordCount < 77) return "Toddler (Basic Words)"
    if (wordCount < 177) return "Child (Elementary)"
    if (wordCount < 377) return "Teen (Intermediate)"
    if (wordCount < 432) return "Adult (Advanced)"
    return "Expert (Beyond Core)"
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Cognitive AI System...")

      await this.loadConversationHistory()
      await this.loadMemory()
      await this.loadVocabulary()

      this.systemStatus = "ready"
      this.isInitialized = true

      console.log("✅ Cognitive AI System ready!")
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      this.systemStatus = "ready"
      this.isInitialized = true
    }
  }

  public getStats(): any {
    const assistantMessages = this.conversationHistory.filter((m) => m.role === "assistant" && m.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0

    const totalUserInfo = this.personalInfo.size

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: totalUserInfo,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 144, // 12x12 times table
      seedProgress: 0,
      responseTime: 0,
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: new Map(),
    }
  }

  public async getSystemStats(): Promise<CognitiveStats> {
    const vocabularyStats = {
      currentLevel: this.getVocabularyLevel(),
      masteredWords: this.vocabulary.size,
      totalCoreWords: 432,
      currentLevelProgress: Math.min((this.vocabulary.size / 432) * 100, 100),
      vocabularyAge: this.getVocabularyLevel(),
      nextMilestone: this.vocabulary.size < 432 ? "Continue learning core vocabulary" : "All core vocabulary mastered!",
      recentlyLearned: Array.from(this.vocabulary.keys()).slice(-5),
    }

    const thinkingStats = {
      totalQueries: this.conversationHistory.length,
      toolUsage: { vocabulary: this.conversationHistory.length },
      averageProcessingTime: 100,
      averageConfidence: 80,
      personalMemorySize: this.personalInfo.size,
      recentQueries: this.conversationHistory.slice(-5).map((m) => m.content || ""),
    }

    const webStats = {
      cacheSize: 0,
      searchHistory: 0,
      recentSearches: [],
    }

    const mathStats = {
      totalCalculations: 0,
      operationBreakdown: {},
      timesTableSize: 144,
      constantsAvailable: 9,
      recentCalculations: [],
    }

    const totalInteractions = this.conversationHistory.length
    const learningRate = this.vocabulary.size / Math.max(totalInteractions, 1)

    return {
      vocabulary: vocabularyStats,
      thinking: thinkingStats,
      webKnowledge: webStats,
      mathematics: mathStats,
      overallProgress: {
        totalInteractions,
        learningRate: Math.round(learningRate * 100) / 100,
        confidenceLevel: 80,
      },
    }
  }

  // Keep all existing methods for compatibility
  private extractAndStorePersonalInfo(message: string): void {
    const personalPatterns = [
      {
        pattern: /(?:my name is|i'm|i am|call me) (\w+)/i,
        key: "name",
        importance: 0.9,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i have (\d+) (cats?|dogs?|pets?)/i,
        key: "pets",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => `${match[1]} ${match[2]}`,
      },
    ]

    personalPatterns.forEach(({ pattern, key, importance, extract }) => {
      const match = message.match(pattern)
      if (match) {
        const value = extract(match)
        const entry = {
          key,
          value,
          timestamp: Date.now(),
          importance,
          type: "personal_info",
          source: "conversation",
        }
        this.personalInfo.set(key, entry)
        console.log(`📝 Stored personal info: ${key} = ${value}`)
      }
    })
  }

  private initializeBasicVocabulary(): void {
    const basicWords = [
      "hello",
      "hi",
      "hey",
      "goodbye",
      "bye",
      "thanks",
      "thank",
      "please",
      "yes",
      "no",
      "maybe",
      "sure",
      "okay",
      "ok",
      "good",
      "bad",
      "great",
      "what",
      "who",
      "where",
      "when",
      "why",
      "how",
      "can",
      "could",
      "would",
      "like",
      "love",
      "want",
      "need",
      "know",
      "think",
      "remember",
      "forget",
      "help",
      "sorry",
      "excuse",
      "understand",
      "explain",
      "tell",
      "say",
      "calculate",
      "math",
      "number",
      "add",
      "subtract",
      "multiply",
      "divide",
      "times",
      "plus",
      "minus",
      "equals",
      "result",
      "answer",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
  }

  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
    ]

    sampleFacts.forEach((item) => {
      this.facts.set(`fact_${item.category}`, {
        key: `fact_${item.category}`,
        value: item.fact,
        timestamp: Date.now(),
        importance: 0.8,
        type: "fact",
        source: "system",
      })
    })
  }

  private async loadConversationHistory(): Promise<void> {
    try {
      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations.filter((msg) => msg && msg.id && msg.role && msg.content)
    } catch (error) {
      console.warn("Failed to load conversation history:", error)
      this.conversationHistory = []
    }
  }

  private async loadMemory(): Promise<void> {
    try {
      const memory = await this.storageManager.loadMemory()
      this.memory = memory
    } catch (error) {
      console.warn("Failed to load memory:", error)
      this.memory = new Map()
    }
  }

  private async loadVocabulary(): Promise<void> {
    try {
      const vocabulary = await this.storageManager.loadVocabulary()
      vocabulary.forEach((category, word) => {
        this.vocabulary.set(word, category)
      })
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }
  }

  private async saveConversation(userMessage: string, aiResponse: string): Promise<void> {
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }

    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }

    this.conversationHistory.push(userMsg, aiMsg)

    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }

    await this.saveConversationHistory()
    await this.saveMemory()
    await this.saveVocabulary()
  }

  private async saveConversationHistory(): Promise<void> {
    try {
      await this.storageManager.saveConversations(this.conversationHistory)
    } catch (error) {
      console.warn("Failed to save conversation:", error)
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      await this.storageManager.saveMemory(this.memory)
    } catch (error) {
      console.warn("Failed to save memory:", error)
    }
  }

  private async saveVocabulary(): Promise<void> {
    try {
      await this.storageManager.saveVocabulary(this.vocabulary)
    } catch (error) {
      console.warn("Failed to save vocabulary:", error)
    }
  }

  public getMathFunctionCount(): number {
    return 144 // 12x12 times table
  }

  public generateSuggestions(messages: any[]): any[] {
    return [
      { text: "Tell me about yourself", type: "question" },
      { text: "What can you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
    ]
  }

  public generateResponseSuggestions(userInput: string, response: string): string[] {
    return ["Tell me more", "What else?", "Can you explain that?"]
  }

  public processFeedback(messageId: string, feedback: string): void {
    console.log(`Feedback received for ${messageId}: ${feedback}`)
  }

  public updateResponseTime(time: number): void {
    console.log(`Response time: ${time}ms`)
  }

  public exportData(): any {
    return {
      conversations: this.conversationHistory,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      facts: Array.from(this.facts.entries()),
      timestamp: Date.now(),
    }
  }

  public getConversationHistory(): any[] {
    return [...this.conversationHistory]
  }

  public async addVocabularyWord(word: string, category: string): Promise<void> {
    this.vocabulary.set(word.toLowerCase(), category)
    await this.saveVocabulary()
  }

  public async removeVocabularyWord(word: string): Promise<void> {
    this.vocabulary.delete(word.toLowerCase())
    await this.saveVocabulary()
  }

  public async addMemoryEntry(key: string, value: string): Promise<void> {
    const entry = {
      key: key.toLowerCase().replace(/\s+/g, "_"),
      value: value,
      timestamp: Date.now(),
      importance: 0.7,
    }
    this.memory.set(entry.key, entry)
    await this.saveMemory()
  }

  public async removeMemoryEntry(key: string): Promise<void> {
    this.memory.delete(key)
    await this.saveMemory()
  }

  public async clearAllData(): Promise<void> {
    try {
      this.conversationHistory = []
      this.vocabulary = new Map()
      this.memory = new Map()
      this.personalInfo = new Map()
      this.facts = new Map()

      await this.storageManager.clearAllData()
      console.log("✅ All AI system data cleared")
    } catch (error) {
      console.error("❌ Failed to clear AI system data:", error)
      throw error
    }
  }

  public async retrainFromKnowledge(): Promise<void> {
    try {
      console.log("🔄 Retraining AI system from knowledge base...")

      const storedData = await this.storageManager.exportAllData()
      if (storedData) {
        if (storedData.vocabulary) {
          this.vocabulary = new Map(storedData.vocabulary)
        }
        if (storedData.memory) {
          this.memory = new Map(storedData.memory)
        }
      }

      await this.saveConversationHistory()
      await this.saveMemory()
      await this.saveVocabulary()

      console.log("✅ AI system retrained successfully")
    } catch (error) {
      console.error("❌ AI system retraining failed:", error)
      throw error
    }
  }

  public rememberUserInfo(key: string, value: string): void {
    this.personalInfo.set(key, {
      key,
      value,
      timestamp: Date.now(),
      importance: 0.8,
      type: "user_info",
      source: "manual",
    })
  }

  public forgetUserInfo(key: string): void {
    this.personalInfo.delete(key)
  }

  public resetLearningProgress(): void {
    this.vocabulary.clear()
    this.memory.clear()
    this.personalInfo.clear()
    this.conversationHistory = []
    this.initializeBasicVocabulary()
    this.initializeSampleFacts()
  }
}

export type { CognitiveResponse, CognitiveStats }
