"use client"

import { BrowserStorageManager } from "../browser-storage-manager"

export class ReliableAISystem {
  private storageManager = new BrowserStorageManager()
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  private isInitialized = false
  private systemStatus = "initializing"

  constructor() {
    console.log("🔧 ReliableAISystem initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Reliable AI System...")

      await this.loadSeedData()
      await this.loadLearnedData()

      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations || []

      this.systemStatus = "ready"
      this.isInitialized = true
      console.log("✅ Reliable AI System ready")
    } catch (error) {
      console.error("❌ Reliable AI System initialization failed:", error)
      this.systemStatus = "error_recovery"
      // Continue with limited functionality
      this.isInitialized = true
    }
  }

  private async loadSeedData(): Promise<void> {
    const loadPromises = [this.loadSeedVocabulary(), this.loadSeedMathematics()]

    await Promise.allSettled(loadPromises)
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            definition: entry.definition,
            partOfSpeech: entry.part_of_speech || "unknown",
            source: "seed",
            confidence: 0.95,
          })
        })
        console.log(`✅ Loaded ${Object.keys(data).length} seed vocabulary words`)
      }
    } catch (error) {
      console.warn("Failed to load seed vocabulary:", error)
    }
  }

  private async loadSeedMathematics(): Promise<void> {
    try {
      const response = await fetch("/seed_maths.json")
      if (response.ok) {
        const data = await response.json()
        if (data.mathematical_vocabulary) {
          Object.entries(data.mathematical_vocabulary).forEach(([term, definition]: [string, any]) => {
            this.mathematics.set(term, {
              concept: term,
              definition: String(definition),
              type: "vocabulary",
              source: "seed",
              confidence: 0.95,
            })
          })
        }
        console.log("✅ Loaded seed mathematics data")
      }
    } catch (error) {
      console.warn("Failed to load seed mathematics:", error)
    }
  }

  private async loadLearnedData(): Promise<void> {
    try {
      const response = await fetch("/learnt_vocab.json")
      if (response.ok) {
        const data = await response.json()
        if (data.vocabulary) {
          Object.entries(data.vocabulary).forEach(([word, entry]: [string, any]) => {
            this.vocabulary.set(word.toLowerCase(), {
              word: word.toLowerCase(),
              definition: entry.definition,
              partOfSpeech: entry.partOfSpeech || "unknown",
              source: "learned",
              confidence: entry.confidence || 0.8,
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load learned vocabulary:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🔧 Processing with reliable system:", userMessage)

    try {
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

      // Math processing with error handling
      try {
        const mathResult = this.processMathExpression(userMessage)
        if (mathResult.isMatch) {
          response = `🧮 The answer is: **${mathResult.result}**`
          confidence = mathResult.confidence
          knowledgeUsed.push("math_processor")
        }
      } catch (error) {
        console.warn("Math processing error:", error)
      }

      // Definition lookup with error handling
      try {
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
      } catch (error) {
        console.warn("Definition processing error:", error)
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

      // Save conversation with error handling
      try {
        await this.storageManager.saveConversations(this.conversationHistory)
      } catch (error) {
        console.warn("Failed to save conversation:", error)
      }

      return {
        content: response,
        confidence,
        knowledgeUsed,
        reasoning: ["Processed with reliable AI system"],
      }
    } catch (error) {
      console.error("Message processing error:", error)
      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.3,
        knowledgeUsed: [],
        reasoning: [`Error: ${error}`],
      }
    }
  }

  private processMathExpression(input: string): any {
    const mathMatch = input.match(/(\d+)\s*([+\-*/×÷])\s*(\d+)/)
    if (!mathMatch) {
      return { isMatch: false }
    }

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
        if (num2 === 0) throw new Error("Division by zero")
        result = num1 / num2
        break
      default:
        return { isMatch: false }
    }

    return {
      isMatch: true,
      result,
      operation: operator,
      numbers: [num1, num2],
      confidence: 0.95,
    }
  }

  public getStats(): any {
    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      totalMessages: this.conversationHistory.length,
      systemStatus: this.systemStatus,
      totalLearned: Array.from(this.vocabulary.values()).filter((v) => v.source === "learned").length,

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
        name: "ReliableAI",
        version: "1.5.0",
      },
      vocabularySize: this.vocabulary.size,
      mathSize: this.mathematics.size,
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      conversations: this.conversationHistory,
      exportTimestamp: Date.now(),
      version: "1.5.0",
    }
  }
}
