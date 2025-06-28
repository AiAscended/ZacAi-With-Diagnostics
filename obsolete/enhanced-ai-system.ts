"use client"

import { BrowserStorageManager } from "../browser-storage-manager"
import { EnhancedKnowledgeSystem } from "../enhanced-knowledge-system"

export class EnhancedAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private storageManager = new BrowserStorageManager()
  
  private vocabulary: Map<string, any> = new Map()
  private mathematics: Map<string, any> = new Map()
  private personalInfo: Map<string, any> = new Map()
  private conversationHistory: any[] = []
  
  private isInitialized = false
  private systemStatus = "initializing"

  constructor() {
    console.log("⚡ EnhancedAISystem initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Enhanced AI System...")
      
      await this.enhancedKnowledge.initialize()
      await this.loadSeedData()
      
      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations || []
      
      this.systemStatus = "ready"
      this.isInitialized = true
      console.log("✅ Enhanced AI System ready")
    } catch (error) {
      console.error("❌ Enhanced AI System initialization failed:", error)
      this.systemStatus = "error"
      throw error
    }
  }

  private async loadSeedData(): Promise<void> {
    try {
      // Load vocabulary with enhanced processing
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
            enhanced: true,
            timestamp: Date.now()
          })
        })
      }

      // Load mathematics with enhanced processing
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
              enhanced: true,
              timestamp: Date.now()
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

    console.log("⚡ Processing with enhanced system:", userMessage)

    // Store user message
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      \
