import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedKnowledgeSystem } from "./enhanced-knowledge-system"
import { EnhancedMathProcessor } from "./enhanced-math-processor"

// FIXED COGNITIVE AI SYSTEM - Enhanced with Online Sources and Learned Knowledge
export class CognitiveAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private enhancedMath = new EnhancedMathProcessor()
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

    // Enhanced processing with online sources and learned knowledge
    let response: AIResponse

    // Check if it's a math problem
    const mathAnalysis = this.enhancedMath.analyzeMathExpression(userMessage)
    if (mathAnalysis.isMatch) {
      response = {
        content: this.generateMathResponse(mathAnalysis),
        confidence: mathAnalysis.confidence,
        reasoning: mathAnalysis.reasoning,
        mathAnalysis: mathAnalysis,
      }
    }
    // Check if it's asking about recently learned words
    else if (this.isAskingAboutLearnedWords(userMessage)) {
      response = await this.handleLearnedWordsQuery(userMessage)
    }
    // Check if it's a word definition request
    else if (this.isDefinitionRequest(userMessage)) {
      response = await this.handleDefinitionRequest(userMessage)
    }
    // Check if it's a science/general knowledge request
    else if (this.isKnowledgeRequest(userMessage)) {
      response = await this.handleKnowledgeRequest(userMessage)
    }
    // Default conversational response
    else {
      response = {
        content: this.generateConversationalResponse(userMessage),
        confidence: 0.8,
        reasoning: ["Generated conversational response based on context and personal information"],
      }
    }

    await this.saveConversation(userMessage, response.content)
    return response
  }

  private generateMathResponse(analysis: any): string {
    if (analysis.result !== undefined) {
      let response = `🧮 **Mathematical Calculation**\n\n`
      response += `**Problem:** ${analysis.numbers.join(` ${this.getOperationSymbol(analysis.operation)} `)} = **${analysis.result}**\n\n`

      if (analysis.vortexData) {
        response += `**🌀 Vortex Math Analysis:**\n`
        response += `• Digital Root: ${analysis.vortexData.digitalRoot}\n`
        response += `• Pattern: ${analysis.vortexData.isTeslaNumber ? "Tesla Number (3-6-9)" : analysis.vortexData.isVortexNumber ? "Vortex Cycle" : "Standard"}\n\n`
      }

      response += `**🧠 My Reasoning Process:**\n`
      analysis.reasoning.forEach((step: string, index: number) => {
        response += `${index + 1}. ${step}\n`
      })

      return response
    } else {
      return `I tried to solve that math problem but encountered an issue. Could you rephrase it? I can handle addition (+), subtraction (-), multiplication (×), division (÷), and even Tesla/Vortex math patterns!`
    }
  }

  private getOperationSymbol(operation: string): string {
    const symbols = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
      power: "^",
      percentage: "% of",
    }
    return symbols[operation as keyof typeof symbols] || operation
  }

  private isAskingAboutLearnedWords(message: string): boolean {
    const patterns = [
      /what.*(?:did you|have you).*learn/i,
      /do you remember.*(?:word|learn)/i,
      /what.*new.*word/i,
      /recently.*learn/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleLearnedWordsQuery(message: string): Promise<AIResponse> {
    const learnedVocab = this.enhancedKnowledge.getLearnedVocabulary()
    const learnedMath = this.enhancedKnowledge.getLearnedMathematics()

    if (learnedVocab.size === 0 && learnedMath.size === 0) {
      return {
        content:
          "I haven't learned any new words or math concepts in our recent conversations yet. Try asking me to define a word or solve a math problem, and I'll learn from it!",
        confidence: 0.9,
        reasoning: ["Checked learned knowledge stores, found no recent learning"],
      }
    }

    let response = "📚 **Here's what I've recently learned:**\n\n"

    if (learnedVocab.size > 0) {
      response += "**New Vocabulary:**\n"
      Array.from(learnedVocab.entries())
        .slice(-5)
        .forEach(([word, data]) => {
          response += `• **${word}**: ${data.meanings?.[0]?.definitions?.[0]?.definition || "Definition learned"}\n`
        })
      response += "\n"
    }

    if (learnedMath.size > 0) {
      response += "**New Math Concepts:**\n"
      Array.from(learnedMath.entries())
        .slice(-3)
        .forEach(([concept, data]) => {
          response += `• **${concept}**: ${data.method || "Mathematical pattern"}\n`
        })
    }

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Retrieved and formatted recently learned knowledge"],
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

    // First check if we already learned this word
    const learnedWord = this.enhancedKnowledge.getLearnedVocabulary().get(word.toLowerCase())
    if (learnedWord) {
      return {
        content: this.formatWordDefinition(learnedWord, true),
        confidence: 0.95,
        reasoning: ["Retrieved definition from learned vocabulary"],
      }
    }

    // Look it up online with timeout
    try {
      const wordData = await Promise.race([
        this.enhancedKnowledge.lookupWord(word),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Lookup timeout")), 3000)),
      ])

      if (wordData) {
        return {
          content: this.formatWordDefinition(wordData, false),
          confidence: 0.9,
          reasoning: ["Successfully looked up word definition online", "Stored in learned vocabulary for future use"],
        }
      }
    } catch (error) {
      console.warn("Word lookup timed out or failed:", error)
    }

    return {
      content: `I couldn't find a definition for "${word}" right now. This might be due to network issues. Try again later or ask about something else!`,
      confidence: 0.4,
      reasoning: ["Online dictionary lookup failed or timed out"],
    }
  }

  private formatWordDefinition(wordData: any, wasAlreadyLearned: boolean): string {
    let response = `📖 **Definition of "${wordData.word}"**\n\n`

    if (wordData.phonetics && wordData.phonetics.length > 0) {
      response += `**Pronunciation:** ${wordData.phonetics[0].text || "N/A"}\n\n`
    }

    if (wordData.meanings && wordData.meanings.length > 0) {
      response += `**Meanings:**\n`
      wordData.meanings.slice(0, 2).forEach((meaning: any, index: number) => {
        response += `${index + 1}. **${meaning.partOfSpeech}**: ${meaning.definitions[0].definition}\n`
        if (meaning.definitions[0].example) {
          response += `   *Example: "${meaning.definitions[0].example}"*\n`
        }
      })
      response += "\n"
    }

    if (wordData.synonyms && wordData.synonyms.length > 0) {
      response += `**Synonyms:** ${wordData.synonyms.slice(0, 5).join(", ")}\n\n`
    }

    if (wasAlreadyLearned) {
      response += `✅ I already knew this word from our previous conversations!`
    } else {
      response += `✨ I've learned this word and will remember it for future conversations!`
    }

    return response
  }

  private isKnowledgeRequest(message: string): boolean {
    const patterns = [/tell me about/i, /what.*know.*about/i, /explain.*science/i, /how.*work/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleKnowledgeRequest(message: string): Promise<AIResponse> {
    // Extract the topic from the message
    const topicMatch = message.match(/(?:tell me about|what.*about|explain)\s+(.+)/i)
    const topic = topicMatch ? topicMatch[1].trim().replace(/[?!.]/g, "") : message

    const scientificData = await this.enhancedKnowledge.lookupScientificConcept(topic)
    if (scientificData) {
      let response = `🔬 **${scientificData.title}**\n\n`
      response += `${scientificData.extract}\n\n`
      response += `📚 *Source: Wikipedia*\n`
      response += `🔗 [Learn more](${scientificData.url})\n\n`
      response += `✨ I've learned about this topic and will remember it!`

      return {
        content: response,
        confidence: 0.85,
        reasoning: ["Successfully looked up scientific concept", "Stored in learned knowledge base"],
      }
    }

    return {
      content: `I'd love to help you learn about "${topic}" but I couldn't find detailed information right now. Try asking about specific scientific concepts, historical events, or general knowledge topics!`,
      confidence: 0.5,
      reasoning: ["Could not find information about requested topic"],
    }
  }

  private generateConversationalResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    // Personal info detection
    if (lowerMessage.includes("my name is") || lowerMessage.includes("i am")) {
      return `Thank you for sharing that information with me! I'll remember this in my personal memory system. I'm constantly learning and can now help with math problems, look up word definitions online, and even explore scientific concepts together!`
    }

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello! I'm excited to chat with you. I can help with math calculations (including Tesla/Vortex math), look up word definitions, explore scientific concepts, and remember personal information about you. What would you like to explore?`
    }

    // Default response
    return `I understand you said: "${userMessage}". I'm an enhanced AI with access to online dictionaries, mathematical tools including Tesla/Vortex math, and scientific knowledge. I can learn new words and concepts from our conversations. What would you like to explore together?`
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Enhanced Cognitive AI System...")

      // Load learned knowledge with timeout
      try {
        await Promise.race([
          this.enhancedKnowledge.loadLearnedKnowledge(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
        ])
      } catch (error) {
        console.warn("Learned knowledge loading timed out (non-critical):", error)
      }

      // Load other data with error handling
      try {
        await this.loadConversationHistory()
      } catch (error) {
        console.warn("Conversation history loading failed (non-critical):", error)
      }

      try {
        await this.loadMemory()
      } catch (error) {
        console.warn("Memory loading failed (non-critical):", error)
      }

      try {
        await this.loadVocabulary()
      } catch (error) {
        console.warn("Vocabulary loading failed (non-critical):", error)
      }

      this.systemStatus = "ready"
      this.isInitialized = true

      console.log("✅ Enhanced Cognitive AI System ready (with fallbacks)!")
    } catch (error) {
      console.error("❌ Initialization failed, using fallbacks:", error)
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
    const knowledgeStats = this.enhancedKnowledge.getKnowledgeStats()

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size + knowledgeStats.learnedVocabulary,
      memoryEntries: totalUserInfo,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 144 + knowledgeStats.learnedMathematics, // Base + learned
      seedProgress: 0,
      responseTime: 0,
      // Enhanced data access
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: new Map(),
      // New learned knowledge stats
      learnedVocabulary: knowledgeStats.learnedVocabulary,
      learnedMathematics: knowledgeStats.learnedMathematics,
      learnedScience: knowledgeStats.learnedScience,
      onlineSourcesAvailable: knowledgeStats.onlineSourcesAvailable,
    }
  }

  // Keep all existing methods for compatibility...
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
      "vortex",
      "tesla",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
  }

  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
      { category: "mathematics", fact: "Tesla's 3-6-9 pattern reveals the fundamental structure of the universe" },
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
    return 144 + this.enhancedKnowledge.getKnowledgeStats().learnedMathematics
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
    return [
      { text: "Tell me about yourself", type: "question" },
      { text: "What can you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
      { text: "What did you learn recently?", type: "question" },
      { text: "Define quantum computing", type: "action" },
      { text: "Tesla math for 12", type: "action" },
    ]
  }

  public generateResponseSuggestions(userInput: string, response: string): string[] {
    return ["Tell me more", "What else?", "Can you explain that?", "What did you learn?"]
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
      learnedKnowledge: this.enhancedKnowledge.getKnowledgeStats(),
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
