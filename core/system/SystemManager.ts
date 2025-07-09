import { CognitiveRouter } from "./CognitiveRouter"
import { ThinkingEngine } from "../engines/ThinkingEngine"
import { MathEngine } from "../engines/MathEngine"
import { KnowledgeEngine } from "../engines/KnowledgeEngine"
import { LanguageEngine } from "../engines/LanguageEngine"
import { MemoryEngine } from "../engines/MemoryEngine"
import { DiagnosticEngine } from "../engines/DiagnosticEngine"
import { KnowledgeManager } from "../managers/KnowledgeManager"
import { StorageManager } from "../managers/StorageManager"
import { ContextManager } from "../managers/ContextManager"
import { defaultConfig, type SystemConfig } from "./config"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  thinkingProcess?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
}

export interface SystemResponse {
  content: string
  confidence: number
  reasoning?: string[]
  pathways?: string[]
  synthesis?: any
  mathAnalysis?: any
  thinkingProcess?: string[]
  knowledgeUsed?: string[]
}

export interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

export class SystemManager {
  private cognitiveRouter: CognitiveRouter
  private thinkingEngine: ThinkingEngine
  private mathEngine: MathEngine
  private knowledgeEngine: KnowledgeEngine
  private languageEngine: LanguageEngine
  private memoryEngine: MemoryEngine
  private diagnosticEngine: DiagnosticEngine
  private knowledgeManager: KnowledgeManager
  private storageManager: StorageManager
  private contextManager: ContextManager
  private conversationHistory: ChatMessage[] = []
  private knowledgeBase: string[] = []
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private memory: Map<string, any> = new Map()
  private facts: Map<string, any> = new Map()
  private mathFunctions: Map<string, any> = new Map()
  private isInitialized = false
  private config: SystemConfig

  constructor(config: SystemConfig = defaultConfig) {
    this.config = config

    // Initialize managers first
    this.storageManager = new StorageManager()
    this.knowledgeManager = new KnowledgeManager()
    this.contextManager = new ContextManager()

    // Initialize engines
    this.thinkingEngine = new ThinkingEngine()
    this.mathEngine = new MathEngine()
    this.knowledgeEngine = new KnowledgeEngine(this.knowledgeManager)
    this.languageEngine = new LanguageEngine()
    this.memoryEngine = new MemoryEngine(this.storageManager)
    this.diagnosticEngine = new DiagnosticEngine()

    // Initialize cognitive router with all engines
    this.cognitiveRouter = new CognitiveRouter({
      thinkingEngine: this.thinkingEngine,
      mathEngine: this.mathEngine,
      knowledgeEngine: this.knowledgeEngine,
      languageEngine: this.languageEngine,
      memoryEngine: this.memoryEngine,
      diagnosticEngine: this.diagnosticEngine,
    })

    // Initialize basic data immediately
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
    this.initializeSampleFacts()
    this.loadFromStorage()
    this.loadPersonalInfo()

    console.log("🚀 SystemManager: Unified AI System initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔧 SystemManager: Starting full initialization...")

    try {
      // Initialize all components in proper order
      await this.storageManager.initialize()
      await this.knowledgeManager.initialize()
      await this.contextManager.initialize()

      await this.memoryEngine.initialize()
      await this.knowledgeEngine.initialize()
      await this.languageEngine.initialize()
      await this.mathEngine.initialize()
      await this.thinkingEngine.initialize()
      await this.diagnosticEngine.initialize()

      await this.cognitiveRouter.initialize()

      // Load all stored data
      await this.loadConversationHistory()
      await this.loadMemory()
      await this.loadVocabulary()

      this.isInitialized = true
      console.log("✅ SystemManager: Unified AI System fully initialized")
    } catch (error) {
      console.error("❌ SystemManager: Initialization failed:", error)
      // Even if something fails, we can still work with basic functionality
      this.isInitialized = true
    }
  }

  public async processMessage(userMessage: string): Promise<ChatMessage> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log(`🤖 SystemManager: Processing unified message: "${userMessage}"`)

    try {
      // Extract and store personal information FIRST (from CognitiveAISystem)
      this.extractAndStorePersonalInfo(userMessage)

      // Learn from user input (from ReliableAISystem)
      this.learnFromMessage(userMessage)

      // Check if asking about personal info (from CognitiveAISystem)
      if (this.isAskingAboutPersonalInfo(userMessage)) {
        const response = await this.handlePersonalInfoQuery(userMessage)
        const assistantMsg = await this.createAssistantMessage(response)
        await this.saveConversation(userMessage, response.content)
        return assistantMsg
      }

      // Enhanced math processing (from multiple systems)
      if (this.isMathProblem(userMessage)) {
        const mathResponse = await this.handleMathProblem(userMessage)
        const assistantMsg = await this.createAssistantMessage(mathResponse)
        await this.saveConversation(userMessage, mathResponse.content)
        return assistantMsg
      }

      // Definition requests (from CognitiveAISystem)
      if (this.isDefinitionRequest(userMessage)) {
        const defResponse = await this.handleDefinitionRequest(userMessage)
        const assistantMsg = await this.createAssistantMessage(defResponse)
        await this.saveConversation(userMessage, defResponse.content)
        return assistantMsg
      }

      // Get conversation context
      const context = await this.contextManager.getContext()

      // Route through cognitive router for complex processing
      const response = await this.cognitiveRouter.route(userMessage, context)

      // Add user message to history
      const userMsg: ChatMessage = {
        id: this.generateId(),
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      }
      this.conversationHistory.push(userMsg)

      // Add to knowledge base
      this.knowledgeBase.push(userMessage.toLowerCase())

      // Store memory
      await this.memoryEngine.storeMemory({
        type: "conversation",
        userMessage,
        response: response.content,
      })

      // Enhanced response generation with personal context
      const enhancedResponse = this.enhanceResponseWithPersonalContext(response)

      // Add assistant message to history with enhanced data
      const assistantMsg: ChatMessage = {
        id: this.generateId(),
        role: "assistant",
        content: enhancedResponse.content,
        timestamp: Date.now(),
        confidence: enhancedResponse.confidence,
        thinkingProcess: enhancedResponse.reasoning,
        mathAnalysis: enhancedResponse.mathAnalysis,
        knowledgeUsed: enhancedResponse.knowledgeUsed || [],
      }
      this.conversationHistory.push(assistantMsg)

      // Update context with new interaction
      await this.contextManager.updateContext(userMessage, enhancedResponse)

      // Log diagnostics
      this.diagnosticEngine.logInteraction(userMessage, enhancedResponse)

      // Save to storage
      this.saveToStorage()

      console.log(
        `✅ SystemManager: Unified processing complete with confidence: ${Math.round(enhancedResponse.confidence * 100)}%`,
      )

      return assistantMsg
    } catch (error) {
      console.error("❌ SystemManager: Error processing message:", error)

      const errorMsg: ChatMessage = {
        id: this.generateId(),
        role: "assistant",
        content: "I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
        confidence: 0.1,
        thinkingProcess: [`Error: ${error}`],
      }

      return errorMsg
    }
  }

  // Personal info extraction (from CognitiveAISystem)
  private extractAndStorePersonalInfo(message: string): void {
    const personalPatterns = [
      {
        pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i,
        key: "name",
        importance: 0.9,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i have (\d+)\s+(cats?|dogs?|pets?)/i,
        key: "pets",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => `${match[1]} ${match[2]}`,
      },
      {
        pattern: /i (?:work|am employed) (?:as|at)\s+(.+?)(?:\.|$)/i,
        key: "job",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i live in\s+(.+?)(?:\.|$)/i,
        key: "location",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i am (\d+)\s*years?\s*old/i,
        key: "age",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => `${match[1]} years old`,
      },
      {
        pattern: /one is named (\w+)/i,
        key: "pet_name_1",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /the other is.*named (\w+)/i,
        key: "pet_name_2",
        importance: 0.6,
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
        this.savePersonalInfo()
      }
    })
  }

  // Personal info query handling (from CognitiveAISystem)
  private isAskingAboutPersonalInfo(message: string): boolean {
    const patterns = [
      /what.*(?:do you|can you).*remember.*(?:about me|me)/i,
      /do you.*(?:know|remember).*(?:about me|me|my name)/i,
      /what.*(?:know|remember).*(?:about me|me)/i,
      /tell me.*what.*(?:know|remember)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handlePersonalInfoQuery(message: string): Promise<any> {
    if (this.personalInfo.size === 0) {
      return {
        content:
          "I don't have any personal information stored about you yet. Feel free to share something about yourself!",
        confidence: 0.9,
        reasoning: ["No personal information found in storage"],
      }
    }

    let response = "📝 **Here's what I remember about you:**\n\n"

    for (const [key, entry] of this.personalInfo) {
      const timeAgo = this.getTimeAgo(entry.timestamp)
      response += `• **${this.capitalizeFirst(key)}**: ${entry.value} *(learned ${timeAgo})*\n`
    }

    response += `\nI have ${this.personalInfo.size} pieces of personal information stored about you.`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Retrieved personal information from storage", `Found ${this.personalInfo.size} entries`],
    }
  }

  // Enhanced math processing (from multiple systems)
  private isMathProblem(message: string): boolean {
    const mathPatterns = [
      /\d+\s*[+\-*/×÷]\s*\d+/,
      /calculate|math|solve|what.*is.*\d+/i,
      /\d+\s*(?:plus|minus|times|divided by|multiplied by)\s*\d+/i,
    ]
    return mathPatterns.some((pattern) => pattern.test(message))
  }

  private async handleMathProblem(message: string): Promise<any> {
    // Enhanced math processing with multiple pattern matching
    const mathPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i,
        operation: "multiply",
        confidence: 0.95,
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/i,
        operation: "add",
        confidence: 0.95,
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/i,
        operation: "subtract",
        confidence: 0.95,
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)/i,
        operation: "divide",
        confidence: 0.95,
      },
    ]

    for (const { pattern, operation, confidence } of mathPatterns) {
      const match = message.match(pattern)
      if (match) {
        const num1 = Number.parseFloat(match[1])
        const num2 = Number.parseFloat(match[2])
        let result: number
        let steps: string[] = []

        switch (operation) {
          case "add":
            result = num1 + num2
            steps = [`Adding ${num1} + ${num2}`, `Result: ${result}`]
            break
          case "subtract":
            result = num1 - num2
            steps = [`Subtracting ${num1} - ${num2}`, `Result: ${result}`]
            break
          case "multiply":
            result = num1 * num2
            steps = [`Multiplying ${num1} × ${num2}`, `Result: ${result}`]
            break
          case "divide":
            if (num2 === 0) {
              return {
                content: "I cannot divide by zero. Please provide a non-zero divisor.",
                confidence: 0.9,
                reasoning: ["Division by zero error"],
              }
            }
            result = num1 / num2
            steps = [`Dividing ${num1} ÷ ${num2}`, `Result: ${result}`]
            break
          default:
            continue
        }

        const operatorSymbol =
          operation === "multiply" ? "×" : operation === "divide" ? "÷" : operation === "add" ? "+" : "-"

        return {
          content: `🧮 **Mathematical Calculation**\n\n**Problem:** ${num1} ${operatorSymbol} ${num2} = **${result}**\n\n**🧠 My Reasoning Process:**\n${steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\n**Operation:** ${operation}\n**Confidence:** ${Math.round(confidence * 100)}%`,
          confidence: confidence,
          reasoning: steps,
          mathAnalysis: {
            operation,
            numbers: [num1, num2],
            result,
            steps,
          },
        }
      }
    }

    return {
      content: "I can help with basic math! Try something like '25 + 17', '100 ÷ 4', or '13 × 44'",
      confidence: 0.6,
      reasoning: ["Could not parse math expression"],
    }
  }

  // Definition handling (from CognitiveAISystem)
  private isDefinitionRequest(message: string): boolean {
    const patterns = [/what\s+(?:is|does|means?)\s+(.+)/i, /define\s+(.+)/i, /meaning\s+of\s+(.+)/i, /explain\s+(.+)/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleDefinitionRequest(message: string): Promise<any> {
    const wordMatch = message.match(/(?:what\s+(?:is|does|means?)|define|meaning\s+of|explain)\s+(.+)/i)
    if (!wordMatch) {
      return {
        content:
          "I couldn't identify what you want me to define. Could you ask like 'What is [word]?' or 'Define [word]'?",
        confidence: 0.3,
        reasoning: ["Could not extract word to define from message"],
      }
    }

    const word = wordMatch[1].trim().replace(/[?!.]/g, "")

    // Enhanced definition responses
    const definitions: { [key: string]: string } = {
      hello: "A greeting used when meeting someone",
      computer: "An electronic device that processes data and performs calculations",
      ai: "Artificial Intelligence - computer systems that can perform tasks typically requiring human intelligence",
      love: "A strong feeling of affection or deep care for someone or something",
      water: "A clear liquid essential for life, with the chemical formula H2O",
      sun: "The star at the center of our solar system that provides light and heat to Earth",
      math: "The study of numbers, quantities, shapes, and patterns",
      science: "The systematic study of the natural world through observation and experimentation",
    }

    const definition = definitions[word.toLowerCase()]
    if (definition) {
      return {
        content: `📖 **Definition of "${word}"**\n\n${definition}\n\n✨ I've provided this definition from my knowledge base!`,
        confidence: 0.8,
        reasoning: ["Found definition in knowledge base"],
      }
    }

    return {
      content: `I don't have a definition for "${word}" in my current knowledge base. I can help with basic words like 'computer', 'ai', 'love', 'water', 'math', 'science', etc.`,
      confidence: 0.4,
      reasoning: ["Word not found in knowledge base"],
    }
  }

  // Learning from messages (from ReliableAISystem)
  private learnFromMessage(message: string): void {
    // Extract and learn new words
    const words = message.toLowerCase().match(/\b\w+\b/g) || []
    words.forEach((word) => {
      if (word.length > 2 && !this.vocabulary.has(word)) {
        this.vocabulary.set(word, "learned")
      }
    })

    // Extract potential memory items
    this.extractMemoryFromMessage(message)
  }

  private extractMemoryFromMessage(message: string): void {
    const memoryPatterns = [
      { pattern: /remember (?:that )?(.+)/i, importance: 0.8 },
      { pattern: /i like (.+)/i, importance: 0.6 },
      { pattern: /i don't like (.+)/i, importance: 0.6 },
    ]

    memoryPatterns.forEach(({ pattern, importance }) => {
      const match = message.match(pattern)
      if (match && match[1]) {
        const key = this.generateMemoryKey(match[1])
        const entry = {
          key,
          value: match[1].trim(),
          timestamp: Date.now(),
          importance,
        }
        this.memory.set(key, entry)
      }
    })
  }

  private enhanceResponseWithPersonalContext(response: any): any {
    // Get user's name if we have it
    const nameEntry = this.personalInfo.get("name")
    const userName = nameEntry ? nameEntry.value : ""

    // Add personal context to response if appropriate
    if (userName && Math.random() > 0.7) {
      // 30% chance to use name
      response.content = response.content.replace(/\.$/, `, ${userName}.`)
    }

    return response
  }

  private async createAssistantMessage(response: any): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: "user",
      content: "", // Will be set by caller
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    return {
      id: this.generateId(),
      role: "assistant",
      content: response.content,
      timestamp: Date.now(),
      confidence: response.confidence,
      thinkingProcess: response.reasoning,
      mathAnalysis: response.mathAnalysis,
      knowledgeUsed: response.knowledgeUsed || [],
    }
  }

  // Utility methods
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "just now"
  }

  private generateMemoryKey(content: string): string {
    return content.toLowerCase().replace(/\s+/g, "_").substring(0, 20)
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialization methods
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
      "define",
      "meaning",
      "word",
      "learn",
      "learned",
      "new",
      "recent",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
    console.log(`📚 Basic vocabulary loaded: ${this.vocabulary.size} words`)
  }

  private initializeBasicMathFunctions(): void {
    const basicMath = [
      { name: "add", description: "Addition", examples: ["2 + 3", "add 5 and 7"] },
      { name: "subtract", description: "Subtraction", examples: ["10 - 3", "subtract 4 from 9"] },
      { name: "multiply", description: "Multiplication", examples: ["4 * 5", "multiply 3 by 6"] },
      { name: "divide", description: "Division", examples: ["15 / 3", "divide 20 by 4"] },
    ]

    basicMath.forEach((func) => this.mathFunctions.set(func.name, func))
    console.log(`🔢 Math functions loaded: ${this.mathFunctions.size} functions`)
  }

  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
      {
        category: "mathematics",
        fact: "Basic arithmetic includes addition, subtraction, multiplication, and division",
      },
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
    console.log(`📖 Sample facts loaded: ${this.facts.size} facts`)
  }

  // Storage methods
  private savePersonalInfo(): void {
    try {
      const personalInfoArray = Array.from(this.personalInfo.entries())
      localStorage.setItem("zacai-personal-info", JSON.stringify(personalInfoArray))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  private loadPersonalInfo(): void {
    try {
      const stored = localStorage.getItem("zacai-personal-info")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.personalInfo = new Map(parsed)
          console.log(`📚 Loaded ${this.personalInfo.size} personal info entries`)
        }
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
      this.personalInfo = new Map()
    }
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

  private saveToStorage(): void {
    try {
      const recentHistory = this.conversationHistory.slice(-20)
      const recentKnowledge = this.knowledgeBase.slice(-50)

      localStorage.setItem(
        "zacai-system-data",
        JSON.stringify({
          history: recentHistory,
          knowledge: recentKnowledge,
          version: this.config.version,
        }),
      )
    } catch (error) {
      console.warn("Could not save to storage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("zacai-system-data")
      if (stored) {
        const data = JSON.parse(stored)
        this.conversationHistory = data.history || []
        this.knowledgeBase = data.knowledge || []
      }
    } catch (error) {
      console.warn("Could not load from storage:", error)
      this.conversationHistory = []
      this.knowledgeBase = []
    }
  }

  // Public API methods
  public async getConversationHistory(): Promise<ChatMessage[]> {
    return [...this.conversationHistory]
  }

  public getSystemStatus(): any {
    const thinkingStats = this.isInitialized ? this.thinkingEngine.getThoughtStream().length : 0

    return {
      initialized: this.isInitialized,
      engines: {
        thinking: this.isInitialized,
        math: this.isInitialized,
        knowledge: this.isInitialized,
        language: this.isInitialized,
        memory: this.isInitialized,
        diagnostic: this.isInitialized,
      },
      managers: {
        knowledge: {
          vocabulary: this.vocabulary.size,
          totalEntries: this.knowledgeBase.length,
        },
        memory: {
          totalMemories: this.memory.size,
          personalInfo: this.personalInfo.size,
        },
        thinking: {
          totalThoughts: thinkingStats,
        },
      },
      stats: {
        totalMessages: this.conversationHistory.length,
        vocabularySize: this.vocabulary.size,
        memoryEntries: this.memory.size,
        personalInfoEntries: this.personalInfo.size,
        factsCount: this.facts.size,
        mathFunctions: this.mathFunctions.size,
      },
      config: this.config,
    }
  }

  public async exportData(): Promise<any> {
    return {
      conversations: this.conversationHistory,
      knowledge: this.knowledgeBase,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      facts: Array.from(this.facts.entries()),
      mathFunctions: Array.from(this.mathFunctions.entries()),
      context: await this.contextManager.exportData(),
      diagnostics: this.diagnosticEngine.exportData(),
      timestamp: Date.now(),
      version: this.config.version,
    }
  }

  public async importData(data: any): Promise<void> {
    if (data.conversations) this.conversationHistory = data.conversations
    if (data.knowledge) this.knowledgeBase = data.knowledge
    if (data.vocabulary) this.vocabulary = new Map(data.vocabulary)
    if (data.memory) this.memory = new Map(data.memory)
    if (data.personalInfo) this.personalInfo = new Map(data.personalInfo)
    if (data.facts) this.facts = new Map(data.facts)
    if (data.mathFunctions) this.mathFunctions = new Map(data.mathFunctions)
    if (data.context) await this.contextManager.importData(data.context)
    if (data.diagnostics) this.diagnosticEngine.importData(data.diagnostics)

    this.saveToStorage()
    this.savePersonalInfo()
    console.log("✅ SystemManager: Unified data import completed")
  }

  public async clearAllData(): Promise<void> {
    this.conversationHistory = []
    this.knowledgeBase = []
    this.vocabulary = new Map()
    this.memory = new Map()
    this.personalInfo = new Map()
    this.facts = new Map()
    this.mathFunctions = new Map()

    await this.memoryEngine.clearData()
    await this.contextManager.clearData()
    this.diagnosticEngine.clearData()

    localStorage.removeItem("zacai-system-data")
    localStorage.removeItem("zacai-personal-info")

    // Reinitialize basic data
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
    this.initializeSampleFacts()

    console.log("✅ SystemManager: All unified data cleared and reinitialized")
  }

  public async optimizeSystem(): Promise<void> {
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }
    if (this.knowledgeBase.length > 200) {
      this.knowledgeBase = this.knowledgeBase.slice(-150)
    }
    this.saveToStorage()
    console.log("✅ SystemManager: Unified system optimization completed")
  }

  public async retrain(): Promise<void> {
    console.log("🔄 SystemManager: Retraining unified system...")
    await this.optimizeSystem()
    await this.thinkingEngine.initialize()
    console.log("✅ SystemManager: Unified retraining completed")
  }

  private async saveConversation(userMessage: string, responseContent: string): Promise<void> {
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    const assistantMsg: ChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(assistantMsg)

    this.saveToStorage()
  }
}
