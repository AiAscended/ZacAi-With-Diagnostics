// lib/cognitive-engine.ts
"use client"

import type { ChatMessage, EngineResponse, IKnowledgeModule, MathResponse, VocabularyEntry } from "./types"
import { VocabularyModule } from "./modules/vocabulary-module"
import { MathematicsModule } from "./modules/mathematics-module"

export class CognitiveEngine {
  private modules: Map<string, IKnowledgeModule> = new Map()
  private conversationHistory: ChatMessage[] = []
  public isInitialized = false

  constructor() {
    this.registerModule(new VocabularyModule())
    this.registerModule(new MathematicsModule())
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

  public getModule(moduleName: string): IKnowledgeModule | undefined {
    return this.modules.get(moduleName)
  }

  async processQuery(userInput: string): Promise<EngineResponse> {
    const reasoning: string[] = []
    reasoning.push("Received and logged user input.")

    // Simple Intent Recognition
    const isMathQuery = /calculate|compute|solve|what is|what's/i.test(userInput) && /[0-9]/.test(userInput)
    const isDefinitionQuery = /define|what is|what's the meaning of/i.test(userInput) && !isMathQuery

    let answer = ""
    let confidence = 0.5

    if (isMathQuery) {
      reasoning.push("Math intent detected. Delegating to Mathematics Module.")
      const mathModule = this.modules.get("Mathematics") as MathematicsModule
      const result: MathResponse = mathModule.evaluateExpression(userInput)
      answer = result.answer
      confidence = result.confidence
      reasoning.push(...result.reasoning)
    } else if (isDefinitionQuery) {
      reasoning.push("Definition intent detected. Delegating to Vocabulary Module.")
      const vocabModule = this.modules.get("Vocabulary") as VocabularyModule
      const term = userInput.replace(/^(define|what is|what's the meaning of)\s*/i, "").replace(/[?]/g, "")
      reasoning.push(`Searching for term: "${term}"`)
      const result: VocabularyEntry | null = await vocabModule.findTerm(term)
      if (result) {
        answer = `**${result.word}** (${result.part_of_speech}): ${result.definition}`
        confidence = 0.95
        reasoning.push(`Found definition for "${term}" in ${result.source} knowledge base.`)
      } else {
        answer = `I'm sorry, I could not find a definition for "${term}".`
        confidence = 0.4
        reasoning.push(`Term "${term}" not found in any knowledge base.`)
      }
    } else {
      reasoning.push("No specific intent recognized. Generating default response.")
      answer =
        "I'm not sure how to answer that yet. My capabilities are currently focused on vocabulary definitions and mathematical calculations. Try asking 'define synergy' or 'calculate 12 * 5'."
      confidence = 0.3
    }

    const response: EngineResponse = { answer, confidence, reasoning }

    this.conversationHistory.push({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.answer,
      timestamp: Date.now(),
      reasoning: response.reasoning,
      confidence: response.confidence,
    })

    return response
  }

  public getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }
}
