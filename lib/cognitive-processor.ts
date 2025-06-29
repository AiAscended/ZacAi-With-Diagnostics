"use client"

import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"

// UNIFIED COGNITIVE PROCESSOR - THE MAIN BRAIN
export class CognitiveProcessor {
  private knowledgeBase: Map<string, any> = new Map()
  private personalMemory: Map<string, any> = new Map()
  private vocabularySystem: Map<string, any> = new Map()
  private mathematicsEngine: EnhancedMathProcessor
  private temporalSystem: TemporalKnowledgeSystem
  private neuralWeights: Map<string, number[]> = new Map()
  private conversationHistory: any[] = []
  private learningRate = 0.01
  private confidenceThreshold = 0.7
  private isInitialized = false
  private systemStats = {
    totalMessages: 0,
    vocabularySize: 0,
    mathFunctions: 0,
    memoryEntries: 0,
    avgConfidence: 0,
    responseTime: 0,
    learningProgress: 0,
  }

  constructor() {
    console.log("🧠 Initializing Advanced Cognitive Processor...")
    this.mathematicsEngine = new EnhancedMathProcessor()
    this.temporalSystem = new TemporalKnowledgeSystem()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Loading cognitive systems...")

      // Load all seed data
      await Promise.all([
        this.loadSeedVocabulary(),
        this.loadSeedMathematics(),
        this.loadSeedKnowledge(),
        this.loadSeedSystem(),
        this.loadPersonalMemory(),
      ])

      // Initialize neural weights
      this.initializeNeuralWeights()

      // Initialize subsystems
      await this.temporalSystem.initialize?.()

      this.isInitialized = true
      this.updateStats()
      console.log("✅ Cognitive Processor fully initialized!")
    } catch (error) {
      console.error("❌ Cognitive Processor initialization failed:", error)
      throw error
    }
  }

  // MAIN COGNITIVE PROCESSING PIPELINE
  public async processMessage(userMessage: string): Promise<CognitiveResponse> {
    const startTime = Date.now()
    console.log(`🧠 Processing: "${userMessage}"`)

    try {
      // Stage 1: Input Analysis & Classification
      const inputAnalysis = await this.analyzeInput(userMessage)
      console.log(
        `📊 Input classified as: ${inputAnalysis.type} (confidence: ${Math.round(inputAnalysis.confidence * 100)}%)`,
      )

      // Stage 2: Multi-Pathway Cognitive Processing
      const cognitiveResults = await this.processCognitivePathways(userMessage, inputAnalysis)

      // Stage 3: Knowledge Synthesis & Learning
      const synthesis = await this.synthesizeKnowledge(cognitiveResults, userMessage)

      // Stage 4: Response Generation
      const response = await this.generateIntelligentResponse(synthesis, userMessage)

      // Stage 5: Learning & Memory Update
      await this.updateMemoryAndLearning(userMessage, response)

      // Update stats
      this.systemStats.totalMessages++
      this.systemStats.responseTime = Date.now() - startTime
      this.updateStats()

      console.log(`✅ Response generated in ${Date.now() - startTime}ms`)

      return {
        content: response.content,
        confidence: response.confidence,
        reasoning: response.reasoning,
        pathways: cognitiveResults.pathways,
        learningExtracted: response.learningExtracted || [],
      }
    } catch (error) {
      console.error("❌ Cognitive processing error:", error)
      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.3,
        reasoning: [`Error: ${error}`],
        pathways: ["error"],
        learningExtracted: [],
      }
    }
  }

  // ADVANCED INPUT ANALYSIS
  private async analyzeInput(input: string): Promise<InputAnalysis> {
    const analysis: InputAnalysis = {
      type: "conversational",
      confidence: 0.5,
      complexity: 0.3,
      features: {
        hasNumbers: /\d/.test(input),
        hasMathOperators: /[+\-×*÷/=]/.test(input),
        hasQuestions: /\?/.test(input),
        hasPersonalInfo: /\b(my|i|me|am|have|name|wife|cats|family)\b/i.test(input),
        hasTimeReference: this.temporalSystem.isDateTimeQuery(input),
        hasVocabularyRequest: /\b(what\s+(?:is|does|means?)|define)\s+\w+/i.test(input),
        wordCount: input.split(/\s+/).length,
        sentiment: this.analyzeSentiment(input),
      },
      keywords: this.extractKeywords(input),
    }

    // Advanced classification logic
    if (analysis.features.hasMathOperators && analysis.features.hasNumbers) {
      analysis.type = "mathematical"
      analysis.confidence = 0.95
      analysis.complexity = this.calculateMathComplexity(input)
    } else if (analysis.features.hasVocabularyRequest) {
      analysis.type = "vocabulary"
      analysis.confidence = 0.9
      analysis.complexity = 0.4
    } else if (analysis.features.hasPersonalInfo) {
      analysis.type = "personal"
      analysis.confidence = 0.8
      analysis.complexity = 0.5
    } else if (analysis.features.hasTimeReference) {
      analysis.type = "temporal"
      analysis.confidence = 0.85
      analysis.complexity = 0.4
    } else if (analysis.features.hasQuestions) {
      analysis.type = "inquiry"
      analysis.confidence = 0.7
      analysis.complexity = 0.6
    }

    return analysis
  }

  // MULTI-PATHWAY COGNITIVE PROCESSING
  private async processCognitivePathways(input: string, analysis: InputAnalysis): Promise<CognitiveResults> {
    const pathwayResults: PathwayResult[] = []
    const activePathways: string[] = []

    // Mathematical Pathway
    if (analysis.type === "mathematical" || analysis.features.hasNumbers) {
      activePathways.push("mathematical")
      const mathResult = await this.processMathematicalPathway(input)
      pathwayResults.push(mathResult)
    }

    // Vocabulary Pathway
    if (analysis.type === "vocabulary" || analysis.features.hasVocabularyRequest) {
      activePathways.push("vocabulary")
      const vocabResult = await this.processVocabularyPathway(input)
      pathwayResults.push(vocabResult)
    }

    // Personal Memory Pathway
    if (analysis.type === "personal" || analysis.features.hasPersonalInfo) {
      activePathways.push("personal")
      const personalResult = await this.processPersonalPathway(input)
      pathwayResults.push(personalResult)
    }

    // Temporal Pathway
    if (analysis.type === "temporal" || analysis.features.hasTimeReference) {
      activePathways.push("temporal")
      const temporalResult = await this.processTemporalPathway(input)
      pathwayResults.push(temporalResult)
    }

    // Knowledge Retrieval Pathway
    if (analysis.type === "inquiry" || analysis.features.hasQuestions) {
      activePathways.push("knowledge")
      const knowledgeResult = await this.processKnowledgePathway(input)
      pathwayResults.push(knowledgeResult)
    }

    // Always include conversational pathway as fallback
    activePathways.push("conversational")
    const conversationalResult = await this.processConversationalPathway(input, analysis)
    pathwayResults.push(conversationalResult)

    return {
      pathways: activePathways,
      results: pathwayResults,
      primaryResult: pathwayResults.reduce((best, current) => (current.confidence > best.confidence ? current : best)),
    }
  }

  // MATHEMATICAL PATHWAY PROCESSING
  private async processMathematicalPathway(input: string): Promise<PathwayResult> {
    console.log("🧮 Processing mathematical pathway...")

    try {
      const mathAnalysis = this.mathematicsEngine.analyzeMathExpression(input)

      if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
        return {
          pathway: "mathematical",
          confidence: mathAnalysis.confidence,
          data: {
            answer: mathAnalysis.result,
            operation: mathAnalysis.operation,
            numbers: mathAnalysis.numbers,
            steps: this.generateMathSteps(mathAnalysis),
            reasoning: mathAnalysis.reasoning,
          },
        }
      }
    } catch (error) {
      console.error("Mathematical pathway error:", error)
    }

    return {
      pathway: "mathematical",
      confidence: 0.2,
      data: { error: "Could not process mathematical expression" },
    }
  }

  // VOCABULARY PATHWAY PROCESSING
  private async processVocabularyPathway(input: string): Promise<PathwayResult> {
    console.log("📖 Processing vocabulary pathway...")

    const wordMatch = input.match(/(?:what\s+(?:is|does|means?)|define)\s+(\w+)/i)
    if (!wordMatch) {
      return {
        pathway: "vocabulary",
        confidence: 0.3,
        data: { error: "Could not extract word to define" },
      }
    }

    const word = wordMatch[1].toLowerCase()

    // Check existing vocabulary
    if (this.vocabularySystem.has(word)) {
      const entry = this.vocabularySystem.get(word)
      return {
        pathway: "vocabulary",
        confidence: 0.9,
        data: {
          word,
          definition: entry.definition,
          partOfSpeech: entry.partOfSpeech,
          examples: entry.examples,
          source: entry.source,
        },
      }
    }

    // Try to learn new word
    try {
      const newWordData = await this.learnNewWord(word)
      if (newWordData) {
        return {
          pathway: "vocabulary",
          confidence: 0.8,
          data: {
            word,
            ...newWordData,
            source: "learned",
            isNew: true,
          },
        }
      }
    } catch (error) {
      console.error("Vocabulary learning error:", error)
    }

    return {
      pathway: "vocabulary",
      confidence: 0.4,
      data: { word, error: "Word not found and could not be learned" },
    }
  }

  // PERSONAL MEMORY PATHWAY PROCESSING
  private async processPersonalPathway(input: string): Promise<PathwayResult> {
    console.log("👤 Processing personal pathway...")

    // Extract personal information
    const extractedInfo = this.extractPersonalInformation(input)

    // Store new personal information
    for (const info of extractedInfo) {
      this.personalMemory.set(info.key, {
        ...info,
        timestamp: Date.now(),
        confidence: 0.9,
      })
    }

    // Query personal information
    if (input.toLowerCase().includes("remember") || input.toLowerCase().includes("my name")) {
      const personalData = Array.from(this.personalMemory.entries())
      return {
        pathway: "personal",
        confidence: 0.9,
        data: {
          memories: personalData,
          newInfo: extractedInfo,
        },
      }
    }

    return {
      pathway: "personal",
      confidence: 0.7,
      data: {
        newInfo: extractedInfo,
        totalMemories: this.personalMemory.size,
      },
    }
  }

  // TEMPORAL PATHWAY PROCESSING
  private async processTemporalPathway(input: string): Promise<PathwayResult> {
    console.log("⏰ Processing temporal pathway...")

    try {
      const temporalResponse = this.temporalSystem.handleDateTimeQuery(input)
      return {
        pathway: "temporal",
        confidence: 0.9,
        data: {
          response: temporalResponse,
          currentTime: this.temporalSystem.getCurrentDateTime(),
        },
      }
    } catch (error) {
      return {
        pathway: "temporal",
        confidence: 0.3,
        data: { error: "Could not process temporal query" },
      }
    }
  }

  // KNOWLEDGE RETRIEVAL PATHWAY
  private async processKnowledgePathway(input: string): Promise<PathwayResult> {
    console.log("🔍 Processing knowledge pathway...")

    const searchResults = this.searchKnowledgeBase(input)

    if (searchResults.length > 0) {
      return {
        pathway: "knowledge",
        confidence: 0.8,
        data: {
          results: searchResults.slice(0, 3),
          totalFound: searchResults.length,
        },
      }
    }

    return {
      pathway: "knowledge",
      confidence: 0.4,
      data: { message: "No specific knowledge found for this query" },
    }
  }

  // CONVERSATIONAL PATHWAY PROCESSING
  private async processConversationalPathway(input: string, analysis: InputAnalysis): Promise<PathwayResult> {
    console.log("💬 Processing conversational pathway...")

    const userName = this.personalMemory.get("name")?.value
    const greeting = userName ? `${userName}, ` : ""

    // Greeting detection
    if (/^(hi|hello|hey)$/i.test(input.trim())) {
      return {
        pathway: "conversational",
        confidence: 0.9,
        data: {
          response: `${greeting}Hello! I'm your advanced AI assistant. I can help with math, vocabulary, remember personal information, and much more. What would you like to explore?`,
          type: "greeting",
        },
      }
    }

    // Default conversational response
    return {
      pathway: "conversational",
      confidence: 0.6,
      data: {
        response: `${greeting}I understand you said: "${input}". I'm here to help with calculations, definitions, personal memory, and general questions. What would you like to know?`,
        type: "general",
      },
    }
  }

  // KNOWLEDGE SYNTHESIS
  private async synthesizeKnowledge(results: CognitiveResults, originalInput: string): Promise<KnowledgeSynthesis> {
    console.log("🔗 Synthesizing knowledge from cognitive pathways...")

    const primaryResult = results.primaryResult
    const userName = this.personalMemory.get("name")?.value

    return {
      primaryPathway: primaryResult.pathway,
      confidence: primaryResult.confidence,
      data: primaryResult.data,
      userName,
      allResults: results.results,
      synthesis: this.createSynthesis(results.results, originalInput),
    }
  }

  // INTELLIGENT RESPONSE GENERATION
  private async generateIntelligentResponse(
    synthesis: KnowledgeSynthesis,
    originalInput: string,
  ): Promise<ResponseGeneration> {
    console.log("💡 Generating intelligent response...")

    const namePrefix = synthesis.userName ? `${synthesis.userName}, ` : ""
    let content = ""
    let reasoning: string[] = []
    const learningExtracted: string[] = []

    switch (synthesis.primaryPathway) {
      case "mathematical":
        if (synthesis.data.answer !== undefined) {
          content = `${namePrefix}🧮 **${synthesis.data.answer}**\n\n`
          if (synthesis.data.steps) {
            content += `**Steps:**\n${synthesis.data.steps.join("\n")}\n\n`
          }
          content += `**Operation:** ${synthesis.data.operation}`
          reasoning = synthesis.data.reasoning || ["Performed mathematical calculation"]
        } else {
          content = `${namePrefix}I can help with math calculations. Try something like "5×5" or "10+3".`
          reasoning = ["Could not process mathematical expression"]
        }
        break

      case "vocabulary":
        if (synthesis.data.definition) {
          content = `${namePrefix}📖 **${synthesis.data.word}**\n\n`
          content += `**Definition:** ${synthesis.data.definition}\n\n`
          if (synthesis.data.partOfSpeech) {
            content += `**Part of Speech:** ${synthesis.data.partOfSpeech}\n\n`
          }
          if (synthesis.data.examples && synthesis.data.examples.length > 0) {
            content += `**Examples:** ${synthesis.data.examples.join(", ")}\n\n`
          }
          content += `**Source:** ${synthesis.data.source}`

          if (synthesis.data.isNew) {
            content += "\n\n✨ I've learned this word!"
            learningExtracted.push(`vocabulary: ${synthesis.data.word}`)
          }

          reasoning = ["Retrieved/learned word definition"]
        } else {
          content = `${namePrefix}I don't know the word "${synthesis.data.word}" yet.`
          reasoning = ["Word not found in vocabulary"]
        }
        break

      case "personal":
        if (synthesis.data.memories && synthesis.data.memories.length > 0) {
          content = `${namePrefix}Here's what I remember about you:\n\n`
          synthesis.data.memories.forEach(([key, entry]: [string, any]) => {
            content += `• **${key}**: ${entry.value}\n`
          })
          reasoning = ["Retrieved personal memories"]
        } else if (synthesis.data.newInfo && synthesis.data.newInfo.length > 0) {
          content = `${namePrefix}Thanks for sharing that information! I'll remember it.`
          synthesis.data.newInfo.forEach((info: any) => {
            learningExtracted.push(`personal: ${info.key}`)
          })
          reasoning = ["Stored new personal information"]
        } else {
          content = `${namePrefix}I don't have any personal information stored yet. Tell me about yourself!`
          reasoning = ["No personal information available"]
        }
        break

      case "temporal":
        content = `${namePrefix}${synthesis.data.response}`
        reasoning = ["Provided temporal information"]
        break

      case "knowledge":
        if (synthesis.data.results && synthesis.data.results.length > 0) {
          content = `${namePrefix}Here's what I found:\n\n`
          synthesis.data.results.forEach((result: any, index: number) => {
            content += `${index + 1}. ${result.content || result.data}\n`
          })
          reasoning = ["Retrieved knowledge from database"]
        } else {
          content = `${namePrefix}I don't have specific information about that topic.`
          reasoning = ["No knowledge found"]
        }
        break

      default:
        content = synthesis.data.response || `${namePrefix}I understand. How can I help you?`
        reasoning = ["Generated conversational response"]
    }

    return {
      content,
      confidence: synthesis.confidence,
      reasoning,
      learningExtracted,
    }
  }

  // MEMORY AND LEARNING UPDATE
  private async updateMemoryAndLearning(userMessage: string, response: ResponseGeneration): Promise<void> {
    console.log("🧠 Updating memory and learning...")

    // Store conversation
    this.conversationHistory.push({
      timestamp: Date.now(),
      userMessage,
      aiResponse: response.content,
      confidence: response.confidence,
      learningExtracted: response.learningExtracted,
    })

    // Keep only recent conversations
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }

    // Update neural weights based on confidence
    this.updateNeuralWeights(userMessage, response.confidence)

    // Save to persistent storage
    this.saveToStorage()
  }

  // HELPER METHODS
  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          this.vocabularySystem.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: entry.definition,
            partOfSpeech: entry.part_of_speech || "unknown",
            examples: entry.examples || [],
            source: "seed",
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} vocabulary words`)
      }
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }
  }

  private async loadSeedMathematics(): Promise<void> {
    try {
      const response = await fetch("/seed_maths.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([concept, entry]: [string, any]) => {
          this.knowledgeBase.set(`math_${concept}`, {
            type: "mathematics",
            concept,
            data: entry,
            source: "seed",
          })
        })
        console.log(`✅ Loaded mathematics knowledge`)
      }
    } catch (error) {
      console.warn("Failed to load mathematics:", error)
    }
  }

  private async loadSeedKnowledge(): Promise<void> {
    try {
      const response = await fetch("/seed_knowledge.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([topic, entry]: [string, any]) => {
          this.knowledgeBase.set(topic, {
            type: "knowledge",
            topic,
            data: entry,
            source: "seed",
          })
        })
        console.log(`✅ Loaded general knowledge`)
      }
    } catch (error) {
      console.warn("Failed to load knowledge:", error)
    }
  }

  private async loadSeedSystem(): Promise<void> {
    try {
      const response = await fetch("/seed_system.json")
      if (response.ok) {
        const data = await response.json()
        this.knowledgeBase.set("system", {
          type: "system",
          data,
          source: "seed",
        })
        console.log(`✅ Loaded system configuration`)
      }
    } catch (error) {
      console.warn("Failed to load system config:", error)
    }
  }

  private loadPersonalMemory(): void {
    try {
      const stored = localStorage.getItem("cognitive_processor_memory")
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((entry: any) => {
          this.personalMemory.set(entry.key, entry)
        })
        console.log(`✅ Loaded ${data.length} personal memories`)
      }
    } catch (error) {
      console.warn("Failed to load personal memory:", error)
    }
  }

  private initializeNeuralWeights(): void {
    // Initialize basic neural weights for learning
    const categories = ["mathematical", "vocabulary", "personal", "temporal", "knowledge", "conversational"]
    categories.forEach((category) => {
      this.neuralWeights.set(
        category,
        Array(10)
          .fill(0)
          .map(() => Math.random() * 0.1),
      )
    })
    console.log("✅ Neural weights initialized")
  }

  private calculateMathComplexity(input: string): number {
    const operators = (input.match(/[+\-×*÷/]/g) || []).length
    const numbers = (input.match(/\d+/g) || []).length
    return Math.min(0.9, 0.3 + operators * 0.2 + numbers * 0.1)
  }

  private analyzeSentiment(input: string): string {
    const positive = /\b(good|great|awesome|love|like|happy|excellent)\b/i.test(input)
    const negative = /\b(bad|hate|terrible|awful|sad|angry|frustrated)\b/i.test(input)

    if (positive && !negative) return "positive"
    if (negative && !positive) return "negative"
    return "neutral"
  }

  private extractKeywords(input: string): string[] {
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter(
        (word) =>
          !/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|man|new|now|old|see|two|way|who)$/.test(
            word,
          ),
      )
      .slice(0, 5)
  }

  private generateMathSteps(analysis: any): string[] {
    if (analysis.operation === "multiply" && analysis.numbers.length === 2) {
      return [`${analysis.numbers[0]} × ${analysis.numbers[1]} = ${analysis.result}`]
    }
    if (analysis.operation === "add" && analysis.numbers.length === 2) {
      return [`${analysis.numbers[0]} + ${analysis.numbers[1]} = ${analysis.result}`]
    }
    return [`Result: ${analysis.result}`]
  }

  private async learnNewWord(word: string): Promise<any> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]

          const wordData = {
            definition: definition?.definition || "Definition found",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            examples: definition?.example ? [definition.example] : [],
          }

          // Store the learned word
          this.vocabularySystem.set(word, {
            word,
            ...wordData,
            source: "learned",
            timestamp: Date.now(),
          })

          return wordData
        }
      }
    } catch (error) {
      console.warn("Failed to learn new word:", error)
    }
    return null
  }

  private extractPersonalInformation(input: string): any[] {
    const info: any[] = []

    const patterns = [
      { pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i, key: "name" },
      { pattern: /i am (\d+) years old/i, key: "age" },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job" },
      { pattern: /i like (.+)/i, key: "likes" },
      { pattern: /i live in (.+)/i, key: "location" },
      { pattern: /i have (\d+) (.+)/i, key: "possessions" },
    ]

    patterns.forEach(({ pattern, key }) => {
      const match = input.match(pattern)
      if (match && match[1]) {
        info.push({
          key: key === "possessions" ? match[2] : key,
          value: match[1].trim(),
          importance: key === "name" ? 0.9 : 0.7,
        })
      }
    })

    return info
  }

  private searchKnowledgeBase(query: string): any[] {
    const results: any[] = []
    const queryLower = query.toLowerCase()

    for (const [key, entry] of this.knowledgeBase.entries()) {
      if (key.toLowerCase().includes(queryLower) || JSON.stringify(entry.data).toLowerCase().includes(queryLower)) {
        results.push({
          key,
          content: entry.data,
          type: entry.type,
          relevance: this.calculateRelevance(query, key),
        })
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance)
  }

  private calculateRelevance(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(" ")
    const textWords = text.toLowerCase().split(" ")
    let matches = 0

    queryWords.forEach((queryWord) => {
      textWords.forEach((textWord) => {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matches++
        }
      })
    })

    return matches / queryWords.length
  }

  private createSynthesis(results: PathwayResult[], originalInput: string): any {
    return {
      totalPathways: results.length,
      highestConfidence: Math.max(...results.map((r) => r.confidence)),
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      pathwayBreakdown: results.map((r) => ({ pathway: r.pathway, confidence: r.confidence })),
    }
  }

  private updateNeuralWeights(input: string, confidence: number): void {
    // Simple weight update based on confidence
    const inputType = this.classifyInputType(input)
    const weights = this.neuralWeights.get(inputType)

    if (weights) {
      for (let i = 0; i < weights.length; i++) {
        weights[i] += this.learningRate * (confidence - 0.5)
      }
      this.neuralWeights.set(inputType, weights)
    }
  }

  private classifyInputType(input: string): string {
    if (/\d+\s*[+\-×*÷/]\s*\d+/.test(input)) return "mathematical"
    if (/what\s+(?:is|does|means?)\s+\w+/i.test(input)) return "vocabulary"
    if (/\b(my|i|me|am|have)\b/i.test(input)) return "personal"
    if (/what.*time|when|today/i.test(input)) return "temporal"
    if (/\?/.test(input)) return "knowledge"
    return "conversational"
  }

  private saveToStorage(): void {
    try {
      const personalData = Array.from(this.personalMemory.values())
      localStorage.setItem("cognitive_processor_memory", JSON.stringify(personalData))

      const conversationData = this.conversationHistory.slice(-20) // Keep last 20
      localStorage.setItem("cognitive_processor_history", JSON.stringify(conversationData))

      console.log("💾 Saved to persistent storage")
    } catch (error) {
      console.warn("Failed to save to storage:", error)
    }
  }

  private updateStats(): void {
    this.systemStats.vocabularySize = this.vocabularySystem.size
    this.systemStats.mathFunctions = Array.from(this.knowledgeBase.keys()).filter((k) => k.startsWith("math_")).length
    this.systemStats.memoryEntries = this.personalMemory.size

    if (this.conversationHistory.length > 0) {
      this.systemStats.avgConfidence =
        this.conversationHistory.slice(-10).reduce((sum, conv) => sum + conv.confidence, 0) /
        Math.min(10, this.conversationHistory.length)
    }

    this.systemStats.learningProgress = Math.min(100, (this.systemStats.totalMessages / 100) * 100)
  }

  // PUBLIC API METHODS
  public getStats(): any {
    return {
      ...this.systemStats,
      breakdown: {
        seedVocab: Array.from(this.vocabularySystem.values()).filter((v) => v.source === "seed").length,
        learnedVocab: Array.from(this.vocabularySystem.values()).filter((v) => v.source === "learned").length,
      },
    }
  }

  public getConversationHistory(): any[] {
    return this.conversationHistory.slice(-20)
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabularySystem.entries()),
      personalMemory: Array.from(this.personalMemory.entries()),
      knowledgeBase: Array.from(this.knowledgeBase.entries()),
      conversationHistory: this.conversationHistory,
      neuralWeights: Array.from(this.neuralWeights.entries()),
      stats: this.systemStats,
      exportTimestamp: Date.now(),
    }
  }

  public async importData(data: any): Promise<void> {
    try {
      if (data.vocabulary) {
        this.vocabularySystem = new Map(data.vocabulary)
      }
      if (data.personalMemory) {
        this.personalMemory = new Map(data.personalMemory)
      }
      if (data.knowledgeBase) {
        this.knowledgeBase = new Map(data.knowledgeBase)
      }
      if (data.conversationHistory) {
        this.conversationHistory = data.conversationHistory
      }
      if (data.neuralWeights) {
        this.neuralWeights = new Map(data.neuralWeights)
      }

      this.updateStats()
      this.saveToStorage()
      console.log("✅ Data imported successfully")
    } catch (error) {
      console.error("❌ Failed to import data:", error)
      throw error
    }
  }
}

// TYPE DEFINITIONS
interface InputAnalysis {
  type: string
  confidence: number
  complexity: number
  features: {
    hasNumbers: boolean
    hasMathOperators: boolean
    hasQuestions: boolean
    hasPersonalInfo: boolean
    hasTimeReference: boolean
    hasVocabularyRequest: boolean
    wordCount: number
    sentiment: string
  }
  keywords: string[]
}

interface PathwayResult {
  pathway: string
  confidence: number
  data: any
}

interface CognitiveResults {
  pathways: string[]
  results: PathwayResult[]
  primaryResult: PathwayResult
}

interface KnowledgeSynthesis {
  primaryPathway: string
  confidence: number
  data: any
  userName?: string
  allResults: PathwayResult[]
  synthesis: any
}

interface ResponseGeneration {
  content: string
  confidence: number
  reasoning: string[]
  learningExtracted: string[]
}

interface CognitiveResponse {
  content: string
  confidence: number
  reasoning: string[]
  pathways: string[]
  learningExtracted: string[]
}
