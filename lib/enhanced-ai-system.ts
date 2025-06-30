// lib/enhanced-ai-system.ts

import { MathProcessor } from "./math-processor"
import { VocabularyProcessor } from "./vocabulary-processor"
import { ApiService } from "./api-service"

interface ThinkingStep {
  step: string
  details?: string
  status: "processing" | "completed" | "failed"
  icon?: string
}

export class EnhancedAISystem {
  private mathProcessor: MathProcessor
  private vocabularyProcessor: VocabularyProcessor
  private apiService: ApiService
  private learntVocabPath: string
  private logStep: (step: ThinkingStep) => void

  constructor(logStep: (step: ThinkingStep) => void, learntVocabPath = "learnt_vocab.json") {
    this.logStep = logStep
    this.mathProcessor = new MathProcessor()
    this.vocabularyProcessor = new VocabularyProcessor(learntVocabPath)
    this.apiService = new ApiService()
    this.learntVocabPath = learntVocabPath
  }

  async processMessage(userMessage: string): Promise<string> {
    this.logStep({ step: "Analyzing User Input", details: `"${userMessage}"`, status: "completed", icon: "Search" })

    // Intent Recognition (Simplified)
    let intent: "math" | "vocabulary" | "unknown" = "unknown"
    let expression: string | null = null
    let word: string | null = null

    if (
      userMessage.toLowerCase().includes("calculate") ||
      userMessage.toLowerCase().includes("+") ||
      userMessage.toLowerCase().includes("-") ||
      userMessage.toLowerCase().includes("*") ||
      userMessage.toLowerCase().includes("/")
    ) {
      intent = "math"
      expression = userMessage.replace(/calculate/gi, "").trim() // Extract expression
    } else if (userMessage.toLowerCase().includes("define") || userMessage.toLowerCase().includes("meaning of")) {
      intent = "vocabulary"
      word = userMessage.replace(/define|meaning of/gi, "").trim() // Extract word
    } else {
      this.logStep({
        step: "Intent Unknown",
        details: `Could not determine intent from "${userMessage}"`,
        status: "completed",
        icon: "Question",
      })
      return "I'm sorry, I don't understand. Please ask a math question or a vocabulary question."
    }

    if (intent === "math") {
      this.logStep({
        step: "Intent Recognized",
        details: "Mathematical Calculation",
        status: "completed",
        icon: "Calculator",
      })
      this.logStep({ step: "Executing Math Processor", details: `${expression}`, status: "processing", icon: "Cog" })
      try {
        const result = this.mathProcessor.evaluate(expression!)
        this.logStep({
          step: "Calculation Complete",
          details: `Result: ${result}`,
          status: "completed",
          icon: "CheckCircle",
        })
        return `The answer is: ${result}`
      } catch (error: any) {
        this.logStep({ step: "Calculation Failed", details: `${error.message}`, status: "failed", icon: "XCircle" })
        return `Error: ${error.message}`
      }
    } else if (intent === "vocabulary") {
      this.logStep({ step: "Intent Recognized", details: "Vocabulary Lookup", status: "completed", icon: "BookOpen" })
      this.logStep({
        step: "Checking Local Knowledge",
        details: `Word: "${word}"`,
        status: "processing",
        icon: "Database",
      })
      let definition = this.vocabularyProcessor.getDefinition(word!)

      if (definition) {
        this.logStep({
          step: "Word Found Locally",
          details: `Definition for "${word}" retrieved from local storage.`,
          status: "completed",
          icon: "CheckCircle",
        })
        return `${word}: ${definition}`
      } else {
        this.logStep({
          step: "Word not found locally",
          details: "Querying external dictionary API...",
          status: "processing",
          icon: "Wifi",
        })
        try {
          const apiResponse = await this.apiService.getDefinition(word!)
          definition = apiResponse.definition

          if (definition) {
            this.logStep({
              step: "API Response Received",
              details: `Definition for "${word}" found.`,
              status: "completed",
              icon: "CheckCircle",
            })
            this.vocabularyProcessor.learnWord(word!, definition)
            this.logStep({
              step: "Learning New Word",
              details: `Saving to ${this.learntVocabPath}`,
              status: "completed",
              icon: "Save",
            })
            return `${word}: ${definition}`
          } else {
            this.logStep({
              step: "API Response Empty",
              details: `No definition found for "${word}"`,
              status: "failed",
              icon: "XCircle",
            })
            return `Sorry, I couldn't find a definition for ${word}.`
          }
        } catch (error: any) {
          this.logStep({ step: "API Call Failed", details: `${error.message}`, status: "failed", icon: "WifiOff" })
          return `Error: ${error.message}`
        }
      }
    } else {
      this.logStep({
        step: "Unknown Intent",
        details: `Could not process the message.`,
        status: "failed",
        icon: "QuestionMarkCircle",
      })
      return "I'm not sure how to handle that request."
    }
  }
}
