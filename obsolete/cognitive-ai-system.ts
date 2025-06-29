"use client"

import { BrowserStorageManager } from "../browser-storage-manager"
import { TemporalKnowledgeSystem } from "../temporal-knowledge-system"

export class CognitiveAISystem {
  private temporalSystem = new TemporalKnowledgeSystem()
  private storageManager = new BrowserStorageManager()

  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []

  private isInitialized = false
  private systemStatus = "initializing"

  constructor() {
    console.log("🧠 CognitiveAISystem initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Cognitive AI System...")

      await this.temporalSystem.initialize()
      await this.loadSeedData()

      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations || []

      this.systemStatus = "ready"
      this.isInitialized = true
      console.log("✅ Cognitive AI System ready")
    } catch (error) {
      console.error("❌ Cognitive AI System initialization failed:", error)
      this.systemStatus = "error"
      throw error
    }
  }

  private async loadSeedData(): Promise<void> {
    try {
      // Load vocabulary
      const vocabResponse = await fetch("/seed_vocab.json")
      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json()
        Object.entries(vocabData).forEach(([word, entry]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: entry.definition,
            partOfSpeech: entry.part_of_speech || "unknown",
            source: "seed",
            confidence: 0.95,
            timestamp: Date.now(),
          })
        })
      }

      // Load mathematics
      const mathResponse = await fetch("/seed_maths.json")
      if (mathResponse.ok) {
        const mathData = await mathResponse.json()
        if (mathData.mathematical_vocabulary) {
          Object.entries(mathData.mathematical_vocabulary).forEach(([term, definition]: [string, any]) => {
            this.mathematics.set(term, {
              concept: term,
              definition: String(definition),
              type: "vocabulary",
              source: "seed",
              confidence: 0.95,
              timestamp: Date.now(),
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load seed data:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 Processing with cognitive system:", userMessage)

    // Store user message
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    let response = "I understand. How can I help you further?"
    let confidence = 0.7
    const knowledgeUsed: string[] = []

    // Tesla/Vortex Math Analysis
    const teslaMatch = userMessage.match(/tesla.*(?:pattern|math|number).*?(\d+)/i)
    if (teslaMatch) {
      const number = Number.parseInt(teslaMatch[1])
      const teslaAnalysis = this.analyzeTeslaNumber(number)

      response = `⚡ **Tesla/Vortex Mathematics Analysis**\n\n**Number:** ${number}\n**Digital Root:** ${teslaAnalysis.digitalRoot}\n**Type:** ${teslaAnalysis.type}\n\n**Analysis:** ${teslaAnalysis.analysis}\n\n${teslaAnalysis.isTeslaNumber ? "🌟 This is one of Tesla's sacred numbers!" : "🔄 This number is part of the infinite vortex cycle."}`
      confidence = 0.95
      knowledgeUsed.push("tesla_mathematics", "vortex_analysis")
    }

    // Enhanced Math Processing
    const mathMatch = userMessage.match(/(\d+)\s*([+\-*/×÷])\s*(\d+)/)
    if (mathMatch && !teslaMatch) {
      const num1 = Number.parseInt(mathMatch[1])
      const operator = mathMatch[2]
      const num2 = Number.parseInt(mathMatch[3])

      let result: number
      switch (operator) {
        case "+":
          result = num1 + num2
          break
        case "-":
          result = num1 - num2
          break
        case "*":
        case "×":
          result = num1 * num2
          break
        case "/":
        case "÷":
          result = num1 / num2
          break
        default:
          result = 0
      }

      // Store calculation in temporal system
      await this.temporalSystem.storeKnowledge(`calculation_${Date.now()}`, {
        expression: `${num1} ${operator} ${num2}`,
        result: result,
        timestamp: Date.now(),
      })

      response = `🧮 **Mathematical Calculation**\n\nThe answer is: **${result}**\n\nOperation: ${operator}\nNumbers: ${num1}, ${num2}`
      confidence = 0.95
      knowledgeUsed.push("enhanced_math_processor", "temporal_storage")
    }

    // Definition lookup with learning
    const defMatch = userMessage.match(/what\s+(?:is|does|means?)\s+(.+)/i)
    if (defMatch) {
      const word = defMatch[1].toLowerCase().trim()
      const vocabEntry = this.vocabulary.get(word)

      if (vocabEntry) {
        response = `📖 **${vocabEntry.word}** (${vocabEntry.partOfSpeech})\n\n**Definition:** ${vocabEntry.definition}\n\n**Source:** ${vocabEntry.source === "seed" ? "Built-in knowledge" : "Dictionary API"}`
        confidence = vocabEntry.confidence
        knowledgeUsed.push("vocabulary_system")
      } else {
        // Try to learn the word
        const learnedWord = await this.learnNewWord(word)
        if (learnedWord) {
          response = `📖 **${learnedWord.word}** (${learnedWord.partOfSpeech})\n\n**Definition:** ${learnedWord.definition}\n\n✨ I've learned this word and will remember it!`
          confidence = learnedWord.confidence
          knowledgeUsed.push("dictionary_api", "learning_system")
        } else {
          response = `I couldn't find a definition for "${word}". Could you help me learn it?`
          confidence = 0.4
        }
      }
    }

    // Personal information extraction
    const personalInfo = this.extractPersonalInfo(userMessage)
    if (Object.keys(personalInfo).length > 0) {
      Object.entries(personalInfo).forEach(([key, value]) => {
        this.personalInfo.set(key, {
          key,
          value: String(value),
          timestamp: Date.now(),
          importance: 0.8,
          source: "conversation",
        })
      })

      response = `👤 **Personal Information Stored**\n\n`
      Object.entries(personalInfo).forEach(([key, value]) => {
        response += `• **${key}**: ${value}\n`
      })
      response += `\n✅ I'll remember this information for our future conversations!`

      confidence = 0.9
      knowledgeUsed.push("personal_memory", "information_extraction")
    }

    // Store AI response
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: Date.now(),
      confidence,
    }
    this.conversationHistory.push(aiMsg)

    // Save conversation
    await this.storageManager.saveConversations(this.conversationHistory)

    return {
      content: response,
      confidence,
      knowledgeUsed,
      reasoning: ["Processed with cognitive AI system"],
    }
  }

  private analyzeTeslaNumber(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const teslaNumbers = [3, 6, 9]
    const vortexCycle = [1, 2, 4, 8, 7, 5]

    const isTeslaNumber = teslaNumbers.includes(digitalRoot)
    const isVortexNumber = vortexCycle.includes(digitalRoot)

    return {
      digitalRoot,
      isTeslaNumber,
      isVortexNumber,
      type: isTeslaNumber ? "Tesla Number" : isVortexNumber ? "Vortex Cycle" : "Standard",
      analysis: isTeslaNumber
        ? `Tesla Number ${digitalRoot} - ${this.getTeslaNumberMeaning(digitalRoot)}`
        : isVortexNumber
          ? `Vortex Cycle position ${vortexCycle.indexOf(digitalRoot) + 1}`
          : "Standard number outside Tesla/Vortex patterns",
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

  private getTeslaNumberMeaning(number: number): string {
    const meanings = {
      3: "Creation and manifestation",
      6: "Harmony and balance",
      9: "Completion and universal wisdom",
    }
    return meanings[number as keyof typeof meanings] || "Unknown Tesla number"
  }

  private async learnNewWord(word: string): Promise<any | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data[0]) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]

          const newWord = {
            word: word.toLowerCase(),
            definition: definition?.definition || "No definition available",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            source: "learned_api",
            confidence: 0.8,
            timestamp: Date.now(),
          }

          this.vocabulary.set(word.toLowerCase(), newWord)

          // Store in temporal system
          await this.temporalSystem.storeKnowledge(`vocab_${word}`, newWord)

          return newWord
        }
      }
    } catch (error) {
      console.warn("Failed to lookup word:", error)
    }
    return null
  }

  private extractPersonalInfo(text: string): any {
    const info: any = {}

    const nameMatch = text.match(/my name is (\w+)/i)
    if (nameMatch) info.name = nameMatch[1]

    const patterns = [
      { pattern: /i have (\d+) (cats?|dogs?|pets?)/i, key: "pets" },
      { pattern: /i have a wife/i, key: "marital_status", value: "married" },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job" },
      { pattern: /i live in (.+)/i, key: "location" },
    ]

    patterns.forEach(({ pattern, key, value }) => {
      const match = text.match(pattern)
      if (match) {
        info[key] = value || match[1]
      }
    })

    return info
  }

  public getStats(): any {
    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      systemStatus: this.systemStatus,
      totalLearned: Array.from(this.vocabulary.values()).filter((v) => v.source === "learned_api").length,

      vocabularyData: this.vocabulary,
      mathFunctionsData: this.mathematics,
      personalInfoData: this.personalInfo,
    }
  }

  public getConversationHistory(): any[] {
    return [...this.conversationHistory]
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemStatus: this.systemStatus,
      systemIdentity: {
        name: "CognitiveAI",
        version: "2.5.0",
      },
      vocabularySize: this.vocabulary.size,
      mathSize: this.mathematics.size,
      temporalSystemActive: true,
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      conversations: this.conversationHistory,
      temporalData: this.temporalSystem.exportData(),
      exportTimestamp: Date.now(),
      version: "2.5.0",
    }
  }
}
