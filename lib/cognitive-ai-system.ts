import { ThinkingPipeline, type ThinkingResult } from "./thinking-pipeline"
import { InfantVocabularySystem } from "./infant-vocabulary-system"
import { WebKnowledgeEngine } from "./web-knowledge-engine"
import { MathematicalToolkit } from "./mathematical-toolkit"

export interface CognitiveResponse {
  message: string
  thinking: ThinkingResult
  confidence: number
  learningUpdate?: {
    newWords: string[]
    vocabularyProgress: any
  }
  timestamp: number
}

export interface CognitiveStats {
  vocabulary: any
  thinking: any
  webKnowledge: any
  mathematics: any
  overallProgress: {
    totalInteractions: number
    learningRate: number
    confidenceLevel: number
  }
}

export class CognitiveAISystem {
  private thinkingPipeline: ThinkingPipeline
  private vocabularySystem: InfantVocabularySystem
  private webKnowledge: WebKnowledgeEngine
  private mathToolkit: MathematicalToolkit
  private conversationHistory: CognitiveResponse[] = []
  private isInitialized = false

  constructor() {
    this.initializeSystem()
  }

  private async initializeSystem(): Promise<void> {
    try {
      console.log("🧠 Initializing Cognitive AI System...")

      // Initialize all subsystems
      this.thinkingPipeline = new ThinkingPipeline()
      this.vocabularySystem = new InfantVocabularySystem()
      this.webKnowledge = new WebKnowledgeEngine()
      this.mathToolkit = new MathematicalToolkit()

      // Load conversation history
      this.loadConversationHistory()

      this.isInitialized = true
      console.log("✅ Cognitive AI System initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize Cognitive AI System:", error)
      throw error
    }
  }

  async processMessage(message: string): Promise<CognitiveResponse> {
    if (!this.isInitialized) {
      await this.initializeSystem()
    }

    try {
      console.log("🤔 Processing message:", message)

      // Use thinking pipeline to process the message
      const thinking = await this.thinkingPipeline.processQuery(message)

      // Extract learning opportunities
      const learningUpdate = await this.processLearningOpportunities(message, thinking)

      // Generate response based on thinking result
      const responseMessage = this.generateResponse(thinking)

      const response: CognitiveResponse = {
        message: responseMessage,
        thinking,
        confidence: thinking.confidence,
        learningUpdate,
        timestamp: Date.now(),
      }

      // Store in conversation history
      this.conversationHistory.push(response)
      this.saveConversationHistory()

      console.log("✅ Message processed successfully")
      return response
    } catch (error) {
      console.error("❌ Error processing message:", error)

      // Return error response
      return {
        message: "I encountered an error while processing your message. Let me try to help you anyway.",
        thinking: {
          query: message,
          steps: [
            {
              step: 1,
              process: "Error Handling",
              reasoning: `System error: ${error}`,
              toolsConsidered: [],
              toolSelected: null,
              confidence: 0.1,
            },
          ],
          finalAnswer: "Error occurred during processing",
          toolsUsed: [],
          confidence: 0.1,
          processingTime: 0,
        },
        confidence: 0.1,
        timestamp: Date.now(),
      }
    }
  }

  private async processLearningOpportunities(message: string, thinking: ThinkingResult): Promise<any> {
    const words = message.toLowerCase().split(/\s+/)
    const newWords: string[] = []

    // Check for new vocabulary
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, "")
      if (cleanWord.length > 2) {
        // Mark word as encountered for learning
        this.vocabularySystem.markWordLearned(cleanWord, true)

        // Check if it's a new word
        if (this.isNewWord(cleanWord)) {
          newWords.push(cleanWord)
        }
      }
    }

    // Get updated vocabulary progress
    const vocabularyProgress = this.vocabularySystem.getVocabularyStats()

    return {
      newWords,
      vocabularyProgress,
    }
  }

  private isNewWord(word: string): boolean {
    // Simple check - in a real system, this would be more sophisticated
    const commonWords = [
      "the",
      "and",
      "is",
      "in",
      "to",
      "of",
      "a",
      "that",
      "it",
      "with",
      "for",
      "as",
      "was",
      "on",
      "are",
      "you",
      "this",
      "be",
      "have",
      "from",
      "or",
      "one",
      "had",
      "by",
      "word",
      "but",
      "not",
      "what",
      "all",
      "were",
      "they",
      "we",
      "when",
      "your",
      "can",
      "said",
      "there",
      "each",
      "which",
      "she",
      "do",
      "how",
      "their",
      "if",
      "will",
      "up",
      "other",
      "about",
      "out",
      "many",
      "then",
      "them",
      "these",
      "so",
      "some",
      "her",
      "would",
      "make",
      "like",
      "into",
      "him",
      "has",
      "two",
      "more",
      "very",
      "what",
      "know",
      "just",
      "first",
      "get",
      "over",
      "think",
      "also",
      "back",
      "after",
      "use",
      "man",
      "good",
      "new",
      "write",
      "our",
      "me",
      "day",
      "too",
      "any",
      "may",
      "say",
      "most",
      "us",
    ]

    return !commonWords.includes(word.toLowerCase())
  }

  private generateResponse(thinking: ThinkingResult): string {
    let response = ""

    // Start with the final answer from thinking
    response = thinking.finalAnswer

    // Add thinking transparency if confidence is high
    if (thinking.confidence > 0.7) {
      response += `\n\n💭 **My thinking process:**\n`
      thinking.steps.forEach((step, index) => {
        if (step.toolSelected) {
          response += `${index + 1}. ${step.process}: ${step.reasoning}\n`
        }
      })
    }

    // Add learning acknowledgment
    if (thinking.toolsUsed.includes("vocabulary")) {
      response += `\n📚 I'm continuing to learn from our conversation!`
    }

    return response.trim()
  }

  private loadConversationHistory(): void {
    try {
      const saved = localStorage.getItem("cognitiveConversationHistory")
      if (saved) {
        this.conversationHistory = JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error)
    }
  }

  private saveConversationHistory(): void {
    try {
      // Keep only last 100 conversations to manage storage
      const recentHistory = this.conversationHistory.slice(-100)
      localStorage.setItem("cognitiveConversationHistory", JSON.stringify(recentHistory))
    } catch (error) {
      console.error("Failed to save conversation history:", error)
    }
  }

  // Public methods for system management
  async getSystemStats(): Promise<CognitiveStats> {
    const vocabularyStats = this.vocabularySystem.getVocabularyStats()
    const thinkingStats = this.thinkingPipeline.getThinkingStats()
    const webStats = this.webKnowledge.getStats()
    const mathStats = this.mathToolkit.getMathStats()

    const totalInteractions = this.conversationHistory.length
    const avgConfidence =
      totalInteractions > 0
        ? this.conversationHistory.reduce((sum, conv) => sum + conv.confidence, 0) / totalInteractions
        : 0

    // Calculate learning rate based on vocabulary progress
    const learningRate = vocabularyStats.masteredWords / Math.max(totalInteractions, 1)

    return {
      vocabulary: vocabularyStats,
      thinking: thinkingStats,
      webKnowledge: webStats,
      mathematics: mathStats,
      overallProgress: {
        totalInteractions,
        learningRate: Math.round(learningRate * 100) / 100,
        confidenceLevel: Math.round(avgConfidence * 100),
      },
    }
  }

  rememberUserInfo(key: string, value: string): void {
    this.thinkingPipeline.rememberFact(key, value)
  }

  forgetUserInfo(key: string): void {
    this.thinkingPipeline.forgetFact(key)
  }

  resetLearningProgress(): void {
    this.vocabularySystem.resetProgress()
    this.mathToolkit.clearHistory()
    this.webKnowledge.clearCache()
    this.conversationHistory = []
    localStorage.removeItem("cognitiveConversationHistory")
  }

  getConversationHistory(): CognitiveResponse[] {
    return [...this.conversationHistory]
  }

  exportLearningData(): any {
    return {
      vocabulary: this.vocabularySystem.getVocabularyStats(),
      conversations: this.conversationHistory.slice(-50), // Last 50 conversations
      thinking: this.thinkingPipeline.getThinkingStats(),
      timestamp: Date.now(),
    }
  }

  async importLearningData(data: any): Promise<void> {
    try {
      if (data.conversations) {
        this.conversationHistory = data.conversations
        this.saveConversationHistory()
      }
      console.log("Learning data imported successfully")
    } catch (error) {
      console.error("Failed to import learning data:", error)
      throw error
    }
  }
}
