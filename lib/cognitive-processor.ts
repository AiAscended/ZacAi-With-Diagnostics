"use client"

import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"

interface CognitivePathway {
  name: string
  weight: number
  activation: number
  connections: Map<string, number>
}

interface NeuralWeight {
  input: string
  output: string
  weight: number
  lastUpdate: number
}

interface KnowledgeNode {
  concept: string
  embeddings: number[]
  connections: Map<string, number>
  confidence: number
  lastAccessed: number
}

interface MemoryTrace {
  content: string
  timestamp: number
  importance: number
  associations: string[]
  decay: number
}

// UNIFIED COGNITIVE PROCESSOR - THE MAIN BRAIN
export class CognitiveProcessor {
  private pathways: Map<string, CognitivePathway> = new Map()
  private neuralWeights: Map<string, NeuralWeight> = new Map()
  private knowledgeGraph: Map<string, KnowledgeNode> = new Map()
  private workingMemory: MemoryTrace[] = []
  private longTermMemory: Map<string, MemoryTrace> = new Map()
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private learningRate = 0.1
  private attentionMechanism: Map<string, number> = new Map()
  private contextWindow: string[] = []
  private isInitialized = false
  private processingStats = {
    totalProcessed: 0,
    avgConfidence: 0,
    learningProgress: 0,
    responseTime: 0,
    pathwayActivations: new Map<string, number>(),
  }
  private knowledgeBase: Map<string, any> = new Map()
  private personalMemory: Map<string, any> = new Map()
  private vocabularySystem: Map<string, any> = new Map()
  private mathematicsEngine: EnhancedMathProcessor
  private temporalSystem: TemporalKnowledgeSystem
  private neuralWeightsOld: Map<string, number[]> = new Map()
  private conversationHistoryOld: any[] = []
  private learningRateOld = 0.01
  private confidenceThreshold = 0.7
  private isInitializedOld = false
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
    console.log("🧠 Advanced Cognitive Processor initializing...")
    this.initializePathways()
    console.log("🧠 Initializing Advanced Cognitive Processor...")
    this.mathematicsEngine = new EnhancedMathProcessor()
    this.temporalSystem = new TemporalKnowledgeSystem()
  }

  private initializePathways(): void {
    const pathwayConfigs = [
      { name: "mathematical", weight: 0.8, activation: 0 },
      { name: "linguistic", weight: 0.9, activation: 0 },
      { name: "personal", weight: 0.7, activation: 0 },
      { name: "factual", weight: 0.8, activation: 0 },
      { name: "conversational", weight: 0.6, activation: 0 },
      { name: "temporal", weight: 0.5, activation: 0 },
      { name: "creative", weight: 0.4, activation: 0 },
      { name: "analytical", weight: 0.9, activation: 0 },
    ]

    pathwayConfigs.forEach((config) => {
      this.pathways.set(config.name, {
        ...config,
        connections: new Map(),
      })
    })
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 Initializing Advanced Cognitive Processor...")

    try {
      // Load seed data
      await Promise.all([
        this.loadSeedVocabulary(),
        this.loadSeedMathematics(),
        this.loadPersonalMemory(),
        this.initializeNeuralWeights(),
        this.buildKnowledgeGraph(),
      ])

      this.isInitialized = true
      console.log("✅ Advanced Cognitive Processor ready!")
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      throw error
    }
    if (this.isInitializedOld) return

    try {
      console.log("🚀 Loading cognitive systems...")

      // Load all seed data
      await Promise.all([
        this.loadSeedVocabularyOld(),
        this.loadSeedMathematicsOld(),
        this.loadSeedKnowledge(),
        this.loadSeedSystem(),
        this.loadPersonalMemoryOld(),
      ])

      // Initialize neural weights
      this.initializeNeuralWeightsOld()

      // Initialize subsystems
      await this.temporalSystem.initialize?.()

      this.isInitializedOld = true
      this.updateStatsOld()
      console.log("✅ Cognitive Processor fully initialized!")
    } catch (error) {
      console.error("❌ Cognitive Processor initialization failed:", error)
      throw error
    }
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          const embeddings = this.generateEmbeddings(word + " " + entry.definition)
          this.vocabulary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: entry.definition,
            partOfSpeech: entry.part_of_speech || "unknown",
            examples: entry.examples || [],
            embeddings,
            confidence: 0.9,
            source: "seed",
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} vocabulary entries with embeddings`)
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
          this.mathematics.set(concept, {
            concept,
            data: entry,
            embeddings: this.generateEmbeddings(concept + " " + JSON.stringify(entry)),
            confidence: 0.95,
            source: "seed",
          })
        })
        console.log("✅ Loaded mathematical knowledge with embeddings")
      }
    } catch (error) {
      console.warn("Failed to load mathematics:", error)
    }
  }

  private loadPersonalMemory(): void {
    try {
      const stored = localStorage.getItem("cognitive_personal_memory")
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((entry: any) => {
          this.personalInfo.set(entry.key, {
            ...entry,
            embeddings: this.generateEmbeddings(entry.key + " " + entry.value),
          })
        })
        console.log(`✅ Loaded ${data.length} personal memory entries`)
      }
    } catch (error) {
      console.warn("Failed to load personal memory:", error)
    }
  }

  private initializeNeuralWeights(): void {
    // Initialize connection weights between pathways
    const pathwayNames = Array.from(this.pathways.keys())

    pathwayNames.forEach((from) => {
      pathwayNames.forEach((to) => {
        if (from !== to) {
          const key = `${from}->${to}`
          this.neuralWeights.set(key, {
            input: from,
            output: to,
            weight: Math.random() * 0.5 + 0.25, // Random weight between 0.25-0.75
            lastUpdate: Date.now(),
          })
        }
      })
    })

    console.log(`✅ Initialized ${this.neuralWeights.size} neural connections`)
  }

  private buildKnowledgeGraph(): void {
    // Build connections between vocabulary, math, and personal info
    const allConcepts = [
      ...Array.from(this.vocabulary.keys()),
      ...Array.from(this.mathematics.keys()),
      ...Array.from(this.personalInfo.keys()),
    ]

    allConcepts.forEach((concept) => {
      const embeddings = this.generateEmbeddings(concept)
      const connections = new Map<string, number>()

      // Find related concepts using embedding similarity
      allConcepts.forEach((otherConcept) => {
        if (concept !== otherConcept) {
          const otherEmbeddings = this.generateEmbeddings(otherConcept)
          const similarity = this.cosineSimilarity(embeddings, otherEmbeddings)
          if (similarity > 0.3) {
            connections.set(otherConcept, similarity)
          }
        }
      })

      this.knowledgeGraph.set(concept, {
        concept,
        embeddings,
        connections,
        confidence: 0.8,
        lastAccessed: Date.now(),
      })
    })

    console.log(`✅ Built knowledge graph with ${this.knowledgeGraph.size} nodes`)
  }

  private generateEmbeddings(text: string): number[] {
    // Simple embedding generation (in real implementation, use proper embeddings)
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(128).fill(0)

    words.forEach((word, index) => {
      for (let i = 0; i < word.length && i < embedding.length; i++) {
        embedding[i] += (word.charCodeAt(i % word.length) * (index + 1)) / words.length
      }
    })

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0))
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // MAIN COGNITIVE PROCESSING PIPELINE
  public async processMessage(userMessage: string): Promise<CognitiveResponse> {
    const startTime = Date.now()

    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 Processing with advanced cognition:", userMessage)

    // Update context window
    this.contextWindow.push(userMessage)
    if (this.contextWindow.length > 10) {
      this.contextWindow.shift()
    }

    // Generate input embeddings
    const inputEmbeddings = this.generateEmbeddings(userMessage)

    // Activate pathways based on input
    const pathwayActivations = this.activatePathways(userMessage, inputEmbeddings)

    // Process through multiple pathways simultaneously
    const pathwayResults = await Promise.all([
      this.processMathematical(userMessage, pathwayActivations.get("mathematical") || 0),
      this.processLinguistic(userMessage, pathwayActivations.get("linguistic") || 0),
      this.processPersonal(userMessage, pathwayActivations.get("personal") || 0),
      this.processFactual(userMessage, pathwayActivations.get("factual") || 0),
      this.processConversational(userMessage, pathwayActivations.get("conversational") || 0),
      this.processTemporal(userMessage, pathwayActivations.get("temporal") || 0),
    ])

    // Synthesize results using attention mechanism
    const synthesizedResponse = this.synthesizeResponse(pathwayResults, pathwayActivations)

    // Update neural weights based on processing
    this.updateNeuralWeights(pathwayActivations, synthesizedResponse.confidence)

    // Store in memory
    this.storeInMemory(userMessage, synthesizedResponse)

    // Update stats
    const responseTime = Date.now() - startTime
    this.updateStats(pathwayActivations, synthesizedResponse.confidence, responseTime)

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
      this.updateStatsOld()

      console.log(`✅ Response generated in ${Date.now() - startTime}ms`)

      return {
        content: synthesizedResponse.content,
        confidence: synthesizedResponse.confidence,
        reasoning: synthesizedResponse.reasoning,
        pathways: synthesizedResponse.pathways,
        learningExtracted: [],
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

  private activatePathways(input: string, embeddings: number[]): Map<string, number> {
    const activations = new Map<string, number>()

    // Mathematical pathway
    if (/\d+\s*[+\-*/×÷]\s*\d+|math|calculate|equation|formula/.test(input)) {
      activations.set("mathematical", 0.9)
    }

    // Linguistic pathway
    if (/what\s+(is|does|means?)|define|definition|word|language/.test(input)) {
      activations.set("linguistic", 0.8)
    }

    // Personal pathway
    if (/my\s+name|i\s+am|remember|about\s+me|personal/.test(input)) {
      activations.set("personal", 0.7)
    }

    // Factual pathway
    if (/who|what|when|where|why|how|fact|information/.test(input)) {
      activations.set("factual", 0.6)
    }

    // Conversational pathway (always active)
    activations.set("conversational", 0.5)

    // Temporal pathway
    if (/time|date|when|ago|future|past|now|today/.test(input)) {
      activations.set("temporal", 0.4)
    }

    // Use embeddings to find related concepts
    this.knowledgeGraph.forEach((node, concept) => {
      const similarity = this.cosineSimilarity(embeddings, node.embeddings)
      if (similarity > 0.5) {
        // Boost relevant pathways based on knowledge graph
        activations.forEach((activation, pathway) => {
          activations.set(pathway, Math.min(1.0, activation + similarity * 0.2))
        })
      }
    })

    return activations
  }

  private async processMathematical(input: string, activation: number): Promise<any> {
    if (activation < 0.1) return null

    // Enhanced mathematical processing
    const mathPatterns = [
      /(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)/g,
      /what\s+is\s+(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)/gi,
      /calculate\s+(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)/gi,
    ]

    for (const pattern of mathPatterns) {
      const match = pattern.exec(input)
      if (match) {
        const [, num1Str, operator, num2Str] = match
        const num1 = Number.parseFloat(num1Str)
        const num2 = Number.parseFloat(num2Str)

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
            result = num2 !== 0 ? num1 / num2 : Number.NaN
            operation = "division"
            break
          default:
            continue
        }

        if (!isNaN(result)) {
          return {
            pathway: "mathematical",
            content: `🧮 **Mathematical Processing**\n\n**Expression:** ${num1} ${operator} ${num2}\n**Result:** ${result}\n**Operation:** ${operation}\n\n*Processed through advanced mathematical pathway*`,
            confidence: activation * 0.95,
            reasoning: [
              `Detected mathematical expression: ${num1} ${operator} ${num2}`,
              `Applied ${operation} operation`,
              `Calculated result: ${result}`,
              `Mathematical pathway activation: ${Math.round(activation * 100)}%`,
            ],
          }
        }
      }
    }

    return {
      pathway: "mathematical",
      content: "I can help with mathematical calculations. Try expressions like '15 × 7' or 'what is 25 + 13?'",
      confidence: activation * 0.3,
      reasoning: ["Mathematical pathway activated but no valid expression found"],
    }
  }

  private async processLinguistic(input: string, activation: number): Promise<any> {
    if (activation < 0.1) return null

    const wordMatch = input.match(/(?:what\s+(?:is|does|means?)|define)\s+(\w+)/i)
    if (!wordMatch) return null

    const word = wordMatch[1].toLowerCase()

    // Check existing vocabulary
    if (this.vocabulary.has(word)) {
      const entry = this.vocabulary.get(word)
      return {
        pathway: "linguistic",
        content: `📖 **Linguistic Processing**\n\n**Word:** ${word}\n**Definition:** ${entry.definition}\n**Part of Speech:** ${entry.partOfSpeech}\n\n*Retrieved from vocabulary database*`,
        confidence: activation * entry.confidence,
        reasoning: [
          `Found word "${word}" in vocabulary database`,
          `Retrieved definition and linguistic information`,
          `Linguistic pathway activation: ${Math.round(activation * 100)}%`,
        ],
      }
    }

    // Try to learn new word
    try {
      const wordData = await this.learnNewWord(word)
      if (wordData) {
        return {
          pathway: "linguistic",
          content: `📖 **Linguistic Learning**\n\n**Word:** ${word} *(newly learned)*\n**Definition:** ${wordData.definition}\n**Part of Speech:** ${wordData.partOfSpeech}\n\n*Learned and stored in vocabulary*`,
          confidence: activation * 0.8,
          reasoning: [
            `Word "${word}" not found in existing vocabulary`,
            `Successfully learned new word from external source`,
            `Added to vocabulary database with embeddings`,
            `Linguistic pathway activation: ${Math.round(activation * 100)}%`,
          ],
        }
      }
    } catch (error) {
      console.warn("Failed to learn new word:", error)
    }

    return {
      pathway: "linguistic",
      content: `I don't know the word "${word}" yet, but I'm always learning new vocabulary.`,
      confidence: activation * 0.4,
      reasoning: [`Word "${word}" not found and could not be learned`],
    }
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

          // Store in vocabulary with embeddings
          const embeddings = this.generateEmbeddings(word + " " + wordData.definition)
          this.vocabulary.set(word, {
            word,
            ...wordData,
            embeddings,
            confidence: 0.8,
            source: "learned",
            timestamp: Date.now(),
          })

          // Update knowledge graph
          this.updateKnowledgeGraph(word, embeddings)

          return wordData
        }
      }
    } catch (error) {
      console.warn("Dictionary API failed:", error)
    }
    return null
  }

  private processPersonal(input: string, activation: number): any {
    if (activation < 0.1) return null

    // Extract personal information
    this.extractPersonalInfo(input)

    // Handle personal queries
    if (/what'?s\s+my\s+name|my\s+name|remember.*name/i.test(input)) {
      const name = this.personalInfo.get("name")
      if (name) {
        return {
          pathway: "personal",
          content: `💾 **Personal Memory**\n\nYour name is **${name.value}**.\n\n*Retrieved from personal memory system*`,
          confidence: activation * 0.95,
          reasoning: [
            "Retrieved name from personal memory",
            `Personal pathway activation: ${Math.round(activation * 100)}%`,
          ],
        }
      } else {
        return {
          pathway: "personal",
          content: "I don't have your name stored yet. What would you like me to call you?",
          confidence: activation * 0.7,
          reasoning: ["No name found in personal memory"],
        }
      }
    }

    if (/what.*remember|know.*about.*me|personal.*info/i.test(input)) {
      if (this.personalInfo.size > 0) {
        let content = "💾 **Personal Memory System**\n\nHere's what I remember about you:\n\n"
        this.personalInfo.forEach((entry, key) => {
          content += `• **${key}**: ${entry.value}\n`
        })
        content += "\n*Retrieved from personal memory database*"

        return {
          pathway: "personal",
          content,
          confidence: activation * 0.9,
          reasoning: [
            `Retrieved ${this.personalInfo.size} personal memory entries`,
            `Personal pathway activation: ${Math.round(activation * 100)}%`,
          ],
        }
      } else {
        return {
          pathway: "personal",
          content: "I don't have any personal information stored about you yet. Tell me about yourself!",
          confidence: activation * 0.6,
          reasoning: ["No personal information found in memory"],
        }
      }
    }

    return null
  }

  private extractPersonalInfo(input: string): void {
    const patterns = [
      { pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i, key: "name" },
      { pattern: /i live in\s+([^.!?]+)/i, key: "location" },
      { pattern: /i work (?:as|at)\s+([^.!?]+)/i, key: "work" },
      { pattern: /i am\s+(\d+)\s+years?\s+old/i, key: "age" },
    ]

    patterns.forEach(({ pattern, key }) => {
      const match = input.match(pattern)
      if (match) {
        const value = match[1].trim()
        this.personalInfo.set(key, {
          key,
          value,
          timestamp: Date.now(),
          embeddings: this.generateEmbeddings(key + " " + value),
        })
        this.savePersonalMemory()
        console.log(`📝 Stored personal info: ${key} = ${value}`)
      }
    })
  }

  private processFactual(input: string, activation: number): any {
    if (activation < 0.1) return null

    // Use knowledge graph to find relevant information
    const inputEmbeddings = this.generateEmbeddings(input)
    let bestMatch: { concept: string; similarity: number; node: KnowledgeNode } | null = null

    this.knowledgeGraph.forEach((node, concept) => {
      const similarity = this.cosineSimilarity(inputEmbeddings, node.embeddings)
      if (similarity > 0.4 && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { concept, similarity, node }
      }
    })

    if (bestMatch) {
      // Update last accessed
      bestMatch.node.lastAccessed = Date.now()

      return {
        pathway: "factual",
        content: `🔍 **Knowledge Synthesis**\n\nBased on my knowledge graph, I found relevant information about "${bestMatch.concept}".\n\n*Similarity: ${Math.round(bestMatch.similarity * 100)}%*\n*Factual pathway processing*`,
        confidence: activation * bestMatch.similarity,
        reasoning: [
          `Found relevant concept: ${bestMatch.concept}`,
          `Knowledge similarity: ${Math.round(bestMatch.similarity * 100)}%`,
          `Factual pathway activation: ${Math.round(activation * 100)}%`,
        ],
      }
    }

    return null
  }

  private processConversational(input: string, activation: number): any {
    // Always provide a conversational response as fallback
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    const isGreeting = greetings.some((greeting) => input.toLowerCase().includes(greeting))

    if (isGreeting) {
      const userName = this.personalInfo.get("name")?.value
      const greeting = userName ? `Hello ${userName}!` : "Hello!"

      return {
        pathway: "conversational",
        content: `👋 **Conversational Processing**\n\n${greeting} I'm your advanced cognitive processor, ready to help with:\n\n• 🧮 Mathematical calculations\n• 📖 Vocabulary and definitions\n• 💾 Personal memory management\n• 🔍 Knowledge synthesis\n• ⏰ Temporal awareness\n\nWhat would you like to explore?`,
        confidence: activation * 0.8,
        reasoning: [
          "Detected greeting pattern",
          userName ? "Personalized response using stored name" : "Generic friendly greeting",
          `Conversational pathway activation: ${Math.round(activation * 100)}%`,
        ],
      }
    }

    return {
      pathway: "conversational",
      content: `🧠 **Cognitive Processing**\n\nI understand you said: "${input}"\n\nI'm processing this through multiple cognitive pathways. I can help with mathematics, vocabulary, personal memory, and knowledge synthesis.\n\n*Advanced cognitive processing active*`,
      confidence: activation * 0.6,
      reasoning: [
        "General conversational processing",
        "Multiple pathways available for assistance",
        `Conversational pathway activation: ${Math.round(activation * 100)}%`,
      ],
    }
  }

  private processTemporal(input: string, activation: number): any {
    if (activation < 0.1) return null

    if (/what.*time|current.*time|time.*now/i.test(input)) {
      const now = new Date()
      return {
        pathway: "temporal",
        content: `⏰ **Temporal Processing**\n\n**Current Time:** ${now.toLocaleTimeString()}\n**Date:** ${now.toLocaleDateString()}\n**Timestamp:** ${now.getTime()}\n\n*Temporal awareness system active*`,
        confidence: activation * 0.95,
        reasoning: [
          "Temporal query detected",
          "Retrieved current system time",
          `Temporal pathway activation: ${Math.round(activation * 100)}%`,
        ],
      }
    }

    return null
  }

  private synthesizeResponse(results: any[], activations: Map<string, number>): any {
    // Filter out null results
    const validResults = results.filter((r) => r !== null)

    if (validResults.length === 0) {
      return {
        content:
          "🧠 I'm processing your request through multiple cognitive pathways, but I need more specific information to provide a helpful response.",
        confidence: 0.4,
        reasoning: ["No pathways produced valid results"],
      }
    }

    // If only one result, return it
    if (validResults.length === 1) {
      return validResults[0]
    }

    // Multiple results - use attention mechanism to synthesize
    let bestResult = validResults[0]
    let maxScore = bestResult.confidence * (activations.get(bestResult.pathway) || 0)

    validResults.forEach((result) => {
      const score = result.confidence * (activations.get(result.pathway) || 0)
      if (score > maxScore) {
        maxScore = score
        bestResult = result
      }
    })

    // Add synthesis information
    const pathwaysUsed = validResults.map((r) => r.pathway).join(", ")
    bestResult.reasoning.push(`Synthesized from pathways: ${pathwaysUsed}`)
    bestResult.reasoning.push(`Selected best result from ${validResults.length} pathway responses`)

    return bestResult
  }

  private updateNeuralWeights(activations: Map<string, number>, confidence: number): void {
    // Update weights based on successful processing
    activations.forEach((activation, pathway) => {
      if (activation > 0.5) {
        // Strengthen connections for successful pathways
        this.pathways.get(pathway)!.weight = Math.min(
          1.0,
          this.pathways.get(pathway)!.weight + this.learningRate * confidence * activation,
        )
      }
    })

    // Update inter-pathway connections
    const activePathways = Array.from(activations.keys()).filter((p) => activations.get(p)! > 0.3)
    activePathways.forEach((from) => {
      activePathways.forEach((to) => {
        if (from !== to) {
          const key = `${from}->${to}`
          const weight = this.neuralWeights.get(key)
          if (weight) {
            weight.weight = Math.min(1.0, weight.weight + this.learningRate * 0.1)
            weight.lastUpdate = Date.now()
          }
        }
      })
    })
  }

  private storeInMemory(input: string, response: any): void {
    const memoryTrace: MemoryTrace = {
      content: `${input} -> ${response.content}`,
      timestamp: Date.now(),
      importance: response.confidence,
      associations: response.pathways || [],
      decay: 1.0,
    }

    this.workingMemory.push(memoryTrace)

    // Keep working memory limited
    if (this.workingMemory.length > 50) {
      // Move important memories to long-term storage
      const important = this.workingMemory.filter((m) => m.importance > 0.7)
      important.forEach((memory) => {
        this.longTermMemory.set(memory.timestamp.toString(), memory)
      })

      this.workingMemory = this.workingMemory.slice(-25)
    }

    this.conversationHistory.push({
      input,
      response: response.content,
      confidence: response.confidence,
      pathways: response.pathways,
      timestamp: Date.now(),
    })
  }

  private updateKnowledgeGraph(concept: string, embeddings: number[]): void {
    const connections = new Map<string, number>()

    // Find connections to existing concepts
    this.knowledgeGraph.forEach((node, existingConcept) => {
      if (concept !== existingConcept) {
        const similarity = this.cosineSimilarity(embeddings, node.embeddings)
        if (similarity > 0.3) {
          connections.set(existingConcept, similarity)
          // Add reverse connection
          node.connections.set(concept, similarity)
        }
      }
    })

    this.knowledgeGraph.set(concept, {
      concept,
      embeddings,
      connections,
      confidence: 0.8,
      lastAccessed: Date.now(),
    })
  }

  private updateStats(activations: Map<string, number>, confidence: number, responseTime: number): void {
    this.processingStats.totalProcessed++
    this.processingStats.avgConfidence =
      (this.processingStats.avgConfidence * (this.processingStats.totalProcessed - 1) + confidence) /
      this.processingStats.totalProcessed
    this.processingStats.responseTime = responseTime
    this.processingStats.learningProgress = Math.min(
      100,
      ((this.vocabulary.size - 432) / 1000) * 100 + // Vocabulary growth
        this.personalInfo.size * 10 + // Personal info
        (this.processingStats.totalProcessed / 100) * 10, // Experience
    )

    activations.forEach((activation, pathway) => {
      const current = this.processingStats.pathwayActivations.get(pathway) || 0
      this.processingStats.pathwayActivations.set(pathway, current + activation)
    })
  }

  private savePersonalMemory(): void {
    try {
      const personalData = Array.from(this.personalInfo.values())
      localStorage.setItem("cognitive_personal_memory", JSON.stringify(personalData))
    } catch (error) {
      console.warn("Failed to save personal memory:", error)
    }
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.processingStats.totalProcessed,
      avgConfidence: this.processingStats.avgConfidence,
      responseTime: this.processingStats.responseTime,
      learningProgress: this.processingStats.learningProgress,
      knowledgeGraphSize: this.knowledgeGraph.size,
      neuralConnections: this.neuralWeights.size,
      workingMemorySize: this.workingMemory.length,
      longTermMemorySize: this.longTermMemory.size,
      breakdown: {
        seedVocab,
        learnedVocab,
      },
      pathwayActivations: Object.fromEntries(this.processingStats.pathwayActivations),
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      knowledgeGraph: Array.from(this.knowledgeGraph.entries()),
      neuralWeights: Array.from(this.neuralWeights.entries()),
      conversationHistory: this.conversationHistory,
      stats: this.processingStats,
      exportTimestamp: Date.now(),
      version: "Advanced Cognitive Processor v2.0",
    }
  }

  public getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      pathways: Object.fromEntries(this.pathways),
      contextWindow: this.contextWindow,
      learningRate: this.learningRate,
      stats: this.processingStats,
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
      const newWordData = await this.learnNewWordOld(word)
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
    const extractedInfo = this.extractPersonalInformationOld(input)

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
    this.conversationHistoryOld.push({
      timestamp: Date.now(),
      userMessage,
      aiResponse: response.content,
      confidence: response.confidence,
      learningExtracted: response.learningExtracted,
    })

    // Keep only recent conversations
    if (this.conversationHistoryOld.length > 100) {
      this.conversationHistoryOld = this.conversationHistoryOld.slice(-80)
    }

    // Update neural weights based on confidence
    this.updateNeuralWeightsOld(userMessage, response.confidence)

    // Save to persistent storage
    this.saveToStorageOld()
  }

  // HELPER METHODS
  private async loadSeedVocabularyOld(): Promise<void> {
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

  private async loadSeedMathematicsOld(): Promise<void> {
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

  private loadPersonalMemoryOld(): void {
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

  private initializeNeuralWeightsOld(): void {
    // Initialize basic neural weights for learning
    const categories = ["mathematical", "vocabulary", "personal", "temporal", "knowledge", "conversational"]
    categories.forEach((category) => {
      this.neuralWeightsOld.set(
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

  private async learnNewWordOld(word: string): Promise<any> {
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

  private extractPersonalInformationOld(input: string): any[] {
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
          relevance: this.calculateRelevanceOld(query, key),
        })
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance)
  }

  private calculateRelevanceOld(query: string, text: string): number {
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

  private updateNeuralWeightsOld(input: string, confidence: number): void {
    // Simple weight update based on confidence
    const inputType = this.classifyInputType(input)
    const weights = this.neuralWeightsOld.get(inputType)

    if (weights) {
      for (let i = 0; i < weights.length; i++) {
        weights[i] += this.learningRateOld * (confidence - 0.5)
      }
      this.neuralWeightsOld.set(inputType, weights)
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

  private saveToStorageOld(): void {
    try {
      const personalData = Array.from(this.personalMemory.values())
      localStorage.setItem("cognitive_processor_memory", JSON.stringify(personalData))

      const conversationData = this.conversationHistoryOld.slice(-20) // Keep last 20
      localStorage.setItem("cognitive_processor_history", JSON.stringify(conversationData))

      console.log("💾 Saved to persistent storage")
    } catch (error) {
      console.warn("Failed to save to storage:", error)
    }
  }

  private updateStatsOld(): void {
    this.systemStats.vocabularySize = this.vocabularySystem.size
    this.systemStats.mathFunctions = Array.from(this.knowledgeBase.keys()).filter((k) => k.startsWith("math_")).length
    this.systemStats.memoryEntries = this.personalMemory.size

    if (this.conversationHistoryOld.length > 0) {
      this.systemStats.avgConfidence =
        this.conversationHistoryOld.slice(-10).reduce((sum, conv) => sum + conv.confidence, 0) /
        Math.min(10, this.conversationHistoryOld.length)
    }

    this.systemStats.learningProgress = Math.min(100, (this.systemStats.totalMessages / 100) * 100)
  }

  // PUBLIC API METHODS
  public getStatsOld(): any {
    return {
      ...this.systemStats,
      breakdown: {
        seedVocab: Array.from(this.vocabularySystem.values()).filter((v) => v.source === "seed").length,
        learnedVocab: Array.from(this.vocabularySystem.values()).filter((v) => v.source === "learned").length,
      },
    }
  }

  public getConversationHistoryOld(): any[] {
    return this.conversationHistoryOld.slice(-20)
  }

  public exportDataOld(): any {
    return {
      vocabulary: Array.from(this.vocabularySystem.entries()),
      personalMemory: Array.from(this.personalMemory.entries()),
      knowledgeBase: Array.from(this.knowledgeBase.entries()),
      conversationHistory: this.conversationHistoryOld,
      neuralWeights: Array.from(this.neuralWeightsOld.entries()),
      stats: this.systemStats,
      exportTimestamp: Date.now(),
    }
  }

  public async importDataOld(data: any): Promise<void> {
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
        this.conversationHistoryOld = data.conversationHistory
      }
      if (data.neuralWeights) {
        this.neuralWeightsOld = new Map(data.neuralWeights)
      }

      this.updateStatsOld()
      this.saveToStorageOld()
      console.log("✅ Data imported successfully")
    } catch (error) {
      console.error("❌ Failed to import data:", error)
      throw error
    }
  }

  private savePersonalMemory(): void {
    try {
      const personalData = Array.from(this.personalInfo.values())
      localStorage.setItem("cognitive_personal_memory", JSON.stringify(personalData))
    } catch (error) {
      console.warn("Failed to save personal memory:", error)
    }
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.processingStats.totalProcessed,
      avgConfidence: this.processingStats.avgConfidence,
      responseTime: this.processingStats.responseTime,
      learningProgress: this.processingStats.learningProgress,
      knowledgeGraphSize: this.knowledgeGraph.size,
      neuralConnections: this.neuralWeights.size,
      workingMemorySize: this.workingMemory.length,
      longTermMemorySize: this.longTermMemory.size,
      breakdown: {
        seedVocab,
        learnedVocab,
      },
      pathwayActivations: Object.fromEntries(this.processingStats.pathwayActivations),
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      knowledgeGraph: Array.from(this.knowledgeGraph.entries()),
      neuralWeights: Array.from(this.neuralWeights.entries()),
      conversationHistory: this.conversationHistory,
      stats: this.processingStats,
      exportTimestamp: Date.now(),
      version: "Advanced Cognitive Processor v2.0",
    }
  }

  public getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      pathways: Object.fromEntries(this.pathways),
      contextWindow: this.contextWindow,
      learningRate: this.learningRate,
      stats: this.processingStats,
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
