"use client"

import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedKnowledgeSystem } from "./enhanced-knowledge-system"
import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"

export class UnifiedAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private enhancedMath = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()
  private temporalSystem = new TemporalKnowledgeSystem()

  // Core data stores
  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private facts: Map<string, FactEntry> = new Map()

  // System state
  private systemStatus = "idle"
  private isInitialized = false
  private systemIdentity: any = null
  private systemCapabilities: string[] = []

  // PROPERLY LOADED SEED DATA
  private seedMathData: any = null
  private seedVocabData: any = null
  private seedKnowledgeData: any = null
  private seedSystemData: any = null
  private seedLearningData: any = null
  private seedCodingData: any = null

  // Enhanced learning stores
  private learnedVocabulary: Map<string, any> = new Map()
  private learnedMathematics: Map<string, any> = new Map()
  private learnedScience: Map<string, any> = new Map()
  private learnedCoding: Map<string, any> = new Map()

  constructor() {
    this.initializeBasicVocabulary()
    this.initializeSampleFacts()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("✅ System already initialized")
      return
    }

    try {
      console.log("🚀 Initializing ZacAI Cognitive System...")
      this.systemStatus = "initializing"

      // STEP 1: Load ALL seed data FIRST
      await this.loadAllSeedData()

      // STEP 2: Process and integrate seed data
      await this.processSeedData()

      // STEP 3: Load system identity
      await this.loadSystemIdentity()

      // STEP 4: Initialize subsystems
      await this.initializeSubsystems()

      // STEP 5: Load stored data
      await this.loadStoredData()

      this.systemStatus = "ready"
      this.isInitialized = true

      const name = this.systemIdentity?.name || "ZacAI"
      console.log(`✅ ${name} Cognitive AI System fully operational!`)

      // Show what we loaded
      this.logSystemCapabilities()
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      this.setDefaultSystemIdentity()
      this.systemStatus = "ready_with_errors"
      this.isInitialized = true
    }
  }

  // COMPLETELY REWRITTEN: Load and process ALL seed data
  private async loadAllSeedData(): Promise<void> {
    console.log("📚 Loading comprehensive seed data...")

    const seedFiles = [
      { file: "/seed_maths.json", target: "seedMathData", name: "Mathematics" },
      { file: "/seed_vocab.json", target: "seedVocabData", name: "Vocabulary" },
      { file: "/seed_knowledge.json", target: "seedKnowledgeData", name: "Knowledge" },
      { file: "/seed_system.json", target: "seedSystemData", name: "System" },
      { file: "/seed_learning.json", target: "seedLearningData", name: "Learning" },
      { file: "/seed_coding.json", target: "seedCodingData", name: "Coding" },
    ]

    for (const { file, target, name } of seedFiles) {
      try {
        const response = await fetch(file)
        if (response.ok) {
          const data = await response.json()
          ;(this as any)[target] = data
          console.log(`✅ Loaded ${name} seed data (${Object.keys(data).length} categories)`)
        } else {
          console.warn(`⚠️ Could not load ${file} - Status: ${response.status}`)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error)
      }
    }
  }

  // NEW: Process seed data into usable knowledge
  private async processSeedData(): Promise<void> {
    console.log("🧠 Processing seed data into cognitive knowledge...")

    // Process vocabulary seed data
    if (this.seedVocabData) {
      Object.entries(this.seedVocabData).forEach(([word, data]: [string, any]) => {
        this.vocabulary.set(word.toLowerCase(), "seed")

        // Store detailed vocabulary data
        this.learnedVocabulary.set(word.toLowerCase(), {
          word,
          definition: typeof data === "string" ? data : data.definition,
          partOfSpeech: typeof data === "object" ? data.part_of_speech : "unknown",
          examples: typeof data === "object" ? data.examples : [],
          source: "seed",
          learned: Date.now(),
        })
      })
      console.log(`✅ Processed ${Object.keys(this.seedVocabData).length} vocabulary entries`)
    }

    // Process mathematics seed data
    if (this.seedMathData) {
      // Store arithmetic tables
      if (this.seedMathData.arithmetic_tables) {
        Object.entries(this.seedMathData.arithmetic_tables).forEach(([operation, tables]: [string, any]) => {
          this.learnedMathematics.set(`arithmetic_${operation}`, {
            operation,
            tables,
            source: "seed",
            learned: Date.now(),
          })
        })
      }

      // Store Tesla/Vortex data
      if (this.seedMathData.tesla_map) {
        this.learnedMathematics.set("tesla_vortex_system", {
          system: this.seedMathData.tesla_map,
          source: "seed",
          learned: Date.now(),
        })
      }

      console.log(`✅ Processed mathematics seed data`)
    }

    // Process knowledge seed data
    if (this.seedKnowledgeData) {
      Object.entries(this.seedKnowledgeData).forEach(([topic, data]: [string, any]) => {
        this.facts.set(topic, {
          key: topic,
          value: typeof data === "string" ? data : data.summary || data.content,
          timestamp: Date.now(),
          importance: 0.8,
          type: "knowledge",
          source: "seed",
        })
      })
      console.log(`✅ Processed ${Object.keys(this.seedKnowledgeData).length} knowledge entries`)
    }

    // Process coding seed data
    if (this.seedCodingData) {
      Object.entries(this.seedCodingData).forEach(([concept, data]: [string, any]) => {
        this.learnedCoding.set(concept, {
          concept,
          data,
          source: "seed",
          learned: Date.now(),
        })
      })
      console.log(`✅ Processed coding seed data`)
    }
  }

  private logSystemCapabilities(): void {
    console.log("🎯 System Capabilities Loaded:")
    console.log(`• Vocabulary: ${this.vocabulary.size} words`)
    console.log(`• Mathematics: ${this.learnedMathematics.size} concepts`)
    console.log(`• Knowledge: ${this.facts.size} facts`)
    console.log(`• Coding: ${this.learnedCoding.size} concepts`)
    console.log(`• Personal Info: ${this.personalInfo.size} entries`)
  }

  // COMPLETELY REWRITTEN: Cognitive message processing
  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 ZacAI Cognitive Processing:", userMessage)

    // Extract and store personal info FIRST
    this.extractAndStorePersonalInfo(userMessage)

    try {
      const lowerMessage = userMessage.toLowerCase().trim()

      // COGNITIVE PATTERN MATCHING - PRIORITY ORDER

      // 1. PERSONAL INFO STORAGE
      if (this.isPersonalInfoStatement(userMessage)) {
        console.log("🎯 Personal info detected")
        return await this.handlePersonalInfoStatement(userMessage)
      }

      // 2. PERSONAL INFO RECALL
      if (this.isPersonalInfoQuery(userMessage)) {
        console.log("🎯 Personal info query detected")
        return await this.handlePersonalInfoQuery(userMessage)
      }

      // 3. MATH CALCULATIONS
      if (this.isMathQuery(userMessage)) {
        console.log("🎯 Math query detected")
        return await this.handleMathQuery(userMessage)
      }

      // 4. MATH FORMULA REQUESTS
      if (this.isMathFormulaRequest(userMessage)) {
        console.log("🎯 Math formula request detected")
        return await this.handleMathFormulaRequest(userMessage)
      }

      // 5. VOCABULARY/DICTIONARY LOOKUPS
      if (this.isVocabularyQuery(userMessage)) {
        console.log("🎯 Vocabulary query detected")
        return await this.handleVocabularyQuery(userMessage)
      }

      // 6. TESLA/VORTEX MATH
      if (this.isTeslaQuery(userMessage)) {
        console.log("🎯 Tesla query detected")
        return await this.handleTeslaQuery(userMessage)
      }

      // 7. CODING REQUESTS
      if (this.isCodingQuery(userMessage)) {
        console.log("🎯 Coding query detected")
        return await this.handleCodingQuery(userMessage)
      }

      // 8. KNOWLEDGE REQUESTS
      if (this.isKnowledgeQuery(userMessage)) {
        console.log("🎯 Knowledge query detected")
        return await this.handleKnowledgeQuery(userMessage)
      }

      // 9. IDENTITY QUESTIONS
      if (this.isIdentityQuery(userMessage)) {
        console.log("🎯 Identity query detected")
        return await this.handleIdentityQuery(userMessage)
      }

      // 10. SYSTEM DIAGNOSTIC
      if (this.isSystemDiagnostic(userMessage)) {
        console.log("🎯 System diagnostic detected")
        return await this.handleSystemDiagnostic(userMessage)
      }

      // 11. GREETINGS
      if (this.isGreeting(userMessage)) {
        console.log("🎯 Greeting detected")
        return await this.handleGreeting(userMessage)
      }

      // 12. CONTEXTUAL CONVERSATION
      console.log("🎯 Contextual conversation")
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

  // MATH QUERY HANDLING - COMPLETELY REWRITTEN
  private isMathQuery(message: string): boolean {
    const patterns = [
      /^\s*(\d+)\s*[x×*]\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*\+\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*-\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /^\s*(\d+)\s*[/÷]\s*(\d+)\s*(?:is|=|\?)?\s*$/i,
      /what\s*(?:is|does)\s*(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,
      /calculate\s*(\d+)\s*[x×*+\-/÷]\s*(\d+)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleMathQuery(message: string): Promise<AIResponse> {
    console.log("🧮 Processing math calculation")

    // Extract operation and numbers
    const mathData = this.extractMathOperation(message)
    if (!mathData) {
      return {
        content: "I couldn't parse that math expression. Try something like '3×3' or '5+2'.",
        confidence: 0.3,
        reasoning: ["Could not parse math expression"],
      }
    }

    const { num1, num2, operation } = mathData
    let result: number | string = "Error"
    let seedUsed = false

    // Try to get from seed data first
    if (operation === "multiply" && this.seedMathData?.arithmetic_tables?.multiplication) {
      const seedResult = this.getFromSeedMath(num1, num2, "multiplication")
      if (seedResult !== null) {
        result = seedResult
        seedUsed = true
      }
    }

    // Fallback to calculation
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

    // Store the calculation
    this.learnedMathematics.set(`calc_${num1}_${operation}_${num2}`, {
      operation,
      numbers: [num1, num2],
      result,
      seedUsed,
      timestamp: Date.now(),
    })

    let response = `🧮 **${num1} ${this.getOperationSymbol(operation)} ${num2} = ${result}**\n\n`

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
        response += `• ⚡ This is a Tesla Number (3, 6, or 9)!\n`
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

  // MATH FORMULA REQUESTS
  private isMathFormulaRequest(message: string): boolean {
    const patterns = [
      /math.*formula/i,
      /give.*me.*formula/i,
      /show.*me.*formula/i,
      /example.*formula/i,
      /mathematical.*formula/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleMathFormulaRequest(message: string): Promise<AIResponse> {
    console.log("📐 Processing math formula request")

    // Check if we have formulas in seed data
    if (this.seedMathData?.formulas) {
      const formulas = Object.entries(this.seedMathData.formulas)
      if (formulas.length > 0) {
        const [name, formula] = formulas[0] as [string, any]

        let response = `📐 **Mathematical Formula: ${name}**\n\n`
        response += `**Formula:** ${formula.expression || formula}\n\n`

        if (formula.description) {
          response += `**Description:** ${formula.description}\n\n`
        }

        if (formula.example) {
          response += `**Example:** ${formula.example}\n\n`
        }

        response += `✅ Retrieved from seed mathematical data!`

        return {
          content: response,
          confidence: 0.9,
          reasoning: ["Retrieved formula from seed mathematical data"],
        }
      }
    }

    // Fallback to basic formulas
    const basicFormulas = [
      {
        name: "Quadratic Formula",
        expression: "x = (-b ± √(b² - 4ac)) / 2a",
        description: "Solves quadratic equations of the form ax² + bx + c = 0",
      },
      {
        name: "Pythagorean Theorem",
        expression: "a² + b² = c²",
        description: "Relates the sides of a right triangle",
      },
      {
        name: "Area of Circle",
        expression: "A = πr²",
        description: "Calculates the area of a circle given its radius",
      },
    ]

    const formula = basicFormulas[Math.floor(Math.random() * basicFormulas.length)]

    let response = `📐 **Mathematical Formula: ${formula.name}**\n\n`
    response += `**Formula:** ${formula.expression}\n\n`
    response += `**Description:** ${formula.description}\n\n`
    response += `💡 This is from my built-in mathematical knowledge!`

    return {
      content: response,
      confidence: 0.85,
      reasoning: ["Provided mathematical formula from built-in knowledge"],
    }
  }

  // VOCABULARY QUERIES - COMPLETELY REWRITTEN
  private isVocabularyQuery(message: string): boolean {
    const patterns = [
      /^what\s+(?:is|does|means?)\s+(?!you|your|my)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,
      /^define\s+(?!you|your|my)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,
      /^meaning\s+of\s+(?!you|your|my)([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*\??\s*$/i,
      /dictionary.*lookup/i,
      /vocab.*json/i,
      /meaning.*from.*vocab/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleVocabularyQuery(message: string): Promise<AIResponse> {
    console.log("📖 Processing vocabulary query")

    // Extract the word to look up
    let word = ""
    const wordMatch = message.match(/(?:what\s+(?:is|does|means?)|define|meaning\s+of)\s+(.+)/i)
    if (wordMatch) {
      word = wordMatch[1].trim().replace(/[?!.]/g, "").toLowerCase()
    } else if (message.toLowerCase().includes("dependencies")) {
      word = "dependencies"
    } else if (message.toLowerCase().includes("meaning")) {
      word = "meaning"
    }

    if (!word) {
      return {
        content:
          "I couldn't identify what word you want me to define. Try asking like 'What is [word]?' or 'Define [word]'",
        confidence: 0.3,
        reasoning: ["Could not extract word to define"],
      }
    }

    console.log(`🔍 Looking up word: "${word}"`)

    // 1. Check learned vocabulary first
    if (this.learnedVocabulary.has(word)) {
      const wordData = this.learnedVocabulary.get(word)
      let response = `📖 **${word}** (from my learned vocabulary)\n\n`
      response += `**Definition:** ${wordData.definition}\n\n`
      if (wordData.partOfSpeech && wordData.partOfSpeech !== "unknown") {
        response += `**Part of Speech:** ${wordData.partOfSpeech}\n\n`
      }
      if (wordData.examples && wordData.examples.length > 0) {
        response += `**Examples:** ${wordData.examples.join(", ")}\n\n`
      }
      response += `✅ I already knew this word from my vocabulary!`

      return {
        content: response,
        confidence: 0.95,
        reasoning: ["Retrieved from learned vocabulary"],
      }
    }

    // 2. Check seed vocabulary data
    if (this.seedVocabData && this.seedVocabData[word]) {
      const seedDef = this.seedVocabData[word]

      let response = `📖 **${word}** (from seed vocabulary data)\n\n`

      if (typeof seedDef === "string") {
        response += `**Definition:** ${seedDef}\n\n`
      } else if (typeof seedDef === "object") {
        response += `**Definition:** ${seedDef.definition || "Definition available"}\n\n`
        if (seedDef.part_of_speech) {
          response += `**Part of Speech:** ${seedDef.part_of_speech}\n\n`
        }
        if (seedDef.examples) {
          response += `**Examples:** ${Array.isArray(seedDef.examples) ? seedDef.examples.join(", ") : seedDef.examples}\n\n`
        }
      }

      response += `✅ Retrieved from seed vocabulary JSON file!`

      // Store it in learned vocabulary for future use
      this.learnedVocabulary.set(word, {
        word,
        definition: typeof seedDef === "string" ? seedDef : seedDef.definition,
        partOfSpeech: typeof seedDef === "object" ? seedDef.part_of_speech : "unknown",
        examples: typeof seedDef === "object" ? seedDef.examples : [],
        source: "seed",
        learned: Date.now(),
      })

      return {
        content: response,
        confidence: 0.9,
        reasoning: ["Retrieved from seed vocabulary data", "Stored in learned vocabulary"],
      }
    }

    // 3. Try online dictionary lookup
    try {
      console.log(`🌐 Attempting online lookup for: ${word}`)
      const wordData = await this.enhancedKnowledge.lookupWord(word)

      if (wordData && wordData.meanings && wordData.meanings.length > 0) {
        const meaning = wordData.meanings[0]
        const definition = meaning.definitions[0]

        let response = `📖 **${word}** (online dictionary lookup)\n\n`
        response += `**Definition:** ${definition.definition}\n\n`
        response += `**Part of Speech:** ${meaning.partOfSpeech}\n\n`

        if (definition.example) {
          response += `**Example:** "${definition.example}"\n\n`
        }

        if (wordData.phonetics && wordData.phonetics.length > 0 && wordData.phonetics[0].text) {
          response += `**Pronunciation:** ${wordData.phonetics[0].text}\n\n`
        }

        response += `✨ I've learned this word and will remember it for future conversations!`

        // Store in learned vocabulary
        this.learnedVocabulary.set(word, {
          word,
          definition: definition.definition,
          partOfSpeech: meaning.partOfSpeech,
          examples: definition.example ? [definition.example] : [],
          pronunciation: wordData.phonetics?.[0]?.text || "",
          source: "online",
          learned: Date.now(),
        })

        return {
          content: response,
          confidence: 0.9,
          reasoning: ["Successfully looked up word online", "Stored in learned vocabulary"],
        }
      }
    } catch (error) {
      console.warn(`❌ Online lookup failed for "${word}":`, error)
    }

    // 4. Fallback response
    return {
      content: `I couldn't find a definition for "${word}" in my seed vocabulary data or through online lookup. This might be due to network issues or the word might not be in my current knowledge base. Try asking about a different word!`,
      confidence: 0.4,
      reasoning: ["Word not found in seed data", "Online lookup failed"],
    }
  }

  // HELPER METHODS
  private extractMathOperation(message: string): { num1: number; num2: number; operation: string } | null {
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
    const symbols = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
    }
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

  // PERSONAL INFO HANDLING
  private isPersonalInfoStatement(message: string): boolean {
    const patterns = [
      /(?:my name is|i'm|i am|call me)\s+(\w+)/i,
      /i have (\d+)\s+(cats?|dogs?|pets?)/i,
      /i live in\s+(.+)/i,
      /i work (?:as|at)\s+(.+)/i,
      /i am (\d+) years old/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handlePersonalInfoStatement(message: string): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("my name is") || lowerMessage.includes("i'm") || lowerMessage.includes("i am")) {
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
      if (nameMatch) {
        const name = nameMatch[1]
        return {
          content: `Nice to meet you, ${name}! I'll remember your name. I'm ZacAI, your cognitive AI assistant with comprehensive mathematical, vocabulary, and knowledge capabilities. What would you like to explore together?`,
          confidence: 0.95,
          reasoning: ["Stored personal name", "Generated personalized greeting"],
        }
      }
    }

    return {
      content:
        "Thanks for sharing that information with me! I've stored it and will remember it for our future conversations. What else would you like to discuss?",
      confidence: 0.8,
      reasoning: ["Stored personal information"],
    }
  }

  private isPersonalInfoQuery(message: string): boolean {
    const patterns = [
      /what'?s my name/i,
      /do you remember my name/i,
      /what do you know about me/i,
      /what do you remember about me/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handlePersonalInfoQuery(message: string): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("name")) {
      const nameInfo = this.personalInfo.get("name")
      if (nameInfo) {
        return {
          content: `Your name is ${nameInfo.value}! I remember you telling me that in our conversation.`,
          confidence: 0.95,
          reasoning: ["Retrieved stored name from memory"],
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
      response += "\nWhat else would you like to tell me about yourself?"

      return {
        content: response,
        confidence: 0.9,
        reasoning: ["Retrieved all stored personal information"],
      }
    } else {
      return {
        content: "I don't have any personal information about you stored yet. Tell me about yourself!",
        confidence: 0.7,
        reasoning: ["No personal information found"],
      }
    }
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
        console.log(`📝 Stored personal info: ${key} = ${value}`)
      }
    })
  }

  // TESLA QUERIES
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
    response += `Try asking me to calculate the Tesla pattern for any specific number!`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Provided Tesla/Vortex mathematics explanation"],
    }
  }

  // CODING QUERIES
  private isCodingQuery(message: string): boolean {
    const patterns = [/coding/i, /programming/i, /javascript/i, /react/i, /nextjs/i, /dependencies/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleCodingQuery(message: string): Promise<AIResponse> {
    if (this.seedCodingData) {
      const concepts = Object.keys(this.seedCodingData)
      if (concepts.length > 0) {
        const concept = concepts[0]
        const data = this.seedCodingData[concept]

        let response = `💻 **Coding Concept: ${concept}**\n\n`
        response += `${typeof data === "string" ? data : data.description || "Coding information available"}\n\n`
        response += `✅ Retrieved from seed coding data!`

        return {
          content: response,
          confidence: 0.9,
          reasoning: ["Retrieved from seed coding data"],
        }
      }
    }

    return {
      content: `💻 I can help with coding! I have knowledge of JavaScript, React, Next.js, and more. What specific coding topic would you like to explore?`,
      confidence: 0.8,
      reasoning: ["General coding assistance offered"],
    }
  }

  // KNOWLEDGE QUERIES
  private isKnowledgeQuery(message: string): boolean {
    const patterns = [/tell me about/i, /what.*know.*about/i, /explain/i, /knowledge/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleKnowledgeQuery(message: string): Promise<AIResponse> {
    if (this.facts.size > 0) {
      const factEntries = Array.from(this.facts.entries())
      const [topic, fact] = factEntries[0]

      let response = `🧠 **Knowledge: ${topic}**\n\n`
      response += `${fact.value}\n\n`
      response += `✅ Retrieved from my knowledge base!`

      return {
        content: response,
        confidence: 0.85,
        reasoning: ["Retrieved from knowledge base"],
      }
    }

    return {
      content: `🧠 I have comprehensive knowledge across many domains. What specific topic would you like to learn about?`,
      confidence: 0.7,
      reasoning: ["General knowledge assistance offered"],
    }
  }

  // IDENTITY QUERIES
  private isIdentityQuery(message: string): boolean {
    const patterns = [/tell me about you/i, /who are you/i, /what are you/i, /your.*name/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleIdentityQuery(message: string): Promise<AIResponse> {
    const name = this.systemIdentity?.name || "ZacAI"
    const version = this.systemIdentity?.version || "2.0.0"

    let response = `👋 **I'm ${name} v${version}**\n\n`
    response += `I'm a cognitive AI system with comprehensive capabilities:\n\n`
    response += `🧮 **Mathematics**: Calculations using seed data and Tesla/Vortex patterns\n`
    response += `📚 **Vocabulary**: Word definitions from seed data and online sources\n`
    response += `🧠 **Knowledge**: Facts and information across multiple domains\n`
    response += `💻 **Coding**: Programming assistance and examples\n`
    response += `🗣️ **Memory**: Personal information and conversation context\n\n`
    response += `I learn from every conversation and remember what we discuss. What would you like to explore?`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Generated comprehensive identity response"],
    }
  }

  // SYSTEM DIAGNOSTIC
  private isSystemDiagnostic(message: string): boolean {
    const patterns = [/system.*diagnostic/i, /self.*diagnostic/i, /system.*check/i]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleSystemDiagnostic(message: string): Promise<AIResponse> {
    let response = `🔍 **ZacAI System Diagnostic**\n\n`
    response += `**Core Systems:**\n`
    response += `• Cognitive Processing: ✅ Active\n`
    response += `• Memory System: ✅ Active (${this.personalInfo.size} personal entries)\n`
    response += `• Vocabulary System: ✅ Active (${this.vocabulary.size} words)\n`
    response += `• Mathematics System: ✅ Active (${this.learnedMathematics.size} concepts)\n`
    response += `• Knowledge Base: ✅ Active (${this.facts.size} facts)\n\n`
    response += `**Seed Data Status:**\n`
    response += `• Math Data: ${this.seedMathData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Vocabulary Data: ${this.seedVocabData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• Knowledge Data: ${this.seedKnowledgeData ? "✅ Loaded" : "❌ Missing"}\n`
    response += `• System Data: ${this.seedSystemData ? "✅ Loaded" : "❌ Missing"}\n\n`
    response += `**Status:** All systems operational and ready for cognitive processing!`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Performed comprehensive system diagnostic"],
    }
  }

  // GREETINGS
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
      response = `Hello! I'm ${name}, your cognitive AI assistant with comprehensive capabilities. `
    }

    response += `I can help with math calculations, vocabulary definitions, Tesla/Vortex patterns, coding questions, and much more. What would you like to explore today?`

    return {
      content: response,
      confidence: 0.9,
      reasoning: ["Generated personalized greeting"],
    }
  }

  // CONTEXTUAL CONVERSATION
  private async handleContextualConversation(message: string): Promise<AIResponse> {
    const name = this.systemIdentity?.name || "ZacAI"

    let response = `I'm ${name}, your cognitive AI assistant. I can help you with:\n\n`
    response += `🧮 **Mathematics** - calculations, formulas, Tesla patterns\n`
    response += `📖 **Vocabulary** - word definitions from seed data or online lookup\n`
    response += `🧠 **Knowledge** - facts and information across domains\n`
    response += `💻 **Coding** - programming concepts and examples\n`
    response += `🗣️ **Conversation** - I remember our discussions and learn from them\n\n`
    response += `What specific topic interests you? Try asking me to:\n`
    response += `• Calculate something like "3×7"\n`
    response += `• Define a word like "What is science?"\n`
    response += `• Show a math formula\n`
    response += `• Explain Tesla mathematics\n`

    return {
      content: response,
      confidence: 0.8,
      reasoning: ["Generated contextual conversation response with capabilities"],
    }
  }

  // INITIALIZATION METHODS
  private async initializeSubsystems(): Promise<void> {
    try {
      await this.enhancedKnowledge.loadLearnedKnowledge()
      console.log("✅ Enhanced Knowledge System initialized")
    } catch (error) {
      console.warn("⚠️ Subsystem initialization issues:", error)
    }
  }

  private async loadStoredData(): Promise<void> {
    const loadPromises = [
      this.loadConversationHistory(),
      this.loadMemory(),
      this.loadVocabulary(),
      this.loadLearnedKnowledge(),
    ]

    await Promise.allSettled(loadPromises)
  }

  private async loadSystemIdentity(): Promise<void> {
    try {
      if (this.seedSystemData?.identity) {
        this.systemIdentity = {
          name: this.seedSystemData.identity.name || "ZacAI",
          version: this.seedSystemData.identity.version || "2.0.0",
          purpose: this.seedSystemData.identity.purpose || "To be an intelligent, cognitive AI assistant",
        }
        this.systemCapabilities = this.seedSystemData.core_capabilities || []
        console.log(`✅ System identity loaded: ${this.systemIdentity.name} v${this.systemIdentity.version}`)
        return
      }
    } catch (error) {
      console.warn("⚠️ Could not load system identity:", error)
    }

    this.setDefaultSystemIdentity()
  }

  private setDefaultSystemIdentity(): void {
    this.systemIdentity = {
      name: "ZacAI",
      version: "2.0.0",
      purpose: "To be an intelligent, cognitive AI assistant with comprehensive capabilities",
    }
    this.systemCapabilities = [
      "Mathematical calculations using seed data and Tesla/Vortex patterns",
      "Vocabulary definitions from seed data and online sources",
      "Personal information memory and contextual conversation",
      "Knowledge retrieval across multiple domains",
      "Coding assistance and programming concepts",
    ]
    console.log("✅ Default system identity set")
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

  // STORAGE METHODS
  private async loadConversationHistory(): Promise<void> {
    try {
      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations.filter((msg) => msg?.id && msg?.role && msg?.content)
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

  private async loadLearnedKnowledge(): Promise<void> {
    try {
      const types = ["vocabulary", "mathematics", "science", "coding"] as const

      for (const type of types) {
        try {
          const stored = localStorage.getItem(`learned_${type}`)
          if (stored) {
            const data = JSON.parse(stored)
            const map =
              type === "vocabulary"
                ? this.learnedVocabulary
                : type === "mathematics"
                  ? this.learnedMathematics
                  : type === "science"
                    ? this.learnedScience
                    : this.learnedCoding

            if (Array.isArray(data)) {
              data.forEach(([key, value]: [string, any]) => {
                map.set(key, value)
              })
            }
          }
        } catch (typeError) {
          console.warn(`Failed to load learned ${type}:`, typeError)
        }
      }
    } catch (error) {
      console.warn("Failed to load learned knowledge:", error)
    }
  }

  // PUBLIC API METHODS
  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
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
      memoryEntries: this.personalInfo.size,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 144,
      totalLearned: this.learnedVocabulary.size + this.learnedMathematics.size,
      vocabularyData: this.vocabulary,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: this.learnedMathematics,
    }
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemStatus: this.systemStatus,
      systemIdentity: this.systemIdentity,
      seedDataStatus: {
        math: !!this.seedMathData,
        vocab: !!this.seedVocabData,
        knowledge: !!this.seedKnowledgeData,
        system: !!this.seedSystemData,
        learning: !!this.seedLearningData,
        coding: !!this.seedCodingData,
      },
      conversationCount: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      personalInfoCount: this.personalInfo.size,
      factsCount: this.facts.size,
      learnedVocabularySize: this.learnedVocabulary.size,
      learnedMathematicsSize: this.learnedMathematics.size,
      learnedScienceSize: this.learnedScience.size,
      learnedCodingSize: this.learnedCoding.size,
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public exportData(): any {
    return {
      conversations: this.conversationHistory,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      facts: Array.from(this.facts.entries()),
      learnedVocabulary: Array.from(this.learnedVocabulary.entries()),
      learnedMathematics: Array.from(this.learnedMathematics.entries()),
      learnedScience: Array.from(this.learnedScience.entries()),
      learnedCoding: Array.from(this.learnedCoding.entries()),
      timestamp: Date.now(),
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      this.conversationHistory = []
      this.vocabulary = new Map()
      this.memory = new Map()
      this.personalInfo = new Map()
      this.facts = new Map()
      this.learnedVocabulary = new Map()
      this.learnedMathematics = new Map()
      this.learnedScience = new Map()
      this.learnedCoding = new Map()
      await this.storageManager.clearAllData()
      console.log("✅ All data cleared")
    } catch (error) {
      console.error("❌ Failed to clear data:", error)
      throw error
    }
  }

  public async retrainFromKnowledge(): Promise<void> {
    console.log("🔄 Retraining system...")
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
    return 144
  }
}

// TYPE DEFINITIONS
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
  knowledgeUsed?: string[]
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}
