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

export class DiagnosticAISystem {
  private conversationHistory: ChatMessage[] = []
  private vocabulary: Map<string, string> = new Map()
  private memory: Map<string, MemoryEntry> = new Map()
  private mathFunctions: Map<string, MathFunction> = new Map()
  private performanceLog: Array<{ operation: string; duration: number; timestamp: number }> = []

  constructor() {
    console.log("🔧 DiagnosticAISystem constructor called")
  }

  public async initializeBasicVocabulary(): Promise<void> {
    console.log("📚 Loading basic vocabulary...")
    const startTime = performance.now()

    // Minimal essential vocabulary for immediate functionality
    const essentialWords = [
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
      "calculate",
      "math",
      "number",
      "add",
      "subtract",
      "multiply",
      "divide",
      "remember",
      "forget",
      "know",
      "think",
      "understand",
      "help",
    ]

    // Add words one by one with minimal delay
    for (const word of essentialWords) {
      this.vocabulary.set(word.toLowerCase(), "essential")

      // Yield control every 10 words to prevent blocking
      if (this.vocabulary.size % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    const duration = performance.now() - startTime
    this.logPerformance("initializeBasicVocabulary", duration)
    console.log(`✅ Basic vocabulary loaded: ${this.vocabulary.size} words in ${duration.toFixed(2)}ms`)
  }

  public async initializeMathFunctions(): Promise<void> {
    console.log("🔢 Loading math functions...")
    const startTime = performance.now()

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
      {
        name: "power",
        description: "Exponentiation",
        examples: ["2^3", "2 to the power of 3"],
        func: (a: number, b: number) => Math.pow(a, b),
      },
      {
        name: "sqrt",
        description: "Square root",
        examples: ["sqrt(16)", "square root of 25"],
        func: (a: number) => Math.sqrt(a),
      },
      {
        name: "sin",
        description: "Sine function",
        examples: ["sin(30)", "sine of 45 degrees"],
        func: (a: number) => Math.sin((a * Math.PI) / 180),
      },
      {
        name: "cos",
        description: "Cosine function",
        examples: ["cos(60)", "cosine of 90 degrees"],
        func: (a: number) => Math.cos((a * Math.PI) / 180),
      },
      {
        name: "tan",
        description: "Tangent function",
        examples: ["tan(45)", "tangent of 30 degrees"],
        func: (a: number) => Math.tan((a * Math.PI) / 180),
      },
    ]

    // Add functions with minimal processing delay
    for (const mathFunc of basicMath) {
      this.mathFunctions.set(mathFunc.name, mathFunc)
      await new Promise((resolve) => setTimeout(resolve, 0)) // Yield control
    }

    const duration = performance.now() - startTime
    this.logPerformance("initializeMathFunctions", duration)
    console.log(`✅ Math functions loaded: ${this.mathFunctions.size} functions in ${duration.toFixed(2)}ms`)
  }

  public async loadConversationHistory(): Promise<ChatMessage[]> {
    console.log("💬 Loading conversation history...")
    const startTime = performance.now()

    try {
      const stored = localStorage.getItem("diagnostic-ai-conversation")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.conversationHistory = parsed.filter((msg) => msg && msg.id && msg.role && msg.content)
          console.log(`📜 Loaded ${this.conversationHistory.length} messages from storage`)
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load conversation history:", error)
      this.conversationHistory = []
    }

    const duration = performance.now() - startTime
    this.logPerformance("loadConversationHistory", duration)
    console.log(`✅ Conversation history loaded in ${duration.toFixed(2)}ms`)

    return [...this.conversationHistory]
  }

  public async loadMemorySystem(): Promise<void> {
    console.log("🧠 Loading memory system...")
    const startTime = performance.now()

    try {
      const stored = localStorage.getItem("diagnostic-ai-memory")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.memory = new Map(parsed)
          console.log(`🧠 Loaded ${this.memory.size} memory entries`)
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load memory system:", error)
      this.memory = new Map()
    }

    const duration = performance.now() - startTime
    this.logPerformance("loadMemorySystem", duration)
    console.log(`✅ Memory system loaded in ${duration.toFixed(2)}ms`)
  }

  public async finalizeInitialization(): Promise<void> {
    console.log("🎯 Finalizing initialization...")
    const startTime = performance.now()

    // Any final setup tasks
    await new Promise((resolve) => setTimeout(resolve, 10)) // Minimal delay

    const duration = performance.now() - startTime
    this.logPerformance("finalizeInitialization", duration)
    console.log(`✅ Initialization finalized in ${duration.toFixed(2)}ms`)
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    console.log(`🤖 Processing: "${userMessage}"`)
    const startTime = performance.now()

    try {
      // Learn from user input
      this.learnFromMessage(userMessage)

      // Check if it's a math question first
      const mathResult = this.processMathQuery(userMessage)
      if (mathResult) {
        this.saveConversation(userMessage, mathResult.content)
        const duration = performance.now() - startTime
        this.logPerformance("processMessage", duration)
        console.log(`✅ Math response generated in ${duration.toFixed(2)}ms`)
        return mathResult
      }

      // Generate regular response
      const response = this.generateResponse(userMessage)
      this.saveConversation(userMessage, response.content)

      const duration = performance.now() - startTime
      this.logPerformance("processMessage", duration)
      console.log(`✅ Response generated in ${duration.toFixed(2)}ms`)

      return response
    } catch (error) {
      console.error("❌ Error processing message:", error)
      const duration = performance.now() - startTime
      this.logPerformance("processMessage", duration)

      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.1,
      }
    }
  }

  private processMathQuery(message: string): AIResponse | null {
    const lowerMessage = message.toLowerCase()

    // Mathematical expression patterns
    const mathPatterns = [
      { pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/, operation: "add" },
      { pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/, operation: "subtract" },
      { pattern: /(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)/, operation: "multiply" },
      { pattern: /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/, operation: "divide" },
      { pattern: /(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/, operation: "power" },
      { pattern: /sqrt\s*$$\s*(\d+(?:\.\d+)?)\s*$$/, operation: "sqrt" },
      { pattern: /sin\s*$$\s*(\d+(?:\.\d+)?)\s*$$/, operation: "sin" },
      { pattern: /cos\s*$$\s*(\d+(?:\.\d+)?)\s*$$/, operation: "cos" },
      { pattern: /tan\s*$$\s*(\d+(?:\.\d+)?)\s*$$/, operation: "tan" },
    ]

    for (const { pattern, operation } of mathPatterns) {
      const match = message.match(pattern)
      if (match) {
        const mathFunc = this.mathFunctions.get(operation)
        if (mathFunc) {
          try {
            const numbers = match.slice(1).map((n) => Number.parseFloat(n))
            const result = mathFunc.func(...numbers)

            console.log(`🔢 Math calculation: ${operation}(${numbers.join(", ")}) = ${result}`)

            return {
              content: `The result is: ${result}`,
              confidence: 0.95,
            }
          } catch (error) {
            console.error("❌ Math calculation error:", error)
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
        content:
          "I can help with math! Try expressions like '2 + 3', 'sqrt(16)', 'sin(30)', or ask me to calculate something.",
        confidence: 0.8,
      }
    }

    return null
  }

  private generateResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase()

    // Check for memory queries
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
          "Hello! I'm running in diagnostic mode. How can I help you today?",
          "Hi there! The system is performing well. What would you like to try?",
          "Hey! All systems are operational. What's on your mind?",
        ],
        confidence: 0.9,
      },
      {
        patterns: ["how are you", "how do you feel", "performance"],
        responses: [
          `I'm performing well! Average response time: ${this.getAverageResponseTime().toFixed(0)}ms`,
          `System status: Operational. ${this.vocabulary.size} words loaded, ${this.mathFunctions.size} math functions ready.`,
          `All systems green! Memory usage is optimal and response times are good.`,
        ],
        confidence: 0.85,
      },
      {
        patterns: ["what can you do", "capabilities"],
        responses: [
          "I can chat, solve math problems, remember information, and provide diagnostic information about my performance!",
          "My capabilities include: mathematical calculations, memory storage, conversation, and system diagnostics.",
          "I'm a diagnostic AI that can handle math, memory, chat, and performance monitoring!",
        ],
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

    // Default response
    return {
      content: "I understand. What would you like to explore? I can help with math, remember things, or just chat!",
      confidence: 0.6,
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

    // Extract memory patterns
    this.extractMemoryFromMessage(message)
  }

  private extractMemoryFromMessage(message: string): void {
    const memoryPatterns = [
      { pattern: /remember (?:that )?(.+)/i, importance: 0.8 },
      { pattern: /my name is (.+)/i, importance: 0.9 },
      { pattern: /i (?:am|work as) (?:a |an )?(.+)/i, importance: 0.7 },
      { pattern: /i like (.+)/i, importance: 0.6 },
    ]

    memoryPatterns.forEach(({ pattern, importance }) => {
      const match = message.match(pattern)
      if (match && match[1]) {
        const key = match[1].toLowerCase().replace(/\s+/g, "_").substring(0, 20)
        const entry: MemoryEntry = {
          key,
          value: match[1].trim(),
          timestamp: Date.now(),
          importance,
        }
        this.memory.set(key, entry)
        console.log(`🧠 Stored memory: ${entry.value}`)
      }
    })
  }

  private searchMemory(query: string): string | null {
    const queryLower = query.toLowerCase()

    for (const [key, entry] of this.memory.entries()) {
      if (queryLower.includes(key.replace(/_/g, " ")) || queryLower.includes(entry.value.toLowerCase())) {
        return `I remember that ${entry.value}. I stored this on ${new Date(entry.timestamp).toLocaleDateString()}.`
      }
    }

    if (queryLower.includes("remember") && this.memory.size > 0) {
      const recentMemories = Array.from(this.memory.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3)

      const memoryList = recentMemories.map((m) => m.value).join(", ")
      return `I remember several things: ${memoryList}. Is there something specific you'd like me to recall?`
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

    // Keep only recent conversations
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-40)
    }

    // Save to localStorage
    try {
      localStorage.setItem("diagnostic-ai-conversation", JSON.stringify(this.conversationHistory))
      localStorage.setItem("diagnostic-ai-memory", JSON.stringify(Array.from(this.memory.entries())))
    } catch (error) {
      console.warn("⚠️ Failed to save to localStorage:", error)
    }
  }

  private logPerformance(operation: string, duration: number): void {
    this.performanceLog.push({
      operation,
      duration,
      timestamp: Date.now(),
    })

    // Keep only recent performance data
    if (this.performanceLog.length > 100) {
      this.performanceLog = this.performanceLog.slice(-50)
    }
  }

  private getAverageResponseTime(): number {
    const responseTimes = this.performanceLog
      .filter((log) => log.operation === "processMessage")
      .map((log) => log.duration)

    return responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0
  }

  // Public getters for diagnostics
  public getVocabularySize(): number {
    return this.vocabulary.size
  }

  public getMathFunctionCount(): number {
    return this.mathFunctions.size
  }

  public getMemoryEntryCount(): number {
    return this.memory.size
  }

  public getPerformanceLog(): Array<{ operation: string; duration: number; timestamp: number }> {
    return [...this.performanceLog]
  }
}
