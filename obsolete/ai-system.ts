"use client"

import { BrowserStorageManager } from "./browser-storage-manager"

export class AISystem {
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private storageManager = new BrowserStorageManager()
  private isInitialized = false

  constructor() {
    console.log("🤖 AISystem initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing AI System...")

      // Load seed data
      await this.loadSeedData()

      // Load learned data
      await this.loadLearnedData()

      // Load conversation history
      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations || []

      this.isInitialized = true
      console.log("✅ AI System initialized successfully")
    } catch (error) {
      console.error("❌ AI System initialization failed:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<void> {
    try {
      // Load vocabulary
      const vocabResponse = await fetch("/seed_vocab.json")
      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json()
        Object.entries(vocabData).forEach(([word, data]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: data.definition,
            partOfSpeech: data.part_of_speech || "unknown",
            source: "seed",
            confidence: 0.9,
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
              confidence: 0.9,
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load seed data:", error)
    }
  }

  private async loadLearnedData(): Promise<void> {
    try {
      // Load learned vocabulary
      const learnedVocabResponse = await fetch("/learnt_vocab.json")
      if (learnedVocabResponse.ok) {
        const learnedVocabData = await learnedVocabResponse.json()
        if (learnedVocabData.vocabulary) {
          Object.entries(learnedVocabData.vocabulary).forEach(([word, data]: [string, any]) => {
            this.vocabulary.set(word.toLowerCase(), {
              word: word.toLowerCase(),
              definition: data.definition,
              partOfSpeech: data.partOfSpeech || "unknown",
              source: "learned",
              confidence: data.confidence || 0.8,
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load learned data:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🤖 Processing message:", userMessage)

    // Store user message
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    // Process the message
    let response = "I understand. How can I help you further?"
    let confidence = 0.7
    const knowledgeUsed: string[] = []

    // Check for math
    const mathMatch = userMessage.match(/(\d+)\s*[+\-*/×÷]\s*(\d+)/)
    if (mathMatch) {
      const num1 = Number.parseInt(mathMatch[1])
      const num2 = Number.parseInt(mathMatch[3] || mathMatch[2])
      const operator = mathMatch[2] || mathMatch[0].match(/[+\-*/×÷]/)?.[0]

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

      response = `🧮 The answer is: **${result}**`
      confidence = 0.95
      knowledgeUsed.push("mathematical_processor")
    }

    // Check for definitions
    const defMatch = userMessage.match(/what\s+(?:is|does|means?)\s+(.+)/i)
    if (defMatch) {
      const word = defMatch[1].toLowerCase().trim()
      const vocabEntry = this.vocabulary.get(word)

      if (vocabEntry) {
        response = `📖 **${vocabEntry.word}** (${vocabEntry.partOfSpeech})\n\n${vocabEntry.definition}`
        confidence = vocabEntry.confidence
        knowledgeUsed.push("vocabulary_system")
      } else {
        response = `I don't know the definition of "${word}" yet. Could you teach me?`
        confidence = 0.4
      }
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
      reasoning: ["Processed with basic AI system"],
    }
  }

  public getStats(): any {
    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      systemStatus: this.isInitialized ? "ready" : "initializing",
      totalLearned: Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length,
    }
  }

  public getConversationHistory(): any[] {
    return [...this.conversationHistory]
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemIdentity: {
        name: "AISystem",
        version: "1.0.0",
      },
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      conversations: this.conversationHistory,
      exportTimestamp: Date.now(),
    }
  }
}
