// lib/cognitive-engine.ts
"use client"

import type { ChatMessage, EngineResponse, IKnowledgeModule } from "./types"
import { VocabularyModule } from "./modules/vocabulary-module"
// Import other modules as they are created
// import { MathematicsModule } from './modules/mathematics-module';

export class CognitiveEngine {
  private modules: Map<string, IKnowledgeModule> = new Map()
  private conversationHistory: ChatMessage[] = []
  public isInitialized = false

  constructor() {
    // Register all modules here
    this.registerModule(new VocabularyModule())
    // this.registerModule(new MathematicsModule());
  }

  private registerModule(module: IKnowledgeModule) {
    this.modules.set(module.name, module)
  }

  async initialize(): Promise<void> {
    console.log("🚀 Initializing Cognitive Engine...")
    for (const module of this.modules.values()) {
      await module.initialize()
    }
    this.isInitialized = true
    console.log("✅ Cognitive Engine and all modules initialized.")
  }

  async processMessage(userInput: string): Promise<EngineResponse> {
    const thinkingProcess: string[] = []

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    })
    thinkingProcess.push("Received user input.")

    // 1. Intent Recognition (simple version for now)
    const definitionIntent = userInput.toLowerCase().match(/^(?:define|what is|what's the meaning of)\s(.+)/)

    let responseContent = ""
    let confidence = 0.5

    if (definitionIntent) {
      const term = definitionIntent[1].replace(/[?.!]/g, "")
      thinkingProcess.push(`Recognized 'definition' intent for term: "${term}".`)
      const vocabModule = this.modules.get("Vocabulary")
      if (vocabModule) {
        thinkingProcess.push("Querying Vocabulary Module...")
        const result = await vocabModule.findTerm(term)
        if (result) {
          responseContent = `**${result.word}** (${result.part_of_speech}): ${result.definition}`
          confidence = 0.95
          thinkingProcess.push(`Found definition. Source: ${result.source}.`)
        } else {
          responseContent = `I couldn't find a definition for "${term}".`
          confidence = 0.4
          thinkingProcess.push("Vocabulary Module returned no result.")
        }
      }
    } else {
      // Default conversational response
      thinkingProcess.push("No specific intent recognized. Generating conversational response.")
      responseContent = `I'm processing your message: "${userInput}". My modular system is online. Try asking me to define a word, like "define technology".`
      confidence = 0.7
    }

    const response: EngineResponse = {
      content: responseContent,
      confidence,
      thinkingProcess,
    }

    this.conversationHistory.push({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      timestamp: Date.now(),
      thinkingProcess: response.thinkingProcess,
      confidence: response.confidence,
    })

    return response
  }

  // Method to get data from a specific module for the UI
  public getModuleData(moduleName: string): Map<string, any> | null {
    const module = this.modules.get(moduleName)
    return module ? module.getKnowledge() : null
  }

  public getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }
}
