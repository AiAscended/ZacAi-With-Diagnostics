import { BrowserStorageManager } from "./browser-storage-manager"

// FIXED COGNITIVE AI SYSTEM - Enhanced with Personal Info Storage
export class CognitiveAISystem {
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

    // Check if asking about personal info
    if (this.isAskingAboutPersonalInfo(userMessage)) {
      return await this.handlePersonalInfoQuery(userMessage)
    }

    // Check if it's a math problem
    if (this.isMathProblem(userMessage)) {
      return this.handleMathProblem(userMessage)
    }

    // Check if it's a word definition request
    if (this.isDefinitionRequest(userMessage)) {
      return await this.handleDefinitionRequest(userMessage)
    }

    // Default conversational response
    const response = {
      content: this.generateConversationalResponse(userMessage),
      confidence: 0.8,
      reasoning: ["Generated conversational response based on context and personal information"],
    }

    await this.saveConversation(userMessage, response.content)
    return response
  }

  private isAskingAboutPersonalInfo(message: string): boolean {
    const patterns = [
      /what.*(?:do you|can you).*remember.*(?:about me|me)/i,
      /do you.*(?:know|remember).*(?:about me|me|my name)/i,
      /what.*(?:know|remember).*(?:about me|me)/i,
      /tell me.*what.*(?:know|remember)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handlePersonalInfoQuery(message: string): Promise<AIResponse> {
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

  private isMathProblem(message: string): boolean {
    const mathPatterns = [
      /\d+\s*[+\-*/×÷]\s*\d+/,
      /calculate|math|solve|what.*is.*\d+/i,
      /\d+\s*(?:plus|minus|times|divided by|multiplied by)\s*\d+/i,
    ]
    return mathPatterns.some((pattern) => pattern.test(message))
  }

  private handleMathProblem(message: string): AIResponse {
    // Simple math processing
    const mathMatch = message.match(/(\d+)\s*[+\-*/×÷]\s*(\d+)/)
    if (mathMatch) {
      const num1 = Number.parseInt(mathMatch[1])
      const num2 = Number.parseInt(mathMatch[2])
      const operator = message.match(/[+\-*/×÷]/)?.[0]

      let result: number
      let operation: string

      switch (operator) {
        case "+":
          result = num1 + num2
          operation = "addition"
          break
        case "-":
          result = num1 - num2
          operation = "subtraction"
          break
        case "*":
        case "×":
          result = num1 * num2
          operation = "multiplication"
          break
        case "/":
        case "÷":
          result = num1 / num2
          operation = "division"
          break
        default:
          return {
            content: "I couldn't understand that math problem. Try using +, -, ×, or ÷",
            confidence: 0.3,
            reasoning: ["Unknown math operator"],
          }
      }

      return {
        content: `🧮 **Mathematical Calculation**\n\n**Problem:** ${num1} ${operator} ${num2} = **${result}**\n\n**Operation:** ${operation}\n\n**🧠 My Reasoning Process:**\n1. Identified ${operation} problem\n2. Calculated ${num1} ${operator} ${num2}\n3. Result: ${result}`,
        confidence: 0.95,
        reasoning: [`Performed ${operation}`, `${num1} ${operator} ${num2} = ${result}`],
      }
    }

    return {
      content: "I can help with basic math! Try something like '25 + 17' or '100 ÷ 4'",
      confidence: 0.6,
      reasoning: ["Could not parse math expression"],
    }
  }

  private isDefinitionRequest(message: string): boolean {
    const patterns = [/what\s+(?:is|does|means?)\s+(.+)/i, /define\s+(.+)/i, /meaning\s+of\s+(.+)/i, /explain\s+(.+)/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleDefinitionRequest(message: string): Promise<AIResponse> {
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

    // Simple definition responses for common words
    const simpleDefinitions: { [key: string]: string } = {
      hello: "A greeting used when meeting someone",
      computer: "An electronic device that processes data",
      ai: "Artificial Intelligence - computer systems that can perform tasks typically requiring human intelligence",
      love: "A strong feeling of affection or deep care for someone or something",
      water: "A clear liquid essential for life, with the chemical formula H2O",
      sun: "The star at the center of our solar system that provides light and heat to Earth",
    }

    const definition = simpleDefinitions[word.toLowerCase()]
    if (definition) {
      return {
        content: `📖 **Definition of "${word}"**\n\n${definition}\n\n✨ I've provided a basic definition from my knowledge base!`,
        confidence: 0.8,
        reasoning: ["Found definition in basic knowledge base"],
      }
    }

    return {
      content: `I don't have a definition for "${word}" in my current knowledge base. I can help with basic words like 'computer', 'ai', 'love', 'water', etc.`,
      confidence: 0.4,
      reasoning: ["Word not found in basic knowledge base"],
    }
  }

  private generateConversationalResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    // Get user's name if we have it
    const nameEntry = this.personalInfo.get("name")
    const userName = nameEntry ? nameEntry.value : ""

    // Personal info detection
    if (lowerMessage.includes("my name is") || lowerMessage.includes("i am")) {
      return `Thank you for sharing that information with me${userName ? `, ${userName}` : ""}! I'll remember this in my personal memory system. I'm constantly learning and can help with basic math problems, simple word definitions, and remember personal information about you!`
    }

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello${userName ? ` ${userName}` : ""}! I'm excited to chat with you. I can help with basic math calculations, simple word definitions, and remember personal information about you. What would you like to explore?`
    }

    // Default response
    return `I understand you said: "${userMessage}". I'm an AI that can help with basic math, simple definitions, and personal information storage${userName ? `. Nice to chat with you, ${userName}` : ""}! What would you like to explore together?`
  }

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

        // Save to localStorage immediately
        this.savePersonalInfo()
      }
    })
  }

  private savePersonalInfo(): void {
    try {
      const personalInfoArray = Array.from(this.personalInfo.entries())
      localStorage.setItem("cognitive-ai-personal-info", JSON.stringify(personalInfoArray))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  private loadPersonalInfo(): void {
    try {
      const stored = localStorage.getItem("cognitive-ai-personal-info")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.personalInfo = new Map(parsed)
          console.log(`Loaded ${this.personalInfo.size} personal info entries`)
        }
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
      this.personalInfo = new Map()
    }
  }

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

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Enhanced Cognitive AI System...")

      await this.loadConversationHistory()
      await this.loadMemory()
      await this.loadVocabulary()
      this.loadPersonalInfo() // Load personal info

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

    const totalUserInfo = this.personalInfo.size

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: totalUserInfo,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 4, // Basic math operations
      seedProgress: 0,
      responseTime: 0,
      // Enhanced data access
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: new Map(),
      // Basic stats
      learnedVocabulary: 0,
      learnedMathematics: 0,
      learnedScience: 0,
      onlineSourcesAvailable: false,
    }
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
      "define",
      "meaning",
      "word",
      "learn",
      "learned",
      "new",
      "recent",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
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
  }

  // All other existing methods remain the same...
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
    return 4 // Basic math operations
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
    return [
      { text: "My name is [your name]", type: "action" },
      { text: "What do you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
      { text: "What is computer?", type: "question" },
      { text: "Define love", type: "action" },
      { text: "Hello there!", type: "greeting" },
    ]
  }

  public generateResponseSuggestions(userInput: string, response: string): string[] {
    return ["Tell me more", "What else?", "Can you explain that?", "That's interesting!"]
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

      await this.storageManager.clearAllData()
      localStorage.removeItem("cognitive-ai-personal-info")
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

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}
