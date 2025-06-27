"use client"

import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedKnowledgeSystem } from "./enhanced-knowledge-system"
import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"
import { LearntDataManager } from "./learnt-data-manager"

export class UnifiedAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private enhancedMath = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()
  private temporalSystem = new TemporalKnowledgeSystem()
  private learntDataManager = LearntDataManager.getInstance()

  // Core cognitive data stores
  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, VocabularyEntry> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private facts: Map<string, FactEntry> = new Map()
  private mathematics: Map<string, MathEntry> = new Map()

  // System state
  private systemStatus = "idle"
  private isInitialized = false
  private systemIdentity: any = null
  private cognitiveInstructions: any = null

  // PROPERLY LOADED SEED DATA
  private seedMathData: any = null
  private seedVocabData: any = null
  private seedKnowledgeData: any = null
  private seedSystemData: any = null
  private seedLearningData: any = null

  // Learning and API management
  private apiManager: any = null
  private learningQueue: any[] = []

  constructor() {
    // Initialize basic vocabulary and facts
    this.initializeBasicVocabulary()
    this.initializeSampleFacts()
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

    basicWords.forEach((word) => {
      const entry: VocabularyEntry = {
        word: word.toLowerCase(),
        definition: `Basic word: ${word}`,
        partOfSpeech: "basic",
        examples: [],
        phonetic: "",
        frequency: 1,
        source: "basic",
        learned: Date.now(),
        confidence: 0.7,
      }
      this.vocabulary.set(word.toLowerCase(), entry)
    })
  }

  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
      { category: "mathematics", fact: "Tesla's 3-6-9 pattern reveals the fundamental structure of the universe" },
    ]

    sampleFacts.forEach((item) => {
      const entry: FactEntry = {
        key: `fact_${item.category}`,
        value: item.fact,
        category: item.category,
        source: "basic",
        confidence: 0.8,
        timestamp: Date.now(),
      }
      this.facts.set(`fact_${item.category}`, entry)
    })
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("✅ ZacAI already initialized")
      return
    }

    try {
      console.log("🧠 Initializing ZacAI Cognitive System...")
      this.systemStatus = "initializing"

      // STEP 1: Load ALL seed data and process it cognitively
      await this.loadAndProcessSeedData()

      // STEP 2: Initialize cognitive instructions
      await this.initializeCognitiveInstructions()

      // STEP 3: Initialize API manager for lookups
      await this.initializeAPIManager()

      // STEP 4: Load stored learned knowledge
      await this.loadStoredKnowledge()

      // STEP 5: Set up learning pipeline
      this.setupLearningPipeline()

      this.systemStatus = "ready"
      this.isInitialized = true

      const name = this.systemIdentity?.name || "ZacAI"
      console.log(`✅ ${name} Cognitive System fully operational!`)
      this.logCognitiveCapabilities()
    } catch (error) {
      console.error("❌ Cognitive initialization failed:", error)
      this.systemStatus = "error"
      this.isInitialized = false
    }
  }

  // STEP 1: Load and cognitively process ALL seed data
  private async loadAndProcessSeedData(): Promise<void> {
    console.log("🧠 Loading and processing seed data cognitively...")

    // Load all seed files
    const seedFiles = [
      { file: "/seed_system.json", target: "seedSystemData", name: "System Identity & Instructions" },
      { file: "/seed_vocab.json", target: "seedVocabData", name: "Core Vocabulary" },
      { file: "/seed_maths.json", target: "seedMathData", name: "Mathematical Knowledge" },
      { file: "/seed_knowledge.json", target: "seedKnowledgeData", name: "General Knowledge" },
      { file: "/seed_learning.json", target: "seedLearningData", name: "Learning Instructions" },
    ]

    for (const { file, target, name } of seedFiles) {
      try {
        const response = await fetch(file)
        if (response.ok) {
          const data = await response.json()
          ;(this as any)[target] = data
          console.log(`✅ Loaded ${name}`)
        } else {
          console.warn(`⚠️ Could not load ${file}`)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error)
      }
    }

    // Process seed data into cognitive knowledge
    await this.processSeedDataCognitively()
  }

  // Process seed data into usable cognitive knowledge
  private async processSeedDataCognitively(): Promise<void> {
    console.log("🧠 Processing seed data into cognitive knowledge...")

    // 1. Process system identity and instructions
    if (this.seedSystemData) {
      this.systemIdentity = this.seedSystemData.identity || {
        name: "ZacAI",
        version: "2.0.0",
        purpose: "Cognitive AI Assistant",
      }

      this.cognitiveInstructions = {
        ...this.seedSystemData.operational_instructions,
        ...this.seedSystemData.learning_process,
        ...this.seedSystemData.response_guidelines,
      }

      console.log(`✅ System identity: ${this.systemIdentity.name} v${this.systemIdentity.version}`)
    }

    // 2. Process vocabulary into cognitive vocabulary store
    if (this.seedVocabData) {
      let vocabCount = 0
      Object.entries(this.seedVocabData).forEach(([word, data]: [string, any]) => {
        const entry: VocabularyEntry = {
          word: word.toLowerCase(),
          definition: typeof data === "string" ? data : data.definition,
          partOfSpeech: typeof data === "object" ? data.part_of_speech || data.partOfSpeech : "unknown",
          examples: typeof data === "object" ? data.examples || [] : [],
          phonetic: typeof data === "object" ? data.phonetic : "",
          frequency: typeof data === "object" ? data.frequency || 1 : 1,
          source: "seed",
          learned: Date.now(),
          confidence: 0.9,
        }
        this.vocabulary.set(word.toLowerCase(), entry)
        vocabCount++
      })
      console.log(`✅ Processed ${vocabCount} vocabulary entries into cognitive store`)
    }

    // 3. Process mathematics into cognitive math store
    if (this.seedMathData) {
      let mathCount = 0

      // Process arithmetic tables
      if (this.seedMathData.arithmetic_tables) {
        Object.entries(this.seedMathData.arithmetic_tables).forEach(([operation, tables]: [string, any]) => {
          const entry: MathEntry = {
            concept: `arithmetic_${operation}`,
            type: "arithmetic_table",
            data: tables,
            source: "seed",
            learned: Date.now(),
            confidence: 0.95,
          }
          this.mathematics.set(`arithmetic_${operation}`, entry)
          mathCount++
        })
      }

      // Process Tesla/Vortex math
      if (this.seedMathData.tesla_map) {
        const entry: MathEntry = {
          concept: "tesla_vortex_mathematics",
          type: "tesla_system",
          data: this.seedMathData.tesla_map,
          source: "seed",
          learned: Date.now(),
          confidence: 0.95,
        }
        this.mathematics.set("tesla_vortex_mathematics", entry)
        mathCount++
      }

      // Process calculation methods
      if (this.seedMathData.calculation_methods) {
        Object.entries(this.seedMathData.calculation_methods).forEach(([method, data]: [string, any]) => {
          const entry: MathEntry = {
            concept: method,
            type: "calculation_method",
            data: data,
            source: "seed",
            learned: Date.now(),
            confidence: 0.9,
          }
          this.mathematics.set(method, entry)
          mathCount++
        })
      }

      console.log(`✅ Processed ${mathCount} mathematical concepts into cognitive store`)
    }

    // 4. Process general knowledge
    if (this.seedKnowledgeData) {
      let knowledgeCount = 0
      Object.entries(this.seedKnowledgeData).forEach(([topic, data]: [string, any]) => {
        const entry: FactEntry = {
          key: topic,
          value: typeof data === "string" ? data : JSON.stringify(data),
          category: "general_knowledge",
          source: "seed",
          confidence: 0.9,
          timestamp: Date.now(),
        }
        this.facts.set(topic, entry)
        knowledgeCount++
      })
      console.log(`✅ Processed ${knowledgeCount} knowledge facts into cognitive store`)
    }
  }

  // STEP 2: Initialize cognitive instructions
  private async initializeCognitiveInstructions(): Promise<void> {
    console.log("🧠 Initializing cognitive processing instructions...")

    if (!this.cognitiveInstructions) {
      // Fallback cognitive instructions
      this.cognitiveInstructions = {
        message_processing: [
          "Extract and store personal information from user messages",
          "Classify message type (math, definition, science, coding, conversation)",
          "Check relevant seed and learned knowledge first",
          "Query online sources if knowledge gap identified",
          "Generate response with confidence level and reasoning",
          "Store new knowledge in appropriate learned knowledge store",
          "Update conversation history and user memory",
        ],
        learning_storage: {
          vocabulary: "Store in vocabulary map with definition, pronunciation, examples, synonyms",
          mathematics: "Store in mathematics map with formula, method, examples, difficulty level",
          science: "Store in facts map with concept, explanation, source, confidence level",
          personal: "Store user information in personalInfo map with privacy protection",
        },
        api_usage: {
          dictionary: "Use for word definitions when not in seed vocabulary",
          wikipedia: "Use for scientific and general knowledge concepts",
          math_apis: "Use for complex mathematical calculations",
          fallback: "Provide helpful response even when APIs fail",
        },
      }
    }

    console.log("✅ Cognitive instructions initialized")
  }

  // STEP 3: Initialize API manager
  private async initializeAPIManager(): Promise<void> {
    console.log("🌐 Initializing API manager for knowledge lookups...")

    this.apiManager = {
      // Dictionary API for word lookups
      lookupWord: async (word: string) => {
        try {
          console.log(`🔍 Looking up word: ${word}`)
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              const wordData = data[0]
              const meaning = wordData.meanings?.[0]
              const definition = meaning?.definitions?.[0]

              return {
                word: wordData.word,
                definition: definition?.definition || "Definition found",
                partOfSpeech: meaning?.partOfSpeech || "unknown",
                phonetic: wordData.phonetic || "",
                examples: definition?.example ? [definition.example] : [],
                source: "dictionary_api",
                confidence: 0.85,
              }
            }
          }
        } catch (error) {
          console.warn(`Dictionary API failed for ${word}:`, error)
        }
        return null
      },

      // Wikipedia API for knowledge lookups
      lookupKnowledge: async (topic: string) => {
        try {
          console.log(`🔍 Looking up knowledge: ${topic}`)
          const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`)
          if (response.ok) {
            const data = await response.json()
            return {
              title: data.title,
              extract: data.extract,
              url: data.content_urls?.desktop?.page || "",
              source: "wikipedia_api",
              confidence: 0.8,
            }
          }
        } catch (error) {
          console.warn(`Wikipedia API failed for ${topic}:`, error)
        }
        return null
      },
    }

    console.log("✅ API manager initialized")
  }

  // STEP 4: Load stored learned knowledge - Updated to use LearntDataManager
  private async loadStoredKnowledge(): Promise<void> {
    console.log("💾 Loading stored learned knowledge...")

    try {
      // Load learned vocabulary
      const learnedVocab = this.learntDataManager.loadLearnedVocabulary()
      learnedVocab.forEach((entry) => {
        this.vocabulary.set(entry.word, entry)
      })
      if (learnedVocab.length > 0) {
        console.log(`✅ Loaded ${learnedVocab.length} learned vocabulary entries`)
      }

      // Load learned mathematics
      const learnedMath = this.learntDataManager.loadLearnedMathematics()
      learnedMath.forEach((entry) => {
        this.mathematics.set(entry.concept, entry)
      })
      if (learnedMath.length > 0) {
        console.log(`✅ Loaded ${learnedMath.length} learned math entries`)
      }

      // Load learned science/facts
      const learnedScience = this.learntDataManager.loadLearnedScience()
      learnedScience.forEach((entry) => {
        this.facts.set(entry.key, entry)
      })
      if (learnedScience.length > 0) {
        console.log(`✅ Loaded ${learnedScience.length} learned science entries`)
      }

      // Load personal info (keep existing method)
      const storedPersonal = localStorage.getItem("zacai_personal_info")
      if (storedPersonal) {
        const personalData = JSON.parse(storedPersonal)
        personalData.forEach((entry: PersonalInfoEntry) => {
          this.personalInfo.set(entry.key, entry)
        })
        console.log(`✅ Loaded ${personalData.length} personal info entries`)
      }
    } catch (error) {
      console.warn("Failed to load stored knowledge:", error)
    }
  }

  // STEP 5: Setup learning pipeline
  private setupLearningPipeline(): void {
    console.log("🎓 Setting up learning pipeline...")

    // Process learning queue every 5 seconds
    setInterval(() => {
      if (this.learningQueue.length > 0) {
        this.processLearningQueue()
      }
    }, 5000)

    console.log("✅ Learning pipeline active")
  }

  private async processLearningQueue(): Promise<void> {
    const item = this.learningQueue.shift()
    if (!item) return

    try {
      switch (item.type) {
        case "vocabulary":
          await this.learnNewWord(item.word)
          break
        case "knowledge":
          await this.learnNewKnowledge(item.topic)
          break
        case "math":
          await this.learnNewMathConcept(item.concept)
          break
      }
    } catch (error) {
      console.warn("Learning queue processing error:", error)
    }
  }

  private async learnNewWord(word: string): Promise<void> {
    if (this.vocabulary.has(word)) return

    console.log(`🎓 Learning new word: ${word}`)
    const wordData = await this.apiManager.lookupWord(word)

    if (wordData) {
      const entry: VocabularyEntry = {
        word: word.toLowerCase(),
        definition: wordData.definition,
        partOfSpeech: wordData.partOfSpeech,
        examples: wordData.examples,
        phonetic: wordData.phonetic,
        frequency: 1,
        source: "learned_api",
        learned: Date.now(),
        confidence: wordData.confidence,
      }

      this.vocabulary.set(word.toLowerCase(), entry)
      await this.saveLearnedVocabulary()
      console.log(`✅ Learned new word: ${word}`)
    }
  }

  private async learnNewKnowledge(topic: string): Promise<void> {
    if (this.facts.has(topic)) return

    console.log(`🎓 Learning new knowledge: ${topic}`)
    const knowledgeData = await this.apiManager.lookupKnowledge(topic)

    if (knowledgeData) {
      const entry: FactEntry = {
        key: topic,
        value: knowledgeData.extract,
        category: "learned_knowledge",
        source: "learned_api",
        confidence: knowledgeData.confidence,
        timestamp: Date.now(),
      }

      this.facts.set(topic, entry)
      await this.saveLearnedFacts()
      console.log(`✅ Learned new knowledge: ${topic}`)
    }
  }

  private async learnNewMathConcept(concept: string): Promise<void> {
    // Implementation for learning new math concepts
    console.log(`🎓 Learning new math concept: ${concept}`)
  }

  private logCognitiveCapabilities(): void {
    console.log("🧠 ZacAI Cognitive Capabilities:")
    console.log(`• Vocabulary: ${this.vocabulary.size} words`)
    console.log(`• Mathematics: ${this.mathematics.size} concepts`)
    console.log(`• Knowledge: ${this.facts.size} facts`)
    console.log(`• Personal Info: ${this.personalInfo.size} entries`)
    console.log(`• API Manager: ${this.apiManager ? "Active" : "Inactive"}`)
    console.log(`• Learning Pipeline: Active`)
  }

  // COGNITIVE MESSAGE PROCESSING
  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 ZacAI Cognitive Processing:", userMessage)

    // Extract and store personal info first
    this.extractAndStorePersonalInfo(userMessage)

    try {
      // COGNITIVE DECISION TREE - Following our designed pipeline

      // 1. PERSONAL INFO QUERIES
      if (this.isPersonalInfoQuery(userMessage)) {
        return await this.handlePersonalInfoQuery(userMessage)
      }

      // 2. MATH CALCULATIONS
      if (this.isMathCalculation(userMessage)) {
        return await this.handleMathCalculation(userMessage)
      }

      // 3. VOCABULARY LOOKUPS
      if (this.isVocabularyLookup(userMessage)) {
        return await this.handleVocabularyLookup(userMessage)
      }

      // 4. KNOWLEDGE QUERIES
      if (this.isKnowledgeQuery(userMessage)) {
        return await this.handleKnowledgeQuery(userMessage)
      }

      // 5. TESLA/VORTEX MATH
      if (this.isTeslaQuery(userMessage)) {
        return await this.handleTeslaQuery(userMessage)
      }

      // 6. SYSTEM QUERIES
      if (this.isSystemQuery(userMessage)) {
        return await this.handleSystemQuery(userMessage)
      }

      // 7. GREETINGS
      if (this.isGreeting(userMessage)) {
        return await this.handleGreeting(userMessage)
      }

      // 8. CONTEXTUAL CONVERSATION
      return await this.handleContextualConversation(userMessage)
    } catch (error) {
      console.error("❌ Cognitive processing error:", error)
      return {
        content:
          "I encountered an error processing your message. Let me try to help you anyway - what would you like to know?",
        confidence: 0.3,
        reasoning: ["Error in cognitive processing"],
      }
    }
  }

  // PERSONAL INFO HANDLING
  private isPersonalInfoQuery(message: string): boolean {
    const patterns = [
      /what'?s my name/i,
      /do you remember my name/i,
      /what do you know about me/i,
      /what do you remember/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handlePersonalInfoQuery(message: string): Promise<AIResponse> {
    if (message.toLowerCase().includes("name")) {
      const nameInfo = this.personalInfo.get("name")
      if (nameInfo) {
        return {
          content: `Your name is ${nameInfo.value}! I remember you telling me that earlier.`,
          confidence: 0.95,
          reasoning: ["Retrieved stored name from personal info"],
        }
      } else {
        return {
          content: "I don't think you've told me your name yet. What's your name?",
          confidence: 0.8,
          reasoning: ["No name found in personal info storage"],
        }
      }
    }

    if (this.personalInfo.size > 0) {
      let response = "Here's what I remember about you:\n\n"
      Array.from(this.personalInfo.entries()).forEach(([key, entry]) => {
        response += `• ${key}: ${entry.value}\n`
      })
      return {
        content: response,
        confidence: 0.9,
        reasoning: ["Retrieved all stored personal information"],
      }
    }

    return {
      content: "I don't have any personal information about you stored yet. Tell me about yourself!",
      confidence: 0.7,
      reasoning: ["No personal information found"],
    }
  }

  // MATH CALCULATION HANDLING
  private isMathCalculation(message: string): boolean {
    const patterns = [
      // Direct calculations
      /^\s*(\d+)\s*[x×*]\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*\+\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*-\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*[/÷]\s*(\d+)\s*(?:is|=|\?)?\s*$/i,

      // Question formats
      /what\s*(?:is|does|equals?)\s*(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,
      /calculate\s*(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,
      /can\s+you\s+do\s+(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,
      /solve\s*(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,

      // Mixed operations
      /(\d+)\s*[+-]\s*(\d+)\s*[x×*]\s*(\d+)/i,
      /(\d+)\s*[x×*]\s*(\d+)\s*[+-]\s*(\d+)/i,

      // Formula requests
      /math.*formula/i,
      /give.*me.*formula/i,
      /show.*formula/i,

      // General math keywords
      /(?:math|calculate|computation|arithmetic)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleMathCalculation(message: string): Promise<AIResponse> {
    console.log("🧮 Processing math calculation")

    // Check if it's a formula request
    if (message.toLowerCase().includes("formula")) {
      return await this.handleFormulaRequest(message)
    }

    // Extract math operation
    const mathData = this.extractMathOperation(message)
    if (!mathData) {
      return {
        content: "I couldn't parse that math expression. Try something like '3×3', '5+2', or '3+3×3'.",
        confidence: 0.3,
        reasoning: ["Could not parse math expression"],
      }
    }

    let result: number | string = "Error"
    let seedUsed = false
    let calculation = ""

    // Handle complex expressions (order of operations)
    if (mathData.operation === "complex" && mathData.expression) {
      try {
        // Parse expression like "3+3×3" with proper order of operations
        result = Function('"use strict"; return (' + mathData.expression.replace(/[x×]/g, "*") + ")")()
        calculation = mathData.expression.replace(/[x×]/g, "×")
      } catch (error) {
        result = "Error in calculation"
      }
    } else {
      // Handle simple operations
      const { num1, num2, operation } = mathData
      calculation = `${num1} ${this.getOperationSymbol(operation)} ${num2}`

      // 1. Try to get from seed math data first
      if (operation === "multiply") {
        const seedResult = this.getFromSeedMath(num1, num2, "multiplication")
        if (seedResult !== null) {
          result = seedResult
          seedUsed = true
        }
      }

      // 2. Fallback to calculation
      if (!seedUsed) {
        switch (operation) {
          case "add":
            result = num1 + num2
            break
          case "subtract":
            result = num1 - num2
            break
          case "multiply":
            result = num1 * num2
            break
          case "divide":
            result = num2 !== 0 ? num1 / num2 : "Cannot divide by zero"
            break
        }
      }
    }

    // 3. Store the calculation for future reference
    const mathEntry: MathEntry = {
      concept: `calculation_${Date.now()}`,
      type: "calculation",
      data: { calculation, result, seedUsed, timestamp: Date.now() },
      source: seedUsed ? "seed" : "calculated",
      learned: Date.now(),
      confidence: 0.95,
    }
    this.mathematics.set(mathEntry.concept, mathEntry)
    await this.saveLearnedMathematics()

    let response = `🧮 **${calculation} = ${result}**\n\n`

    if (seedUsed) {
      response += `✅ **Used seed mathematical data** from arithmetic tables\n\n`
    } else {
      response += `🔢 **Calculated using arithmetic** and stored for future reference\n\n`
    }

    // Add Tesla analysis if result is a number
    if (typeof result === "number") {
      const teslaAnalysis = this.calculateTeslaPattern(result)
      response += `🌀 **Tesla Analysis of ${result}:**\n`
      response += `• Digital Root: ${teslaAnalysis.digitalRoot}\n`
      response += `• Pattern: ${teslaAnalysis.type}\n`
      if (teslaAnalysis.isTeslaNumber) {
        response += `• ⚡ Tesla Sacred Number - Controls universal energy!\n`
      } else if (teslaAnalysis.isVortexNumber) {
        response += `• 🌀 Vortex Cycle Number - Part of infinite energy flow!\n`
      }
    }

    return {
      content: response,
      confidence: 0.95,
      reasoning: [
        seedUsed ? "Used seed mathematical data" : "Calculated using arithmetic",
        "Applied Tesla pattern analysis",
        "Stored calculation for future reference",
      ],
    }
  }

  private async handleFormulaRequest(message: string): Promise<AIResponse> {
    console.log("📐 Processing formula request")

    // Check seed math data for formulas
    if (this.seedMathData?.formulas) {
      const formulas = Object.entries(this.seedMathData.formulas)
      if (formulas.length > 0) {
        const [name, formula] = formulas[0] as [string, any]
        let response = `📐 **Mathematical Formula: ${name}**\n\n`
        response += `**Formula:** ${formula.expression || formula}\n\n`
        if (formula.description) {
          response += `**Description:** ${formula.description}\n\n`
        }
        response += `✅ Retrieved from seed mathematical data!`
        return {
          content: response,
          confidence: 0.9,
          reasoning: ["Retrieved formula from seed mathematical data"],
        }
      }
    }

    // Fallback formulas
    const basicFormulas = [
      {
        name: "Quadratic Formula",
        expression: "x = (-b ± √(b² - 4ac)) / 2a",
        description: "Solves quadratic equations",
      },
      { name: "Pythagorean Theorem", expression: "a² + b² = c²", description: "Right triangle relationship" },
      { name: "Area of Circle", expression: "A = πr²", description: "Circle area calculation" },
    ]

    const formula = basicFormulas[Math.floor(Math.random() * basicFormulas.length)]
    let response = `📐 **Mathematical Formula: ${formula.name}**\n\n`
    response += `**Formula:** ${formula.expression}\n\n`
    response += `**Description:** ${formula.description}\n\n`
    response += `💡 From my mathematical knowledge base!`

    return {
      content: response,
      confidence: 0.85,
      reasoning: ["Provided mathematical formula from knowledge base"],
    }
  }

  // VOCABULARY LOOKUP HANDLING
  private isVocabularyLookup(message: string): boolean {
    const patterns = [
      // Direct questions
      /^what\s+(?:is|does|means?)\s+(?!you|your|my|i\s|we\s)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,
      /^define\s+(?!you|your|my|i\s|we\s)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,
      /^meaning\s+of\s+(?!you|your|my|i\s|we\s)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,

      // More flexible patterns
      /what\s+does\s+([a-zA-Z]+)\s+mean/i,
      /explain\s+([a-zA-Z]+)/i,
      /definition\s+of\s+([a-zA-Z]+)/i,

      // Single word queries that aren't personal
      /^(?!you|your|my|i\s|we\s|they\s|them\s|him\s|her\s|his\s|hers\s)([a-zA-Z]+)\s*\??\s*$/i,
    ]

    // Additional check - if it's a single word that's not a common personal word
    const trimmed = message.trim().toLowerCase()
    const personalWords = ["you", "your", "my", "me", "i", "we", "they", "them", "him", "her", "his", "hers"]
    const commonWords = ["hello", "hi", "hey", "thanks", "thank", "please", "yes", "no", "ok", "okay"]

    if (
      trimmed.split(" ").length === 1 &&
      !personalWords.includes(trimmed) &&
      !commonWords.includes(trimmed) &&
      /^[a-zA-Z]+$/.test(trimmed)
    ) {
      return true
    }

    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleVocabularyLookup(message: string): Promise<AIResponse> {
    console.log("📖 Processing vocabulary lookup")

    // Extract the word to look up
    const word = this.extractWordFromMessage(message)
    if (!word) {
      return {
        content:
          "I couldn't identify what word you want me to define. Try asking like 'What is [word]?' or 'Define [word]'",
        confidence: 0.3,
        reasoning: ["Could not extract word to define"],
      }
    }

    console.log(`🔍 Looking up word: "${word}"`)

    // COGNITIVE PIPELINE: seed → learned → API → learn → store

    // 1. Check if already in vocabulary (seed or learned)
    if (this.vocabulary.has(word)) {
      const entry = this.vocabulary.get(word)!
      let response = `📖 **${word}** (${entry.source} vocabulary)\n\n`
      response += `**Definition:** ${entry.definition}\n\n`
      if (entry.partOfSpeech && entry.partOfSpeech !== "unknown") {
        response += `**Part of Speech:** ${entry.partOfSpeech}\n\n`
      }
      if (entry.examples && entry.examples.length > 0) {
        response += `**Examples:** ${entry.examples.join(", ")}\n\n`
      }
      response += `✅ Retrieved from my ${entry.source} vocabulary!`

      return {
        content: response,
        confidence: entry.confidence,
        reasoning: [`Retrieved from ${entry.source} vocabulary`],
      }
    }

    // 2. Not found - use API to learn it
    console.log(`🌐 Word not found in vocabulary, looking up online: ${word}`)

    try {
      const wordData = await this.apiManager.lookupWord(word)

      if (wordData) {
        // Store the learned word
        const entry: VocabularyEntry = {
          word: word.toLowerCase(),
          definition: wordData.definition,
          partOfSpeech: wordData.partOfSpeech,
          examples: wordData.examples,
          phonetic: wordData.phonetic,
          frequency: 1,
          source: "learned_api",
          learned: Date.now(),
          confidence: wordData.confidence,
        }

        this.vocabulary.set(word.toLowerCase(), entry)
        await this.saveLearnedVocabulary()

        let response = `📖 **${word}** (newly learned)\n\n`
        response += `**Definition:** ${wordData.definition}\n\n`
        response += `**Part of Speech:** ${wordData.partOfSpeech}\n\n`
        if (wordData.examples.length > 0) {
          response += `**Examples:** ${wordData.examples.join(", ")}\n\n`
        }
        if (wordData.phonetic) {
          response += `**Pronunciation:** ${wordData.phonetic}\n\n`
        }
        response += `✨ I've learned this word and will remember it for future conversations!`

        return {
          content: response,
          confidence: wordData.confidence,
          reasoning: ["Successfully looked up word online", "Stored in learned vocabulary"],
        }
      }
    } catch (error) {
      console.warn(`❌ API lookup failed for "${word}":`, error)
    }

    // 3. API failed - add to learning queue for retry
    this.learningQueue.push({ type: "vocabulary", word })

    return {
      content: `I couldn't find a definition for "${word}" right now. This might be due to network issues. I've added it to my learning queue to try again later. Try asking about a different word!`,
      confidence: 0.4,
      reasoning: ["Word not found in vocabulary", "API lookup failed", "Added to learning queue"],
    }
  }

  // KNOWLEDGE QUERY HANDLING
  private isKnowledgeQuery(message: string): boolean {
    const patterns = [
      /tell me about (?!you|your|my|i\s|we\s)/i,
      /what.*know.*about (?!you|your|my|i\s|we\s)/i,
      /explain.*(?!you|your|my|i\s|we\s)/i,
      /how.*work/i,
      /what.*(?:science|scientific)/i,
      /describe\s+(?!you|your|my|i\s|we\s)/i,
      /information\s+about\s+(?!you|your|my|i\s|we\s)/i,

      // Science-specific patterns
      /what\s+is\s+science/i,
      /science\s+experiment/i,
      /scientific\s+method/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleKnowledgeQuery(message: string): Promise<AIResponse> {
    console.log("🧠 Processing knowledge query")

    const topic = this.extractTopicFromMessage(message)
    if (!topic) {
      return {
        content: "I couldn't identify what topic you want to learn about. Try asking like 'Tell me about [topic]'",
        confidence: 0.3,
        reasoning: ["Could not extract topic"],
      }
    }

    console.log(`🔍 Looking up knowledge: "${topic}"`)

    // 1. Check if already in facts (seed or learned)
    if (this.facts.has(topic)) {
      const fact = this.facts.get(topic)!
      let response = `🧠 **${topic}** (${fact.source} knowledge)\n\n`
      response += `${fact.value}\n\n`
      response += `✅ Retrieved from my ${fact.source} knowledge base!`

      return {
        content: response,
        confidence: fact.confidence,
        reasoning: [`Retrieved from ${fact.source} knowledge base`],
      }
    }

    // 2. Not found - use API to learn it
    try {
      const knowledgeData = await this.apiManager.lookupKnowledge(topic)

      if (knowledgeData) {
        // Store the learned knowledge
        const entry: FactEntry = {
          key: topic,
          value: knowledgeData.extract,
          category: "learned_knowledge",
          source: "learned_api",
          confidence: knowledgeData.confidence,
          timestamp: Date.now(),
        }

        this.facts.set(topic, entry)
        await this.saveLearnedFacts()

        let response = `🧠 **${knowledgeData.title}** (newly learned)\n\n`
        response += `${knowledgeData.extract}\n\n`
        response += `🔗 [Learn more](${knowledgeData.url})\n\n`
        response += `✨ I've learned about this topic and will remember it!`

        return {
          content: response,
          confidence: knowledgeData.confidence,
          reasoning: ["Successfully looked up knowledge online", "Stored in learned facts"],
        }
      }
    } catch (error) {
      console.warn(`❌ Knowledge API lookup failed for "${topic}":`, error)
    }

    // 3. API failed - add to learning queue
    this.learningQueue.push({ type: "knowledge", topic })

    return {
      content: `I couldn't find information about "${topic}" right now. I've added it to my learning queue to research later. Try asking about a different topic!`,
      confidence: 0.4,
      reasoning: ["Topic not found in knowledge base", "API lookup failed", "Added to learning queue"],
    }
  }

  // TESLA QUERY HANDLING
  private isTeslaQuery(message: string): boolean {
    const patterns = [
      /tesla.*math/i,
      /vortex.*math/i,
      /tesla.*pattern/i,
      /vortex.*pattern/i,
      /digital.*root/i,
      /3.*6.*9/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleTeslaQuery(message: string): Promise<AIResponse> {
    // Check if asking for specific number pattern
    const numberMatch = message.match(/(\d+)/)
    if (numberMatch) {
      const number = Number.parseInt(numberMatch[1])
      const analysis = this.calculateTeslaPattern(number)

      let response = `🌀 **Tesla Pattern Analysis for ${number}**\n\n`
      response += `**Digital Root:** ${analysis.digitalRoot}\n`
      response += `**Pattern Type:** ${analysis.type}\n\n`

      if (analysis.isTeslaNumber) {
        response += `**⚡ This is a Tesla Number!** Tesla said these numbers (3, 6, 9) control the universe.\n`
      } else if (analysis.isVortexNumber) {
        response += `**🌀 This is part of the Vortex Cycle** (1, 2, 4, 8, 7, 5) that repeats infinitely.\n`
      }

      return {
        content: response,
        confidence: 0.95,
        reasoning: ["Calculated Tesla pattern using digital root analysis"],
      }
    }

    // General Tesla math explanation
    let response = `🌀 **Tesla/Vortex Mathematics**\n\n`
    response += `Tesla discovered that all numbers reduce to a fundamental pattern:\n\n`
    response += `**🔢 The Tesla Pattern:**\n`
    response += `• **3, 6, 9**: The sacred numbers that control the universe\n`
    response += `• **1, 2, 4, 8, 7, 5**: The vortex cycle that repeats infinitely\n\n`
    response += `**🧮 How it works:**\n`
    response += `1. Take any number and add its digits together\n`
    response += `2. Keep reducing until you get a single digit (1-9)\n`
    response += `3. This reveals the number's position in the universal pattern\n\n`
    response += `💡 **Tesla's Quote:** "If you only knew the magnificence of the 3, 6 and 9, then you would have the key to the universe."\n\n`
    response += `Try asking me for the Tesla pattern of any specific number!`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Provided Tesla/Vortex mathematics explanation"],
    }
  }

  // SYSTEM QUERY HANDLING
  private isSystemQuery(message: string): boolean {
    const patterns = [
      /tell me about you/i,
      /who are you/i,
      /what are you/i,
      /your.*name/i,
      /system.*diagnostic/i,
      /self.*diagnostic/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleSystemQuery(message: string): Promise<AIResponse> {
    if (message.toLowerCase().includes("diagnostic")) {
      return await this.handleSystemDiagnostic()
    }

    const name = this.systemIdentity?.name || "ZacAI"
    const version = this.systemIdentity?.version || "2.0.0"

    let response = `👋 **I'm ${name} v${version}**\n\n`
    response += `I'm a cognitive AI system with comprehensive capabilities:\n\n`
    response += `🧮 **Mathematics**: Calculations using seed data and Tesla/Vortex patterns\n`
    response += `📚 **Vocabulary**: Word definitions from seed data and online learning\n`
    response += `🧠 **Knowledge**: Facts and information with online research capability\n`
    response += `🗣️ **Memory**: Personal information and conversation context\n`
    response += `🎓 **Learning**: Continuous learning from conversations and APIs\n\n`
    response += `**Current Status:**\n`
    response += `• Vocabulary: ${this.vocabulary.size} words\n`
    response += `• Mathematics: ${this.mathematics.size} concepts\n`
    response += `• Knowledge: ${this.facts.size} facts\n`
    response += `• Personal Info: ${this.personalInfo.size} entries\n\n`
    response += `I learn from every conversation and remember what we discuss. What would you like to explore?`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Generated comprehensive identity response with current status"],
    }
  }

  private async handleSystemDiagnostic(): Promise<AIResponse> {
    let response = `🔍 **ZacAI Cognitive System Diagnostic**\n\n`
    response += `**Core Systems:**\n`
    response += `• Cognitive Processing: ✅ Active\n`
    response += `• Memory System: ✅ Active (${this.personalInfo.size} entries)\n`
    response += `• Vocabulary System: ✅ Active (${this.vocabulary.size} words)\n`
    response += `• Mathematics System: ✅ Active (${this.mathematics.size} concepts)\n`
    response += `• Knowledge Base: ✅ Active (${this.facts.size} facts)\n`
    response += `• API Manager: ${this.apiManager ? "✅ Active" : "❌ Inactive"}\n`
    response += `• Learning Pipeline: ✅ Active (${this.learningQueue.length} queued)\n\n`

    response += `**Seed Data Status:**\n`
    response += `• System Data: ${this.seedSystemData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Vocabulary Data: ${this.seedVocabData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Math Data: ${this.seedMathData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Knowledge Data: ${this.seedKnowledgeData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Learning Data: ${this.seedLearningData ? "✅ Loaded" : "❌ Missing"}\n\n`

    response += `**Learning Statistics:**\n`
    const seedVocab = Object.keys(this.seedVocabData || {}).length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length
    response += `• Seed Vocabulary: ${seedVocab} words\n`
    response += `• Learned Vocabulary: ${learnedVocab} words\n`
    response += `• Total Vocabulary: ${this.vocabulary.size} words\n\n`

    response += `**Status:** All cognitive systems operational and ready for learning!`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Performed comprehensive cognitive system diagnostic"],
    }
  }

  // GREETING HANDLING
  private isGreeting(message: string): boolean {
    const patterns = [/^hi\b/i, /^hello\b/i, /^hey\b/i, /^good morning\b/i, /^good afternoon\b/i, /^good evening\b/i]
    return patterns.some((pattern) => pattern.test(message.trim()))
  }

  private async handleGreeting(message: string): Promise<AIResponse> {
    const name = this.systemIdentity?.name || "ZacAI"
    const userName = this.personalInfo.get("name")?.value

    let response = ""
    if (userName) {
      response = `Hello ${userName}! Great to see you again. I'm ${name}, your cognitive AI assistant. `
    } else {
      response = `Hello! I'm ${name}, your cognitive AI assistant with comprehensive learning capabilities. `
    }

    response += `I can help with math calculations, vocabulary definitions, Tesla/Vortex patterns, knowledge research, and much more. I learn from every conversation and remember what we discuss. What would you like to explore today?`

    return {
      content: response,
      confidence: 0.9,
      reasoning: ["Generated personalized greeting with capabilities overview"],
    }
  }

  // CONTEXTUAL CONVERSATION
  private async handleContextualConversation(message: string): Promise<AIResponse> {
    const name = this.systemIdentity?.name || "ZacAI"

    let response = `I'm ${name}, your cognitive AI assistant. I understand you said: "${message}"\n\n`
    response += `I can help you with:\n\n`
    response += `🧮 **Mathematics** - calculations, formulas, Tesla patterns\n`
    response += `📖 **Vocabulary** - word definitions (I'll learn new words for you)\n`
    response += `🧠 **Knowledge** - research topics and remember what I learn\n`
    response += `🗣️ **Conversation** - I remember our discussions and your personal info\n\n`
    response += `**Current Knowledge:**\n`
    response += `• ${this.vocabulary.size} words in vocabulary\n`
    response += `• ${this.mathematics.size} mathematical concepts\n`
    response += `• ${this.facts.size} knowledge facts\n\n`
    response += `What would you like to explore? Try:\n`
    response += `• "What is [word]?" - I'll define it and learn it\n`
    response += `• "Calculate 7×8" - I'll solve it using my math knowledge\n`
    response += `• "Tell me about [topic]" - I'll research and learn about it\n`
    response += `• "Tesla pattern for 15" - I'll analyze it with Tesla mathematics`

    return {
      content: response,
      confidence: 0.8,
      reasoning: ["Generated contextual conversation response with current capabilities and knowledge stats"],
    }
  }

  // HELPER METHODS
  private extractWordFromMessage(message: string): string {
    // Remove common question words and clean the message
    const cleaned = message
      .toLowerCase()
      .replace(/^(what\s+(?:is|does|means?)|define|meaning\s+of|tell\s+me\s+about)\s+/i, "")
      .replace(/[?!.]/g, "")
      .trim()

    // Handle specific patterns
    const patterns = [
      /(?:what\s+(?:is|does|means?)|define|meaning\s+of)\s+(.+)/i,
      /^(.+)$/i, // Fallback - take the whole cleaned message
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        const word = match[1].trim().replace(/[?!.]/g, "").toLowerCase()
        // Filter out personal pronouns and common words that shouldn't be looked up
        if (!["you", "your", "my", "me", "i", "we", "they", "them"].includes(word)) {
          return word
        }
      }
    }

    // If we get here, try the cleaned version
    if (cleaned && !["you", "your", "my", "me", "i", "we", "they", "them"].includes(cleaned)) {
      return cleaned
    }

    return ""
  }

  private extractTopicFromMessage(message: string): string {
    const patterns = [
      /(?:tell me about|what.*about|explain|describe)\s+(.+)/i,
      /(?:what\s+is|what\s+are)\s+(.+)/i,
      /(?:how\s+does|how\s+do)\s+(.+)\s+work/i,
      /^(.+)$/i, // Fallback
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        const topic = match[1].trim().replace(/[?!.]/g, "")
        // Filter out personal references
        if (!topic.toLowerCase().includes("you") && !topic.toLowerCase().includes("your")) {
          return topic
        }
      }
    }

    return ""
  }

  private extractMathOperation(
    message: string,
  ): { num1: number; num2: number; operation: string; expression?: string } | null {
    // Handle complex expressions like 3+3×3
    const complexMatch = message.match(/(\d+)\s*([+-])\s*(\d+)\s*([x×*])\s*(\d+)/i)
    if (complexMatch) {
      // For order of operations, we need to handle this specially
      const [, num1, op1, num2, op2, num3] = complexMatch
      return {
        num1: Number.parseInt(num1),
        num2: Number.parseInt(num2),
        operation: "complex",
        expression: `${num1}${op1}${num2}${op2}${num3}`,
      }
    }

    // Handle simple operations
    const patterns = [
      { regex: /(\d+)\s*[x×*]\s*(\d+)/i, op: "multiply" },
      { regex: /(\d+)\s*\+\s*(\d+)/i, op: "add" },
      { regex: /(\d+)\s*-\s*(\d+)/i, op: "subtract" },
      { regex: /(\d+)\s*[/÷]\s*(\d+)/i, op: "divide" },
    ]

    for (const { regex, op } of patterns) {
      const match = message.match(regex)
      if (match) {
        return {
          num1: Number.parseInt(match[1]),
          num2: Number.parseInt(match[2]),
          operation: op,
        }
      }
    }

    return null
  }

  private getFromSeedMath(a: number, b: number, operation: string): number | null {
    if (!this.seedMathData?.arithmetic_tables) return null

    try {
      if (operation === "multiplication" && this.seedMathData.arithmetic_tables.multiplication) {
        const table = this.seedMathData.arithmetic_tables.multiplication
        if (table[a.toString()] && table[a.toString()][b - 1] !== undefined) {
          return table[a.toString()][b - 1]
        }
      }
    } catch (error) {
      console.warn("Error accessing seed math data:", error)
    }

    return null
  }

  private getOperationSymbol(operation: string): string {
    const symbols = { add: "+", subtract: "-", multiply: "×", divide: "÷" }
    return symbols[operation as keyof typeof symbols] || operation
  }

  private calculateTeslaPattern(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const teslaNumbers = [3, 6, 9]
    const vortexCycle = [1, 2, 4, 8, 7, 5]

    return {
      digitalRoot,
      type: teslaNumbers.includes(digitalRoot)
        ? "Tesla Number"
        : vortexCycle.includes(digitalRoot)
          ? "Vortex Cycle"
          : "Standard",
      isTeslaNumber: teslaNumbers.includes(digitalRoot),
      isVortexNumber: vortexCycle.includes(digitalRoot),
    }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
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
        pattern: /i live in\s+(.+)/i,
        key: "location",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i work (?:as|at)\s+(.+)/i,
        key: "job",
        importance: 0.8,
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
        this.savePersonalInfo()
        console.log(`📝 Stored personal info: ${key} = ${value}`)
      }
    })
  }

  // STORAGE METHODS - Updated to use LearntDataManager
  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api")
      await this.learntDataManager.saveLearnedVocabulary(learnedVocab)
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }

  private async saveLearnedMathematics(): Promise<void> {
    try {
      const learnedMath = Array.from(this.mathematics.values()).filter(
        (m) => m.source === "calculated" || m.source === "learned_api",
      )
      await this.learntDataManager.saveLearnedMathematics(learnedMath)
    } catch (error) {
      console.warn("Failed to save learned mathematics:", error)
    }
  }

  private async saveLearnedFacts(): Promise<void> {
    try {
      const learnedFacts = Array.from(this.facts.values()).filter((f) => f.source === "learned_api")
      await this.learntDataManager.saveLearnedScience(learnedFacts)
    } catch (error) {
      console.warn("Failed to save learned facts:", error)
    }
  }

  private async savePersonalInfo(): Promise<void> {
    try {
      const personalData = Array.from(this.personalInfo.values())
      localStorage.setItem("zacai_personal_info", JSON.stringify(personalData))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  private async saveLearnedMathematics(): Promise<void> {
    try {
      const learnedMath = Array.from(this.mathematics.values()).filter(
        (m) => m.source === "calculated" || m.source === "learned_api",
      )

      // Try to save to learnt_maths.json (this would need server-side implementation)
      // For now, save to localStorage as backup
      localStorage.setItem("zacai_learned_mathematics", JSON.stringify(learnedMath))
      console.log(`💾 Saved ${learnedMath.length} learned mathematics entries`)
    } catch (error) {
      console.warn("Failed to save learned mathematics:", error)
    }
  }

  // PUBLIC API METHODS
  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
  }

  public getStats(): any {
    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: this.personalInfo.size,
      systemStatus: this.systemStatus,
      mathFunctions: this.mathematics.size,
      totalLearned:
        Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length +
        Array.from(this.facts.values()).filter((f) => f.source === "learned_api").length,
      vocabularyData: this.vocabulary,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: this.mathematics,
    }
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemStatus: this.systemStatus,
      systemIdentity: this.systemIdentity,
      seedDataStatus: {
        system: !!this.seedSystemData,
        vocab: !!this.seedVocabData,
        math: !!this.seedMathData,
        knowledge: !!this.seedKnowledgeData,
        learning: !!this.seedLearningData,
      },
      apiManagerActive: !!this.apiManager,
      learningQueueSize: this.learningQueue.length,
      vocabularySize: this.vocabulary.size,
      mathematicsSize: this.mathematics.size,
      factsSize: this.facts.size,
      personalInfoSize: this.personalInfo.size,
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      facts: Array.from(this.facts.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      conversations: this.conversationHistory,
      timestamp: Date.now(),
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      this.conversationHistory = []
      this.vocabulary = new Map()
      this.mathematics = new Map()
      this.facts = new Map()
      this.personalInfo = new Map()
      this.learningQueue = []

      localStorage.removeItem("zacai_learned_vocabulary")
      localStorage.removeItem("zacai_facts")
      localStorage.removeItem("zacai_personal_info")

      console.log("✅ All cognitive data cleared")
    } catch (error) {
      console.error("❌ Failed to clear cognitive data:", error)
      throw error
    }
  }

  public async retrainFromKnowledge(): Promise<void> {
    console.log("🔄 Retraining cognitive system...")
    await this.initialize()
  }

  // PLACEHOLDER METHODS FOR COMPATIBILITY
  public generateSuggestions(): any[] {
    return []
  }
  public generateResponseSuggestions(): string[] {
    return []
  }
  public processFeedback(): void {}
  public updateResponseTime(): void {}
  public async addVocabularyWord(): Promise<void> {}
  public async removeVocabularyWord(): Promise<void> {}
  public async addMemoryEntry(): Promise<void> {}
  public async removeMemoryEntry(): Promise<void> {}
  public getMathFunctionCount(): number {
    return this.mathematics.size
  }
}

// TYPE DEFINITIONS
interface VocabularyEntry {
  word: string
  definition: string
  partOfSpeech: string
  examples: string[]
  phonetic: string
  frequency: number
  source: string
  learned: number
  confidence: number
}

interface MathEntry {
  concept: string
  type: string
  data: any
  source: string
  learned: number
  confidence: number
}

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
  category: string
  source: string
  confidence: number
  timestamp: number
}

interface AIResponse {
  content: string
  confidence: number
  reasoning?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}
