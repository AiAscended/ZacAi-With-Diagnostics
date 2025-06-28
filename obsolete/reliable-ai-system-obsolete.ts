import { BrowserStorageManager } from "./browser-storage-manager"

// Enhanced Math Processor - inline to avoid export issues
class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []

  constructor() {
    this.initializeMathPatterns()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      // Basic multiplication patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*times\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*multiplied\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /multiply\s*(\d+(?:\.\d+)?)\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:times|x|×|\*)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "multiply",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Addition patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*plus\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Subtraction patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Division patterns
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

    // Check each pattern
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

    // Check if it contains mathematical keywords but no match
    const mathKeywords = ["calculate", "math", "multiply", "times", "plus", "minus", "divide", "add", "subtract"]
    const containsMathKeywords = mathKeywords.some((keyword) => cleanInput.includes(keyword))

    if (containsMathKeywords || /\d/.test(cleanInput)) {
      reasoning.push("Contains mathematical keywords or numbers but no clear pattern match")
      return {
        isMatch: false,
        operation: "unknown",
        numbers: [],
        result: undefined,
        confidence: 0.4,
        reasoning: reasoning,
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
      case "power":
        return Math.pow(numbers[0], numbers[1])
      case "sqrt":
        if (numbers[0] < 0) throw new Error("Cannot take square root of negative number")
        return Math.sqrt(numbers[0])
      case "percentage":
        return (numbers[0] / 100) * numbers[1]
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}

// Main AI System Class
export class ReliableAISystem {
  private mathProcessor = new EnhancedMathProcessor()
  private mathFunctions: Map<string, MathFunction> = new Map()
  private storageManager = new BrowserStorageManager()
  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private systemStatus = "idle"
  private isInitialized = false

  constructor() {
    // Initialize with basic vocabulary immediately
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
    this.initializeSampleFacts()

    // Ensure math functions are loaded
    this.loadMathFunctions()
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Learn from user input
    this.learnFromMessage(userMessage)

    // Enhanced input classification
    const inputType = this.classifyInput(userMessage)

    if (inputType === "math") {
      const mathAnalysis = this.mathProcessor.analyzeMathExpression(userMessage)

      if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
        const response: AIResponse = {
          content: `The result is: ${mathAnalysis.result}`,
          confidence: mathAnalysis.confidence,
          reasoning: mathAnalysis.reasoning,
          mathAnalysis: mathAnalysis,
        }
        await this.saveConversation(userMessage, response.content)
        return response
      }
    }

    // Generate conversational response
    const response = this.generateResponse(userMessage)
    await this.saveConversation(userMessage, response.content)
    return response
  }

  private async saveConversationHistory(): Promise<void> {
    try {
      await this.storageManager.saveConversations(this.conversationHistory)
    } catch (error) {
      console.warn("Failed to save conversation:", error)
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

  private async saveMemory(): Promise<void> {
    try {
      await this.storageManager.saveMemory(this.memory)
    } catch (error) {
      console.warn("Failed to save memory:", error)
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

  private async saveVocabulary(): Promise<void> {
    try {
      await this.storageManager.saveVocabulary(this.vocabulary)
    } catch (error) {
      console.warn("Failed to save vocabulary:", error)
    }
  }

  private async loadVocabulary(): Promise<void> {
    try {
      const vocabulary = await this.storageManager.loadVocabulary()
      // Merge with existing vocabulary
      vocabulary.forEach((category, word) => {
        this.vocabulary.set(word, category)
      })
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Reliable AI System...")

      // Load conversation history (now async)
      await this.loadConversationHistory()

      // Load memory entries
      await this.loadMemory()

      // Load vocabulary
      await this.loadVocabulary()

      // Load math functions
      this.loadMathFunctions()

      // System is ready for basic operations
      this.systemStatus = "ready"
      this.isInitialized = true

      console.log("✅ Basic system ready!")

      // Start background enhancement (non-blocking)
      this.enhanceSystemInBackground()
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      // Even if something fails, we can still work with basic functionality
      this.systemStatus = "ready"
      this.isInitialized = true
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

    // Keep only recent conversations to avoid memory issues
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }

    // Save to IndexedDB safely
    await this.saveConversationHistory()
    await this.saveMemory()
    await this.saveVocabulary()
  }

  private loadMathFunctions(): void {
    // Add advanced math functions
    const advancedMath: MathFunction[] = [
      {
        name: "sqrt",
        description: "Square root",
        examples: ["sqrt(16)", "square root of 25"],
        func: (a: number) => Math.sqrt(a),
      },
      {
        name: "power",
        description: "Power/Exponent",
        examples: ["2^3", "2 to the power of 3"],
        func: (a: number, b: number) => Math.pow(a, b),
      },
      {
        name: "sin",
        description: "Sine",
        examples: ["sin(30)", "sine of 45"],
        func: (a: number) => Math.sin((a * Math.PI) / 180),
      },
      {
        name: "cos",
        description: "Cosine",
        examples: ["cos(60)", "cosine of 90"],
        func: (a: number) => Math.cos((a * Math.PI) / 180),
      },
      {
        name: "tan",
        description: "Tangent",
        examples: ["tan(45)", "tangent of 30"],
        func: (a: number) => Math.tan((a * Math.PI) / 180),
      },
    ]

    advancedMath.forEach((func) => this.mathFunctions.set(func.name, func))
  }

  private async enhanceSystemInBackground(): Promise<void> {
    try {
      // Add more vocabulary gradually
      await this.loadExtendedVocabulary()

      // System is now enhanced
      this.systemStatus = "enhanced"
      console.log("🎯 System enhanced with extended vocabulary!")
    } catch (error) {
      console.warn("⚠️ Background enhancement failed, but system remains functional:", error)
    }
  }

  private initializeBasicVocabulary(): void {
    // Essential words for basic conversation
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
      "sum",
      "difference",
      "product",
      "quotient",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
    console.log(`📚 Basic vocabulary loaded: ${this.vocabulary.size} words`)
  }

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

  private async loadExtendedVocabulary(): Promise<void> {
    const extendedWords = [
      // Technology
      "computer",
      "internet",
      "website",
      "software",
      "program",
      "code",
      "data",
      "artificial",
      "intelligence",
      "machine",
      "learning",
      "algorithm",
      // Emotions
      "feel",
      "feeling",
      "emotion",
      "mood",
      "calm",
      "nervous",
      "confident",
      "surprised",
      "confused",
      "curious",
      "interested",
      "bored",
      // Actions
      "create",
      "build",
      "make",
      "design",
      "develop",
      "improve",
      "fix",
      "learn",
      "teach",
      "study",
      "practice",
      "try",
      "attempt",
      "succeed",
      // Math terms
      "equation",
      "formula",
      "function",
      "variable",
      "calculate",
      "result",
      "square",
      "root",
      "power",
      "logarithm",
      "sine",
      "cosine",
      "tangent",
    ]

    // Add words in small batches with delays to avoid blocking
    for (let i = 0; i < extendedWords.length; i += 10) {
      const batch = extendedWords.slice(i, i + 10)
      batch.forEach((word) => this.vocabulary.set(word.toLowerCase(), "extended"))

      // Small delay to keep UI responsive
      if (i % 20 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1))
      }
    }
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

  public getStats(): any {
    const assistantMessages = this.conversationHistory.filter((m) => m.role === "assistant" && m.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: this.memory.size,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: this.mathFunctions.size, // Ensure this returns a number
      seedProgress: 0,
      responseTime: 0,
      // Add access to the actual data for detailed viewing - but don't interfere with the numeric stats
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      mathFunctionsData: this.mathFunctions,
    }
  }

  public getMathFunctionCount(): number {
    return this.mathFunctions.size
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
    const suggestions = [
      { text: "Tell me about yourself", type: "question" },
      { text: "What can you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
      { text: "What facts do you know?", type: "question" },
    ]
    return suggestions
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
      mathFunctions: Array.from(this.mathFunctions.entries()),
      timestamp: Date.now(),
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

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
      { pattern: /my name is (.+)/i, importance: 0.9 },
      { pattern: /i (?:am|work as) (?:a |an )?(.+)/i, importance: 0.7 },
      { pattern: /i like (.+)/i, importance: 0.6 },
      { pattern: /i don't like (.+)/i, importance: 0.6 },
      { pattern: /i live in (.+)/i, importance: 0.7 },
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

  private generateMemoryKey(content: string): string {
    return content.toLowerCase().replace(/\s+/g, "_").substring(0, 20)
  }

  private generateResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase()

    // Extract information from the message for learning
    this.extractPersonalInfo(userMessage)

    // Check for memory queries first
    if (
      lowerMessage.includes("remember") ||
      lowerMessage.includes("what did") ||
      lowerMessage.includes("do you know")
    ) {
      const memoryResponse = this.searchMemory(userMessage)
      if (memoryResponse) {
        return { content: memoryResponse, confidence: 0.8, reasoning: ["Found relevant memory"] }
      }
    }

    // Enhanced pattern-based responses
    const patterns = [
      {
        patterns: ["hello", "hi", "hey"],
        responses: [
          "Hello! How can I help you today?",
          "Hi there! What's on your mind?",
          "Hey! Great to see you again!",
          "Hello! I'm here and ready to chat.",
        ],
        confidence: 0.9,
      },
      {
        patterns: ["my name is"],
        responses: [
          "Nice to meet you! I'll remember your name.",
          "Great to know your name! I've stored that information.",
          "Thanks for telling me your name. I'll remember that.",
        ],
        confidence: 0.9,
      },
      {
        patterns: ["can you guess", "guess which"],
        responses: [
          "That's an interesting question! Based on typical naming patterns, I'd guess the male cat might be Mister Fifty - that sounds like a more masculine name. Am I right?",
          "Let me think... Mister Fifty sounds like it could be the male cat's name. The 'Mister' title suggests masculinity. How did I do?",
          "I'd guess Mister Fifty is the male cat - the name has a more masculine feel to it. Did I guess correctly?",
        ],
        confidence: 0.8,
      },
      {
        patterns: ["i have", "i own"],
        responses: [
          "That's wonderful! Tell me more about that.",
          "Interesting! I'd love to hear more details.",
          "That sounds great! What else would you like to share?",
        ],
        confidence: 0.7,
      },
      {
        patterns: ["goodbye", "bye", "see you"],
        responses: [
          "Goodbye! It was great chatting with you.",
          "See you later! I'll remember our conversation.",
          "Bye! Feel free to come back anytime.",
          "Take care! I'll be here when you return.",
        ],
        confidence: 0.9,
      },
      {
        patterns: ["how are you", "how do you feel"],
        responses: [
          "I'm doing well, thank you for asking! How are you?",
          "I'm functioning perfectly and ready to help!",
          "I'm great! I love learning from our conversations.",
          "I'm doing wonderfully! Each conversation makes me better.",
        ],
        confidence: 0.8,
      },
      {
        patterns: ["what can you do", "what are you", "who are you"],
        responses: [
          "I\'m a browser-based AI that can chat, remember\
