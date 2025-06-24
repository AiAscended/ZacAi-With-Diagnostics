import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedCognitiveSystem } from "./enhanced-cognitive-system"

// UPDATED COGNITIVE AI SYSTEM - USES ENHANCED COGNITIVE ENGINE
export class CognitiveAISystem {
  private enhancedCognitive = new EnhancedCognitiveSystem()
  private mathProcessor = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()
  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private facts: Map<string, FactEntry> = new Map()
  private systemStatus = "idle"
  private isInitialized = false

  constructor() {
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
    this.initializeSampleFacts()
  }

  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🚀 Processing message with enhanced cognitive system:", userMessage)

    // Extract and store personal information FIRST
    this.extractAndStorePersonalInfo(userMessage)

    // Use enhanced cognitive processing
    const cognitiveResponse = await this.enhancedCognitive.processThought(
      userMessage,
      this.conversationHistory,
      this.personalInfo,
    )

    const response: AIResponse = {
      content: cognitiveResponse.content,
      confidence: cognitiveResponse.confidence,
      reasoning: cognitiveResponse.reasoning,
    }

    await this.saveConversation(userMessage, response.content)
    return response
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Cognitive AI System with Enhanced Engine...")

      // Initialize enhanced cognitive system
      await this.enhancedCognitive.initialize()

      await this.loadConversationHistory()
      await this.loadMemory()
      await this.loadVocabulary()

      this.systemStatus = "ready"
      this.isInitialized = true

      console.log("✅ Enhanced Cognitive AI System ready!")
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

    const totalUserInfo = this.personalInfo.size + this.memory.size

    // Get enhanced cognitive data
    const mathKnowledge = this.enhancedCognitive.getMathKnowledge()
    const factDatabase = this.enhancedCognitive.getFactDatabase()

    console.log("📊 Enhanced Stats:", {
      personalInfo: this.personalInfo.size,
      memory: this.memory.size,
      facts: factDatabase.size,
      mathKnowledge: mathKnowledge.size,
      totalUserInfo: totalUserInfo,
    })

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: totalUserInfo,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: mathKnowledge.size, // Now shows actual math knowledge
      seedProgress: 0,
      responseTime: 0,
      // Enhanced data access
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: factDatabase, // Now shows actual facts from seed data
      mathFunctionsData: mathKnowledge, // Now shows actual math knowledge
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
      {
        pattern: /i (?:have a|am married to a|married a) (wife|husband|partner)/i,
        key: "marital_status",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => `married (${match[1]})`,
      },
      {
        pattern: /(?:one is named|first one is|cat is named|dog is named) (\w+)/i,
        key: "pet_name_1",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /(?:the )?other (?:one )?is (?:named )?(\w+)/i,
        key: "pet_name_2",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i work as (?:a |an )?(.+?)(?:\.|$|,)/i,
        key: "job",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i live in (.+?)(?:\.|$|,)/i,
        key: "location",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i am (\d+) years old/i,
        key: "age",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1],
      },
    ]

    personalPatterns.forEach(({ pattern, key, importance, extract }) => {
      const match = message.match(pattern)
      if (match) {
        const value = extract(match)
        const entry: PersonalInfoEntry = {
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

  // Keep all existing methods for backward compatibility...
  private mathFunctions: Map<string, MathFunction> = new Map()

  private initializeBasicMathFunctions(): void {
    const basicMath: MathFunction[] = [
      {
        name: "add",
        description: "Addition",
        examples: ["2 + 3", "add 5 and 7"],
        func: (a: number, b: number) => a + b,
      },
      {
        name: "subtract",
        description: "Subtraction",
        examples: ["10 - 3", "subtract 4 from 9"],
        func: (a: number, b: number) => a - b,
      },
      {
        name: "multiply",
        description: "Multiplication",
        examples: ["4 * 5", "multiply 3 by 6"],
        func: (a: number, b: number) => a * b,
      },
      {
        name: "divide",
        description: "Division",
        examples: ["15 / 3", "divide 20 by 4"],
        func: (a: number, b: number) => (b !== 0 ? a / b : "Cannot divide by zero"),
      },
    ]

    basicMath.forEach((func) => this.mathFunctions.set(func.name, func))
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
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }

    const aiMsg: ChatMessage = {
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
    return this.enhancedCognitive.getMathKnowledge().size
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
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
      mathFunctions: Array.from(this.mathFunctions.entries()),
      timestamp: Date.now(),
    }
  }

  public getConversationHistory(): ChatMessage[] {
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
      this.mathFunctions = new Map()

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

      this.initializeBasicMathFunctions()

      await this.saveConversationHistory()
      await this.saveMemory()
      await this.saveVocabulary()

      console.log("✅ AI system retrained successfully")
    } catch (error) {
      console.error("❌ AI system retraining failed:", error)
      throw error
    }
  }
}

// Enhanced Math Processor (keeping existing functionality)
class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []

  constructor() {
    this.initializeMathPatterns()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
    ]
  }

  public analyzeMathExpression(input: string): MathAnalysis {
    const cleanInput = input.trim().toLowerCase()
    const reasoning: string[] = []

    reasoning.push(`Analyzing input: "${input}"`)

    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        reasoning.push(`Matched pattern for ${pattern.operation}`)

        try {
          const numbers = pattern.extract(match)
          reasoning.push(`Extracted numbers: ${numbers.join(", ")}`)

          const result = this.performOperation(pattern.operation, numbers)
          reasoning.push(`Calculated result: ${result}`)

          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            reasoning: reasoning,
          }
        } catch (error) {
          reasoning.push(`Error in calculation: ${error}`)
          return {
            isMatch: false,
            operation: pattern.operation,
            numbers: [],
            result: undefined,
            confidence: 0.3,
            reasoning: reasoning,
          }
        }
      }
    }

    reasoning.push("No mathematical content detected")
    return {
      isMatch: false,
      operation: "none",
      numbers: [],
      result: undefined,
      confidence: 0.0,
      reasoning: reasoning,
    }
  }

  private performOperation(operation: string, numbers: number[]): number {
    switch (operation) {
      case "add":
        return numbers[0] + numbers[1]
      case "subtract":
        return numbers[0] - numbers[1]
      case "multiply":
        return numbers[0] * numbers[1]
      case "divide":
        if (numbers[1] === 0) throw new Error("Cannot divide by zero")
        return numbers[0] / numbers[1]
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}

// Type Definitions
interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

interface FactEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

interface AIResponse {
  content: string
  confidence: number
  reasoning?: string[]
  mathAnalysis?: any
}

interface MathFunction {
  name: string
  description: string
  examples: string[]
  func: (...args: number[]) => number | string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

interface MathPattern {
  pattern: RegExp
  operation: string
  confidence: number
  extract: (match: RegExpMatchArray) => number[]
}

interface MathAnalysis {
  isMatch: boolean
  operation: string
  numbers: number[]
  result: number | undefined
  confidence: number
  reasoning: string[]
}
