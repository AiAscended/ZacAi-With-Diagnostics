import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedKnowledgeSystem } from "./enhanced-knowledge-system"
import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"

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

  // Add these new properties
  private systemIdentity: any = null
  private systemCapabilities: string[] = []
  private knowledgeSources: any = null
  private learnedVocabulary: Map<string, any> = new Map()
  private learnedMathematics: Map<string, any> = new Map()
  private learnedScience: Map<string, any> = new Map()
  private learnedCoding: Map<string, any> = new Map()

  private temporalSystem = new TemporalKnowledgeSystem()

  constructor() {
    this.initializeBasicVocabulary()
    this.initializeSampleFacts()
    // Remove this line: this.loadSystemIdentity()
  }

  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      console.log("🔄 System not initialized, initializing now...")
      await this.initialize()
    }

    console.log("🚀 Processing message with enhanced cognitive system:", userMessage)

    // Store the message for learning
    this.extractAndStorePersonalInfo(userMessage)

    let response: AIResponse

    try {
      // NEW: Check if it's a date/time query FIRST
      if (this.enhancedKnowledge.isDateTimeQuery(userMessage)) {
        response = {
          content: this.enhancedKnowledge.handleDateTimeQuery(userMessage),
          confidence: 0.95,
          reasoning: ["Processed date/time query using temporal knowledge system"],
        }
      }
      // Check if it's a math problem
      else if (this.enhancedMath.analyzeMathExpression(userMessage).isMatch) {
        const mathAnalysis = this.enhancedMath.analyzeMathExpression(userMessage)

        try {
          const enhancedMathResult = await Promise.race([
            this.enhancedKnowledge.processMathProblem(userMessage),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Math timeout")), 3000)),
          ])

          response = {
            content: this.generateEnhancedMathResponse(mathAnalysis, enhancedMathResult),
            confidence: enhancedMathResult.confidence || mathAnalysis.confidence,
            reasoning: [...(mathAnalysis.reasoning || []), "Enhanced with online math APIs"],
            mathAnalysis: { ...mathAnalysis, enhancedResult: enhancedMathResult },
          }
        } catch (error) {
          console.warn("Enhanced math processing failed, using local:", error)
          response = {
            content: this.generateMathResponse(mathAnalysis),
            confidence: mathAnalysis.confidence,
            reasoning: mathAnalysis.reasoning,
            mathAnalysis: mathAnalysis,
          }
        }
      }
      // Check for learned content queries
      else if (this.isAskingAboutLearnedContent(userMessage)) {
        response = await this.handleLearnedContentQuery(userMessage)
      }
      // Check for definition requests
      else if (this.isDefinitionRequest(userMessage)) {
        response = await this.handleDefinitionRequest(userMessage)
      }
      // Check for knowledge requests
      else if (this.isKnowledgeRequest(userMessage)) {
        response = await this.handleKnowledgeRequest(userMessage)
      }
      // Check for coding requests
      else if (this.isCodingRequest(userMessage)) {
        response = await this.handleCodingRequest(userMessage)
      }
      // Identity questions
      else if (this.isIdentityQuestion(userMessage)) {
        response = await this.handleIdentityQuestion(userMessage)
      }
      // Default conversational response
      else {
        response = {
          content: this.generateConversationalResponse(userMessage),
          confidence: 0.8,
          reasoning: ["Generated conversational response based on context and personal information"],
        }
      }

      // Save the conversation
      await this.saveConversation(userMessage, response.content)

      return response
    } catch (error) {
      console.error("Error in message processing:", error)
      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.3,
        reasoning: ["Error occurred during message processing"],
      }
    }
  }

  private generateEnhancedMathResponse(localAnalysis: any, enhancedResult: any): string {
    let response = `🧮 **Enhanced Mathematical Calculation**\n\n`

    if (enhancedResult.result !== undefined) {
      response += `**Problem:** ${
        localAnalysis.numbers?.join(` ${this.getOperationSymbol(localAnalysis.operation)} `) ||
        "Mathematical expression"
      } = **${enhancedResult.result}**\n\n`

      if (enhancedResult.method) {
        response += `**Method Used:** ${enhancedResult.method} (${enhancedResult.source})\n\n`
      }

      if (localAnalysis.vortexData) {
        response += `**🌀 Vortex Math Analysis:**\n`
        response += `• Digital Root: ${localAnalysis.vortexData.digitalRoot}\n`
        response += `• Pattern: ${
          localAnalysis.vortexData.isTeslaNumber
            ? "Tesla Number (3-6-9)"
            : localAnalysis.vortexData.isVortexNumber
              ? "Vortex Cycle"
              : "Standard"
        }\n\n`
      }

      response += `**🧠 My Enhanced Reasoning Process:**\n`
      if (localAnalysis.reasoning) {
        localAnalysis.reasoning.forEach((step: string, index: number) => {
          response += `${index + 1}. ${step}\n`
        })
      }
      response += `• Used online mathematical APIs for verification\n`
      response += `• Stored this mathematical pattern for future use\n`
    }

    return response
  }

  private generateMathResponse(analysis: any): string {
    let response = `🧮 **Mathematical Calculation**\n\n`

    if (analysis.result !== undefined) {
      response += `**Problem:** ${
        analysis.numbers?.join(` ${this.getOperationSymbol(analysis.operation)} `) || "Mathematical expression"
      } = **${analysis.result}**\n\n`

      if (analysis.vortexData) {
        response += `**🌀 Vortex Math Analysis:**\n`
        response += `• Digital Root: ${analysis.vortexData.digitalRoot}\n`
        response += `• Pattern: ${
          analysis.vortexData.isTeslaNumber
            ? "Tesla Number (3-6-9)"
            : analysis.vortexData.isVortexNumber
              ? "Vortex Cycle"
              : "Standard"
        }\n`
        response += `• Analysis: ${analysis.vortexData.analysis}\n\n`
      }

      response += `**🧠 My Reasoning Process:**\n`
      if (analysis.reasoning) {
        analysis.reasoning.forEach((step: string, index: number) => {
          response += `${index + 1}. ${step}\n`
        })
      }
    }

    return response
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

  private isAskingAboutLearnedContent(message: string): boolean {
    const patterns = [
      /what.*(?:did you|have you).*learn/i,
      /do you remember.*(?:word|concept|learn)/i,
      /what.*new.*(?:word|concept|knowledge)/i,
      /recently.*learn/i,
      /show.*(?:learned|knowledge)/i,
      /what.*(?:know|remember).*about/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleLearnedContentQuery(message: string): Promise<AIResponse> {
    const stats = this.enhancedKnowledge.getKnowledgeStats()

    if (stats.totalLearned === 0) {
      return {
        content:
          "I haven't learned any new concepts in our recent conversations yet. Try asking me to define a word, solve a math problem, explain a science concept, or help with coding, and I'll learn from it!",
        confidence: 0.9,
        reasoning: ["Checked all learned knowledge stores, found no recent learning"],
      }
    }

    let response = `📚 **Here's what I've recently learned:**\n\n`

    const vocab = this.enhancedKnowledge.getLearnedVocabulary()
    const math = this.enhancedKnowledge.getLearnedMathematics()
    const science = this.enhancedKnowledge.getLearnedScience()
    const coding = this.enhancedKnowledge.getLearnedCoding()

    if (vocab.size > 0) {
      response += `**📖 New Vocabulary (${vocab.size} words):**\n`
      Array.from(vocab.entries())
        .slice(-3)
        .forEach(([word, data]) => {
          response += `• **${word}**: ${
            data.meanings?.[0]?.definitions?.[0]?.definition || data.extract || "Definition learned"
          }\n`
        })
      response += "\n"
    }

    if (math.size > 0) {
      response += `**🧮 New Math Concepts (${math.size} patterns):**\n`
      Array.from(math.entries())
        .slice(-3)
        .forEach(([concept, data]) => {
          response += `• **${concept}**: ${data.method || data.type || "Mathematical pattern"}\n`
        })
      response += "\n"
    }

    if (science.size > 0) {
      response += `**🔬 New Science Knowledge (${science.size} concepts):**\n`
      Array.from(science.entries())
        .slice(-3)
        .forEach(([concept, data]) => {
          response += `• **${data.title || concept}**: ${(data.extract || "").substring(0, 100)}...\n`
        })
      response += "\n"
    }

    if (coding.size > 0) {
      response += `**💻 New Coding Knowledge (${coding.size} concepts):**\n`
      Array.from(coding.entries())
        .slice(-3)
        .forEach(([concept, data]) => {
          response += `• **${data.concept || concept}** (${data.language}): ${
            data.description || "Coding concept learned"
          }\n`
        })
      response += "\n"
    }

    response += `**📊 Total Learning Stats:**\n`
    response += `• Total items learned: ${stats.totalLearned}\n`
    response += `• API sources available: ${stats.apiStatus.totalAPIs}\n`
    response += `• Last updated: ${this.temporalSystem.getRelativeTime(stats.lastUpdate)}\n`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Retrieved and formatted all recently learned knowledge across categories"],
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

  private isCodingRequest(message: string): boolean {
    const patterns = [
      /(?:how.*(?:code|program|develop))/i,
      /(?:javascript|typescript|react|nextjs|css|html)/i,
      /(?:function|component|api|hook)/i,
      /(?:explain.*(?:code|programming))/i,
      /(?:help.*(?:coding|programming))/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleCodingRequest(message: string): Promise<AIResponse> {
    // Extract coding concept and language
    const conceptMatch = message.match(/(?:explain|help.*with|how.*(?:code|create|build))\s+(.+)/i)
    const concept = conceptMatch ? conceptMatch[1].trim().replace(/[?!.]/g, "") : message

    // Detect language
    let language = "javascript" // default
    if (message.toLowerCase().includes("react")) language = "react"
    else if (message.toLowerCase().includes("nextjs") || message.toLowerCase().includes("next.js")) language = "nextjs"
    else if (message.toLowerCase().includes("typescript")) language = "typescript"
    else if (message.toLowerCase().includes("css")) language = "css"
    else if (message.toLowerCase().includes("html")) language = "html"

    try {
      const codingData = await this.enhancedKnowledge.lookupCodingConcept(concept, language)

      if (codingData) {
        let response = `💻 **${language.toUpperCase()} - ${codingData.concept || concept}**\n\n`
        response += `${codingData.description || "Coding information found"}\n\n`

        if (codingData.url) {
          response += `🔗 **Resource**: [Learn more](${codingData.url})\n\n`
        }

        response += `📚 *Source: ${codingData.source}*\n`
        response += `✨ I've learned about this coding concept and will remember it!`

        return {
          content: response,
          confidence: 0.85,
          reasoning: ["Successfully looked up coding concept", "Stored in learned coding knowledge base"],
        }
      }
    } catch (error) {
      console.warn("Coding lookup failed:", error)
    }

    return {
      content: `I'd love to help you with ${language} and "${concept}" but I couldn't find detailed information right now. Try asking about specific React components, JavaScript functions, or Next.js features!`,
      confidence: 0.5,
      reasoning: ["Could not find information about requested coding concept"],
    }
  }

  private isIdentityQuestion(message: string): boolean {
    const patterns = [
      /(?:what.*your.*name|who.*you|what.*you)/i,
      /(?:tell.*about.*yourself|introduce.*yourself)/i,
      /(?:what.*can.*you.*do|your.*capabilities)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleIdentityQuestion(message: string): Promise<AIResponse> {
    // Ensure system identity is loaded
    if (!this.systemIdentity?.name) {
      console.log("🔄 System identity not loaded, attempting to load now...")
      await this.loadSystemIdentity()
    }

    const currentTime = this.temporalSystem.getCurrentDateTime()
    const stats = this.getStats()

    let response = ""

    if (message.toLowerCase().includes("name") || message.toLowerCase().includes("who")) {
      const name = this.systemIdentity?.name || "ZacAI"
      const version = this.systemIdentity?.version || "2.0.0"
      response = `👋 **Hello! I'm ${name} v${version}**\n\n`
      response += `${this.systemIdentity?.purpose || "I'm an AI assistant designed to help you learn and solve problems."}\n\n`
      response += `**🕐 Current Time**: ${currentTime.formatted.full}\n`
      response += `**📚 Knowledge Stats**: ${stats.totalLearned || 0} concepts learned\n`
      response += `**🧮 Math Functions**: ${stats.mathFunctions} available\n\n`
      response += `I can help with math (including Tesla/Vortex patterns), definitions, science concepts, coding, and I remember our conversations!`
    } else if (message.toLowerCase().includes("capabilities") || message.toLowerCase().includes("what can you do")) {
      const name = this.systemIdentity?.name || "ZacAI"
      response = `🚀 **${name} Capabilities**\n\n`

      if (this.systemCapabilities.length > 0) {
        response += `**Core Capabilities:**\n`
        this.systemCapabilities.slice(0, 6).forEach((capability, index) => {
          response += `${index + 1}. ${capability}\n`
        })
      } else {
        response += `**Core Capabilities:**\n`
        response += `1. Mathematical calculations including Tesla/Vortex math\n`
        response += `2. Word definitions and vocabulary learning\n`
        response += `3. Scientific concept research and explanation\n`
        response += `4. Coding assistance with React/Next.js/JavaScript\n`
        response += `5. Personal memory and conversation history\n`
      }

      response += `\n**📊 Current Stats:**\n`
      response += `• Total learned concepts: ${stats.totalLearned}\n`
      response += `• Conversation messages: ${stats.totalMessages}\n`
      response += `• System status: ${stats.systemStatus}\n`
    } else {
      response = this.generateConversationalResponse(message)
    }

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Generated identity response with current system information"],
    }
  }

  private generateConversationalResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    // Identity questions - ensure we have system identity
    if (lowerMessage.includes("what is your name") || lowerMessage.includes("who are you")) {
      const name = this.systemIdentity?.name || "ZacAI"
      const version = this.systemIdentity?.version || "2.0.0"
      const purpose = this.systemIdentity?.purpose || "an AI assistant designed to help you learn and solve problems"

      return `Hello! I'm ${name} v${version}, ${purpose}. I can help with math calculations (including Tesla/Vortex math), look up word definitions, explore scientific concepts, assist with React/Next.js coding, and remember personal information about you. What would you like to explore?`
    }

    // Capability questions
    if (lowerMessage.includes("what can you do") || lowerMessage.includes("your capabilities")) {
      const name = this.systemIdentity?.name || "ZacAI"
      const capabilities =
        this.systemCapabilities.length > 0
          ? this.systemCapabilities.slice(0, 3).join(", ")
          : "mathematical calculations, word definitions, scientific research, coding assistance"

      return `I'm ${name} with many capabilities including: ${capabilities}. I'm constantly learning and expanding my knowledge through our conversations and online research. What would you like help with?`
    }

    // Personal info detection
    if (lowerMessage.includes("my name is") || lowerMessage.includes("i am")) {
      return `Thank you for sharing that information with me! I'll remember this in my personal memory system. I'm constantly learning and can help with math problems, look up word definitions online, and explore scientific concepts together!`
    }

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      const name = this.systemIdentity?.name || "ZacAI"
      return `Hello! I'm ${name} and I'm excited to chat with you. I can help with math calculations (including Tesla/Vortex math), look up word definitions, explore scientific concepts, assist with coding, and remember personal information about you. What would you like to explore?`
    }

    // Default response
    const name = this.systemIdentity?.name || "ZacAI"
    return `I understand you said: "${userMessage}". I'm ${name}, an enhanced AI with access to online dictionaries, mathematical tools including Tesla/Vortex math, scientific knowledge, and coding assistance. I can learn new words and concepts from our conversations. What would you like to explore together?`
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Enhanced Cognitive AI System...")

      // Load system identity with timeout
      try {
        await Promise.race([
          this.loadSystemIdentity(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Identity timeout")), 3000)),
        ])
      } catch (error) {
        console.warn("System identity loading timed out, using defaults:", error)
        this.setDefaultSystemIdentity()
      }

      // Verify system identity loaded
      if (this.systemIdentity?.name) {
        console.log(`✅ System identity: ${this.systemIdentity.name} v${this.systemIdentity.version}`)
      }

      // Load other systems with error handling
      const loadPromises = [
        this.loadLearnedKnowledge().catch((e) => console.warn("Learned knowledge load failed:", e)),
        this.enhancedKnowledge.loadLearnedKnowledge().catch((e) => console.warn("Enhanced knowledge load failed:", e)),
        this.loadConversationHistory().catch((e) => console.warn("Conversation history load failed:", e)),
        this.loadMemory().catch((e) => console.warn("Memory load failed:", e)),
        this.loadVocabulary().catch((e) => console.warn("Vocabulary load failed:", e)),
      ]

      // Load all with timeout
      await Promise.race([
        Promise.allSettled(loadPromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Load timeout")), 5000)),
      ])

      this.systemStatus = "ready"
      this.isInitialized = true

      const name = this.systemIdentity?.name || "ZacAI"
      console.log(`✅ ${name} Enhanced Cognitive AI System ready!`)
    } catch (error) {
      console.error("❌ Initialization failed, using fallbacks:", error)
      this.setDefaultSystemIdentity()
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
    const currentTime = this.temporalSystem.getCurrentDateTime()

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size + knowledgeStats.learnedVocabulary,
      memoryEntries: totalUserInfo,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 144 + knowledgeStats.learnedMathematics,
      seedProgress: 0,
      responseTime: 0,
      // Enhanced data access
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: new Map(),
      // New comprehensive learning stats
      totalLearned: knowledgeStats.totalLearned,
      learnedVocabulary: knowledgeStats.learnedVocabulary,
      learnedMathematics: knowledgeStats.learnedMathematics,
      learnedScience: knowledgeStats.learnedScience,
      learnedCoding: knowledgeStats.learnedCoding,
      apiStatus: knowledgeStats.apiStatus,
      currentDateTime: currentTime,
      batchQueueSize: knowledgeStats.batchQueueSize,
      // System identity
      systemName: this.systemIdentity?.name || "ZacAI",
      systemVersion: this.systemIdentity?.version || "2.0.0",
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

  private async loadSystemIdentity(): Promise<void> {
    try {
      console.log("📋 Loading system identity from seed_system.json...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch("/seed_system.json", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const systemData = await response.json()

        if (systemData.identity) {
          this.systemIdentity = {
            name: systemData.identity.name || "ZacAI",
            version: systemData.identity.version || "2.0.0",
            purpose: systemData.identity.purpose || "To be an intelligent, learning browser-based AI assistant",
            description: systemData.identity.description || "",
            capabilities: systemData.identity.capabilities || [],
          }

          this.systemCapabilities = systemData.core_capabilities || systemData.identity.capabilities || []
          this.knowledgeSources = systemData.knowledge_system || {}

          console.log(`✅ System identity loaded successfully:`)
          console.log(`   Name: ${this.systemIdentity.name}`)
          console.log(`   Version: ${this.systemIdentity.version}`)
          console.log(`   Capabilities: ${this.systemCapabilities.length} items`)
          return
        }
      }

      console.warn("⚠️ seed_system.json not found or invalid, using defaults")
    } catch (error) {
      console.warn("⚠️ Could not load system identity:", error)
    }

    // Set robust defaults
    this.setDefaultSystemIdentity()
  }

  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedVocabulary)
      localStorage.setItem("learnt_vocab", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedVocabulary.size} learned vocabulary entries`)
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }

  private async saveLearnedMathematics(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedMathematics)
      localStorage.setItem("learnt_maths", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedMathematics.size} learned mathematics entries`)
    } catch (error) {
      console.warn("Failed to save learned mathematics:", error)
    }
  }

  private async saveLearnedScience(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedScience)
      localStorage.setItem("learnt_science", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedScience.size} learned science entries`)
    } catch (error) {
      console.warn("Failed to save learned science:", error)
    }
  }

  private async saveLearnedCoding(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedCoding)
      localStorage.setItem("learnt_coding", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedCoding.size} learned coding entries`)
    } catch (error) {
      console.warn("Failed to save learned coding:", error)
    }
  }

  private async loadLearnedKnowledge(): Promise<void> {
    try {
      // Load learned vocabulary
      const vocabData = localStorage.getItem("learnt_vocab")
      if (vocabData) {
        const parsed = JSON.parse(vocabData)
        this.learnedVocabulary = new Map(Object.entries(parsed))
        console.log(`📚 Loaded ${this.learnedVocabulary.size} learned vocabulary entries`)
      }

      // Load learned mathematics
      const mathData = localStorage.getItem("learnt_maths")
      if (mathData) {
        const parsed = JSON.parse(mathData)
        this.learnedMathematics = new Map(Object.entries(parsed))
        console.log(`🧮 Loaded ${this.learnedMathematics.size} learned mathematics entries`)
      }

      // Load learned science
      const scienceData = localStorage.getItem("learnt_science")
      if (scienceData) {
        const parsed = JSON.parse(scienceData)
        this.learnedScience = new Map(Object.entries(parsed))
        console.log(`🔬 Loaded ${this.learnedScience.size} learned science entries`)
      }

      // Load learned coding
      const codingData = localStorage.getItem("learnt_coding")
      if (codingData) {
        const parsed = JSON.parse(codingData)
        this.learnedCoding = new Map(Object.entries(parsed))
        console.log(`💻 Loaded ${this.learnedCoding.size} learned coding entries`)
      }
    } catch (error) {
      console.warn("Failed to load learned knowledge:", error)
    }
  }

  private setDefaultSystemIdentity(): void {
    this.systemIdentity = {
      name: "ZacAI",
      version: "2.0.0",
      purpose:
        "To be an intelligent, learning browser-based AI assistant that helps users with knowledge, conversation, and problem-solving",
    }
    this.systemCapabilities = [
      "Natural language conversation and understanding",
      "Mathematical calculations including Tesla/Vortex math patterns",
      "Word definitions and vocabulary expansion",
      "Scientific concept explanation and research",
      "Coding assistance with React/Next.js/JavaScript/TypeScript",
    ]
    console.log("✅ Default system identity set")
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemStatus: this.systemStatus,
      systemIdentity: this.systemIdentity,
      systemCapabilities: this.systemCapabilities,
      hasKnowledgeSources: !!this.knowledgeSources,
      temporalSystemWorking: !!this.temporalSystem,
      enhancedKnowledgeWorking: !!this.enhancedKnowledge,
      initializationTime: Date.now(),
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
