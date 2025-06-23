interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

interface AIResponse {
  content: string
  confidence: number
}

interface AIStats {
  totalMessages: number
  vocabularySize: number
  memoryEntries: number
  avgConfidence: number
  systemStatus: "loading" | "ready" | "enhanced"
  mathFunctions: number
  seedProgress: number
  responseTime: number
}

interface MemoryEntry {
  key: string
  value: string
  timestamp: number
  importance: number
}

interface MathFunction {
  name: string
  description: string
  examples: string[]
  func: (...args: number[]) => number | string
}

interface Suggestion {
  text: string
  type: "question" | "topic" | "action"
}

export class ReliableAISystem {
  private conversationHistory: ChatMessage[] = []
  private vocabulary: Map<string, string> = new Map()
  private memory: Map<string, MemoryEntry> = new Map()
  private mathFunctions: Map<string, MathFunction> = new Map()
  private isInitialized = false
  private systemStatus: "loading" | "ready" | "enhanced" = "loading"
  private responseTimes: number[] = []
  private feedbackData: Map<string, "positive" | "negative"> = new Map()

  constructor() {
    // Initialize with basic vocabulary immediately
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Reliable AI System...")

      // Load conversation history (safe operation)
      this.loadConversationHistory()

      // Load memory entries
      this.loadMemory()

      // Load vocabulary
      this.loadVocabulary()

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

  public addVocabularyWord(word: string, category: string): void {
    this.vocabulary.set(word.toLowerCase(), category)
  }

  public addMathFunction(mathFunc: MathFunction): void {
    this.mathFunctions.set(mathFunc.name, mathFunc)
  }

  public getMathFunctionCount(): number {
    return this.mathFunctions.size
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    // Learn from user input
    this.learnFromMessage(userMessage)

    // Check if it's a math question first
    const mathResult = this.processMathQuery(userMessage)
    if (mathResult) {
      this.saveConversation(userMessage, mathResult.content)
      return mathResult
    }

    // Generate response based on context and memory
    const response = this.generateResponse(userMessage)

    // Save conversation
    this.saveConversation(userMessage, response.content)

    return response
  }

  private processMathQuery(message: string): AIResponse | null {
    const lowerMessage = message.toLowerCase()

    // Check for mathematical expressions
    const mathPatterns = [
      // Basic arithmetic
      { pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/, operation: "add" },
      { pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/, operation: "subtract" },
      { pattern: /(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)/, operation: "multiply" },
      { pattern: /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/, operation: "divide" },
      { pattern: /(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/, operation: "power" },

      // Word-based math
      { pattern: /add\s+(\d+(?:\.\d+)?)\s+(?:and|to)\s+(\d+(?:\.\d+)?)/, operation: "add" },
      { pattern: /subtract\s+(\d+(?:\.\d+)?)\s+from\s+(\d+(?:\.\d+)?)/, operation: "subtract" },
      { pattern: /multiply\s+(\d+(?:\.\d+)?)\s+(?:by|and)\s+(\d+(?:\.\d+)?)/, operation: "multiply" },
      { pattern: /divide\s+(\d+(?:\.\d+)?)\s+by\s+(\d+(?:\.\d+)?)/, operation: "divide" },

      // Functions
      { pattern: /square\s+root\s+of\s+(\d+(?:\.\d+)?)/, operation: "sqrt" },
      { pattern: /sqrt$$(\d+(?:\.\d+)?)$$/, operation: "sqrt" },
      { pattern: /sin$$(\d+(?:\.\d+)?)$$/, operation: "sin" },
      { pattern: /cos$$(\d+(?:\.\d+)?)$$/, operation: "cos" },
      { pattern: /tan$$(\d+(?:\.\d+)?)$$/, operation: "tan" },
    ]

    for (const { pattern, operation } of mathPatterns) {
      const match = message.match(pattern)
      if (match) {
        const mathFunc = this.mathFunctions.get(operation)
        if (mathFunc) {
          try {
            const numbers = match.slice(1).map((n) => Number.parseFloat(n))
            const result = mathFunc.func(...numbers)

            return {
              content: `The result is: ${result}`,
              confidence: 0.95,
            }
          } catch (error) {
            return {
              content: "I encountered an error with that calculation. Please check your input.",
              confidence: 0.3,
            }
          }
        }
      }
    }

    // Check for general math requests
    if (
      lowerMessage.includes("calculate") ||
      lowerMessage.includes("math") ||
      lowerMessage.includes("solve") ||
      lowerMessage.includes("compute")
    ) {
      return {
        content: "I can help with math! Try expressions like '2 + 3', 'sqrt(16)', 'sin(30)', or 'multiply 5 by 7'.",
        confidence: 0.8,
      }
    }

    return null
  }

  public generateSuggestions(messages: ChatMessage[]): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Context-based suggestions
    if (messages.length === 0) {
      suggestions.push(
        { text: "How do you work?", type: "question" },
        { text: "Calculate 15 * 23", type: "action" },
        { text: "Remember: I like programming", type: "action" },
        { text: "What can you do?", type: "question" },
      )
    } else {
      const lastMessage = messages[messages.length - 1]

      if (lastMessage.role === "assistant") {
        // Suggest follow-up questions
        if (lastMessage.content.includes("math") || lastMessage.content.includes("calculate")) {
          suggestions.push(
            { text: "Try another calculation", type: "action" },
            { text: "What math functions do you know?", type: "question" },
          )
        }

        if (lastMessage.content.includes("remember") || lastMessage.content.includes("memory")) {
          suggestions.push(
            { text: "What else do you remember?", type: "question" },
            { text: "Tell me about your memory system", type: "topic" },
          )
        }
      }
    }

    // Always include some general suggestions
    suggestions.push(
      { text: "Tell me a joke", type: "topic" },
      { text: "What's the weather like?", type: "question" },
      { text: "Help me with something", type: "action" },
    )

    return suggestions.slice(0, 6) // Limit to 6 suggestions
  }

  public generateResponseSuggestions(userInput: string, aiResponse: string): string[] {
    const suggestions: string[] = []

    // Based on AI response content
    if (aiResponse.includes("calculate") || aiResponse.includes("math")) {
      suggestions.push("Try another calculation", "What's 2^10?", "Calculate pi * 5")
    }

    if (aiResponse.includes("remember") || aiResponse.includes("memory")) {
      suggestions.push("What do you remember about me?", "Forget that information", "Remember something new")
    }

    if (aiResponse.includes("help")) {
      suggestions.push("What else can you help with?", "Show me examples", "Explain that better")
    }

    // General follow-ups
    suggestions.push("Tell me more", "That's interesting", "Can you explain?")

    return suggestions.slice(0, 4) // Limit to 4 suggestions
  }

  public processFeedback(messageId: string, feedback: "positive" | "negative"): void {
    this.feedbackData.set(messageId, feedback)

    // Use feedback to improve future responses
    // This is a simple implementation - could be more sophisticated
    console.log(`Received ${feedback} feedback for message ${messageId}`)
  }

  public updateResponseTime(time: number): void {
    this.responseTimes.push(time)

    // Keep only recent response times
    if (this.responseTimes.length > 50) {
      this.responseTimes = this.responseTimes.slice(-30)
    }
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
        const entry: MemoryEntry = {
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

    // Check for memory queries first
    if (
      lowerMessage.includes("remember") ||
      lowerMessage.includes("what did") ||
      lowerMessage.includes("do you know")
    ) {
      const memoryResponse = this.searchMemory(userMessage)
      if (memoryResponse) {
        return { content: memoryResponse, confidence: 0.8 }
      }
    }

    // Pattern-based responses
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
          "I'm a browser-based AI that can chat, remember our conversations, calculate math, and learn from you!",
          "I'm an AI assistant that runs in your browser. I can remember what we talk about, solve math problems, and get smarter over time!",
          "I'm your personal AI companion! I can chat, remember important things, solve calculations, and help with various topics.",
          "I'm a learning AI system with mathematical capabilities. I remember our conversations and continuously expand my knowledge!",
        ],
        confidence: 0.85,
      },
      {
        patterns: ["thank", "thanks"],
        responses: ["You're very welcome!", "Happy to help!", "My pleasure!", "Anytime! That's what I'm here for."],
        confidence: 0.9,
      },
    ]

    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.patterns.some((p) => lowerMessage.includes(p))) {
        const response = pattern.responses[Math.floor(Math.random() * pattern.responses.length)]
        return { content: response, confidence: pattern.confidence }
      }
    }

    // Context-aware response based on conversation history
    const contextResponse = this.generateContextualResponse(userMessage)
    if (contextResponse) {
      return contextResponse
    }

    // Default responses
    const defaultResponses = [
      "That's interesting! Can you tell me more about that?",
      "I understand. What would you like to explore about this topic?",
      "Thanks for sharing that with me. What else is on your mind?",
      "I'm learning from what you're telling me. Please continue!",
      "That's a good point. How do you feel about it?",
      "I see. What made you think about this?",
      "Interesting perspective! I'll remember that for our future conversations.",
    ]

    return {
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      confidence: 0.5,
    }
  }

  private searchMemory(query: string): string | null {
    const queryLower = query.toLowerCase()

    // Search through memory entries
    for (const [key, entry] of this.memory.entries()) {
      if (queryLower.includes(key.replace(/_/g, " ")) || queryLower.includes(entry.value.toLowerCase())) {
        return `I remember that ${entry.value}. I stored this on ${new Date(entry.timestamp).toLocaleDateString()}.`
      }
    }

    // Check if asking about general memory
    if (queryLower.includes("remember") && this.memory.size > 0) {
      const recentMemories = Array.from(this.memory.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3)

      const memoryList = recentMemories.map((m) => m.value).join(", ")
      return `I remember several things about you: ${memoryList}. Is there something specific you'd like me to recall?`
    }

    return null
  }

  private generateContextualResponse(userMessage: string): AIResponse | null {
    // Use recent conversation history for context
    const recentMessages = this.conversationHistory.slice(-6)

    if (recentMessages.length > 0) {
      const lastMessage = recentMessages[recentMessages.length - 1]

      // If user is continuing a topic
      if (lastMessage.role === "assistant" && lastMessage.content.includes("?")) {
        return {
          content: "I appreciate you sharing that with me. It helps me understand you better!",
          confidence: 0.7,
        }
      }
    }

    return null
  }

  private saveConversation(userMessage: string, aiResponse: string): void {
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

    // Save to localStorage safely
    this.saveConversationHistory()
    this.saveMemory()
    this.saveVocabulary()
    this.saveMathFunctions()
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public getStats(): AIStats {
    const assistantMessages = this.conversationHistory.filter((m) => m.role === "assistant" && m.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0

    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
        : 0

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: this.memory.size,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: this.mathFunctions.size,
      seedProgress: 0, // This will be updated by the seeder
      responseTime: Math.round(avgResponseTime),
    }
  }

  public exportData(): any {
    return {
      conversationHistory: this.conversationHistory,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      mathFunctions: Array.from(this.mathFunctions.entries()).map(([name, func]) => ({
        name,
        description: func.description,
        examples: func.examples,
      })),
      stats: this.getStats(),
      exportDate: new Date().toISOString(),
    }
  }

  private saveConversationHistory(): void {
    try {
      const data = JSON.stringify(this.conversationHistory)
      localStorage.setItem("reliable-ai-conversation", data)
    } catch (error) {
      console.warn("Failed to save conversation:", error)
    }
  }

  private loadConversationHistory(): void {
    try {
      const stored = localStorage.getItem("reliable-ai-conversation")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.conversationHistory = parsed.filter((msg) => msg && msg.id && msg.role && msg.content)
        }
      }
    } catch (error) {
      console.warn("Failed to load conversation history:", error)
      this.conversationHistory = []
    }
  }

  private saveMemory(): void {
    try {
      const memoryArray = Array.from(this.memory.entries())
      localStorage.setItem("reliable-ai-memory", JSON.stringify(memoryArray))
    } catch (error) {
      console.warn("Failed to save memory:", error)
    }
  }

  private loadMemory(): void {
    try {
      const stored = localStorage.getItem("reliable-ai-memory")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.memory = new Map(parsed)
        }
      }
    } catch (error) {
      console.warn("Failed to load memory:", error)
      this.memory = new Map()
    }
  }

  private saveVocabulary(): void {
    try {
      const vocabArray = Array.from(this.vocabulary.entries())
      localStorage.setItem("reliable-ai-vocabulary", JSON.stringify(vocabArray))
    } catch (error) {
      console.warn("Failed to save vocabulary:", error)
    }
  }

  private loadVocabulary(): void {
    try {
      const stored = localStorage.getItem("reliable-ai-vocabulary")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Merge with existing vocabulary
          const storedVocab = new Map(parsed)
          storedVocab.forEach((category, word) => {
            this.vocabulary.set(word, category)
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }
  }

  private saveMathFunctions(): void {
    try {
      const mathArray = Array.from(this.mathFunctions.entries()).map(([name, func]) => [
        name,
        {
          name: func.name,
          description: func.description,
          examples: func.examples,
          // Note: We don't save the actual function, just metadata
        },
      ])
      localStorage.setItem("reliable-ai-math", JSON.stringify(mathArray))
    } catch (error) {
      console.warn("Failed to save math functions:", error)
    }
  }

  private loadMathFunctions(): void {
    try {
      const stored = localStorage.getItem("reliable-ai-math")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // We only load metadata, actual functions are re-initialized
          console.log(`Loaded ${parsed.length} math function definitions`)
        }
      }
    } catch (error) {
      console.warn("Failed to load math functions:", error)
    }
  }
}
