"use client"

import { BrowserStorageManager } from "../browser-storage-manager"
import { EnhancedKnowledgeSystem } from "../enhanced-knowledge-system"
import { EnhancedMathProcessor } from "../enhanced-math-processor"

export class UnifiedAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private enhancedMath = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()

  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private facts: Map<string, any> = new Map()
  private conversationHistory: any[] = []

  private isInitialized = false
  private systemStatus = "initializing"

  constructor() {
    console.log("🧠 UnifiedAISystem initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Unified AI System...")

      await this.enhancedKnowledge.initialize()

      await this.loadAllSeedData()
      await this.loadAllLearnedData()

      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations || []

      this.systemStatus = "ready"
      this.isInitialized = true
      console.log("✅ Unified AI System ready")
    } catch (error) {
      console.error("❌ Unified AI System initialization failed:", error)
      this.systemStatus = "error"
      throw error
    }
  }

  private async loadAllSeedData(): Promise<void> {
    await Promise.all([this.loadSeedVocabulary(), this.loadSeedMathematics(), this.loadSeedKnowledge()])
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
      }
    } catch (error) {
      console.warn("Failed to load seed mathematics:", error)
    }
  }

  private async loadSeedKnowledge(): Promise<void> {
    try {
      const response = await fetch("/seed_knowledge.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([domain, domainData]: [string, any]) => {
          if (typeof domainData === "object") {
            Object.entries(domainData).forEach(([topic, info]: [string, any]) => {
              this.facts.set(`${domain}_${topic}`, {
                topic: `${domain}: ${topic}`,
                content: typeof info === "string" ? info : JSON.stringify(info),
                category: domain,
                source: "seed",
                confidence: 0.9,
              })
            })
          }
        })
      }
    } catch (error) {
      console.warn("Failed to load seed knowledge:", error)
    }
  }

  private async loadAllLearnedData(): Promise<void> {
    await Promise.all([this.loadLearnedVocabulary(), this.loadLearnedMathematics(), this.loadLearnedScience()])
  }

  private async loadLearnedVocabulary(): Promise<void> {
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

  private async loadLearnedMathematics(): Promise<void> {
    try {
      const response = await fetch("/learnt_maths.json")
      if (response.ok) {
        const data = await response.json()
        if (data.mathematics) {
          Object.entries(data.mathematics).forEach(([concept, entry]: [string, any]) => {
            this.mathematics.set(concept, {
              concept,
              type: entry.type || "learned",
              formula: entry.formula || "Mathematical concept",
              source: "learned",
              confidence: entry.confidence || 0.8,
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load learned mathematics:", error)
    }
  }

  private async loadLearnedScience(): Promise<void> {
    try {
      const response = await fetch("/learnt_science.json")
      if (response.ok) {
        const data = await response.json()
        if (data.science) {
          Object.entries(data.science).forEach(([topic, entry]: [string, any]) => {
            this.facts.set(`science_${topic}`, {
              topic: `Science: ${topic}`,
              content: entry.content || "Scientific concept",
              category: "science",
              source: "learned",
              confidence: entry.confidence || 0.8,
            })
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load learned science:", error)
    }
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🧠 Processing with unified system:", userMessage)

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

    // Math processing
    const mathAnalysis = this.enhancedMath.analyzeMathExpression(userMessage)
    if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
      response = `🧮 The answer is: **${mathAnalysis.result}**`
      confidence = mathAnalysis.confidence
      knowledgeUsed.push("enhanced_math_processor")
    }

    // Definition lookup
    const defMatch = userMessage.match(/what\s+(?:is|does|means?)\s+(.+)/i)
    if (defMatch) {
      const word = defMatch[1].toLowerCase().trim()
      const vocabEntry = this.vocabulary.get(word)

      if (vocabEntry) {
        response = `📖 **${vocabEntry.word}** (${vocabEntry.partOfSpeech})\n\n${vocabEntry.definition}`
        confidence = vocabEntry.confidence
        knowledgeUsed.push("vocabulary_system")
      } else {
        // Try to learn the word
        const learnedWord = await this.learnNewWord(word)
        if (learnedWord) {
          response = `📖 **${learnedWord.word}** (${learnedWord.partOfSpeech})\n\n${learnedWord.definition}\n\n✨ I just learned this word!`
          confidence = learnedWord.confidence
          knowledgeUsed.push("dictionary_api", "learning_system")
        } else {
          response = `I don't know the definition of "${word}" yet. Could you teach me?`
          confidence = 0.4
        }
      }
    }

    // Personal info extraction
    const personalInfo = this.extractPersonalInfo(userMessage)
    if (Object.keys(personalInfo).length > 0) {
      Object.entries(personalInfo).forEach(([key, value]) => {
        this.personalInfo.set(key, {
          key,
          value: String(value),
          timestamp: Date.now(),
          source: "conversation",
        })
      })

      response = `👤 I've noted that information about you. Thank you for sharing!`
      confidence = 0.9
      knowledgeUsed.push("personal_memory")
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
      reasoning: ["Processed with unified AI system"],
      mathAnalysis: mathAnalysis.isMatch ? mathAnalysis : undefined,
    }
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
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job" },
      { pattern: /i live in (.+)/i, key: "location" },
    ]

    patterns.forEach(({ pattern, key }) => {
      const match = text.match(pattern)
      if (match) info[key] = match[1]
    })

    return info
  }

  public getStats(): any {
    const seedVocab = Array.from(this.vocabulary.values()).filter((v) => v.source === "seed").length
    const learnedVocab = Array.from(this.vocabulary.values()).filter(
      (v) => v.source === "learned" || v.source === "learned_api",
    ).length

    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: this.mathematics.size,
      memoryEntries: this.personalInfo.size,
      factsData: this.facts,
      totalMessages: this.conversationHistory.length,
      totalLearned: learnedVocab,
      systemStatus: this.systemStatus,

      vocabularyData: this.vocabulary,
      mathFunctionsData: this.mathematics,
      personalInfoData: this.personalInfo,

      breakdown: {
        seedVocab,
        learnedVocab,
        seedMath: Array.from(this.mathematics.values()).filter((m) => m.source === "seed").length,
        learnedMath: Array.from(this.mathematics.values()).filter((m) => m.source === "learned").length,
      },
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
        name: "UnifiedAI",
        version: "2.0.0",
      },
      vocabularySize: this.vocabulary.size,
      mathSize: this.mathematics.size,
      factsSize: this.facts.size,
    }
  }

  public exportData(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      mathematics: Array.from(this.mathematics.entries()),
      facts: Array.from(this.facts.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      conversations: this.conversationHistory,
      exportTimestamp: Date.now(),
      version: "2.0.0",
    }
  }
}
