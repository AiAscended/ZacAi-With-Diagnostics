import { WebKnowledgeEngine } from "./web-knowledge-engine"
import { InfantVocabularySystem } from "./infant-vocabulary-system"
import { MathematicalToolkit } from "./mathematical-toolkit"

export interface ThinkingStep {
  step: number
  process: string
  reasoning: string
  toolsConsidered: string[]
  toolSelected: string | null
  confidence: number
  result?: any
}

export interface ThinkingResult {
  query: string
  steps: ThinkingStep[]
  finalAnswer: string
  toolsUsed: string[]
  confidence: number
  processingTime: number
}

export class ThinkingPipeline {
  private webKnowledge: WebKnowledgeEngine
  private vocabulary: InfantVocabularySystem
  private mathToolkit: MathematicalToolkit
  private personalMemory: Map<string, any> = new Map()
  private thinkingHistory: ThinkingResult[] = []

  constructor() {
    this.webKnowledge = new WebKnowledgeEngine()
    this.vocabulary = new InfantVocabularySystem()
    this.mathToolkit = new MathematicalToolkit()
    this.loadPersonalMemory()
  }

  async processQuery(query: string): Promise<ThinkingResult> {
    const startTime = Date.now()
    const steps: ThinkingStep[] = []
    let stepCounter = 1

    // Step 1: Analyze the query
    const analysisStep = this.analyzeQuery(query, stepCounter++)
    steps.push(analysisStep)

    // Step 2: Determine required tools
    const toolSelectionStep = this.selectTools(query, analysisStep, stepCounter++)
    steps.push(toolSelectionStep)

    // Step 3: Execute with selected tools
    const executionSteps = await this.executeWithTools(query, toolSelectionStep.toolSelected, stepCounter)
    steps.push(...executionSteps)

    // Step 4: Synthesize final answer
    const synthesisStep = this.synthesizeAnswer(query, steps, stepCounter + executionSteps.length)
    steps.push(synthesisStep)

    const processingTime = Date.now() - startTime
    const toolsUsed = steps.filter((s) => s.toolSelected).map((s) => s.toolSelected!)
    const avgConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length

    const result: ThinkingResult = {
      query,
      steps,
      finalAnswer: synthesisStep.result || "I need more information to provide a complete answer.",
      toolsUsed,
      confidence: avgConfidence,
      processingTime,
    }

    this.thinkingHistory.push(result)
    this.savePersonalMemory()

    return result
  }

  private analyzeQuery(query: string, stepNumber: number): ThinkingStep {
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(/\s+/)

    // Analyze query characteristics
    const isMathQuery = this.containsMathKeywords(lowerQuery)
    const isDefinitionQuery = this.containsDefinitionKeywords(lowerQuery)
    const isPersonalQuery = this.containsPersonalKeywords(lowerQuery)
    const isLearningQuery = this.containsLearningKeywords(lowerQuery)

    let reasoning = "Analyzing query characteristics: "
    const characteristics = []

    if (isMathQuery) characteristics.push("mathematical")
    if (isDefinitionQuery) characteristics.push("definitional")
    if (isPersonalQuery) characteristics.push("personal")
    if (isLearningQuery) characteristics.push("educational")

    reasoning += characteristics.length > 0 ? characteristics.join(", ") : "general inquiry"

    return {
      step: stepNumber,
      process: "Query Analysis",
      reasoning,
      toolsConsidered: ["pattern-recognition", "keyword-analysis"],
      toolSelected: "pattern-recognition",
      confidence: 0.9,
      result: {
        isMathQuery,
        isDefinitionQuery,
        isPersonalQuery,
        isLearningQuery,
        wordCount: words.length,
        complexity: this.assessComplexity(query),
      },
    }
  }

  private selectTools(query: string, analysisStep: ThinkingStep, stepNumber: number): ThinkingStep {
    const analysis = analysisStep.result
    const availableTools = ["vocabulary", "web-knowledge", "math-toolkit", "personal-memory"]
    const selectedTools = []

    let reasoning = "Selecting appropriate tools based on query analysis: "

    if (analysis.isMathQuery) {
      selectedTools.push("math-toolkit")
      reasoning += "Math toolkit for calculations. "
    }

    if (analysis.isDefinitionQuery) {
      selectedTools.push("vocabulary", "web-knowledge")
      reasoning += "Vocabulary and web knowledge for definitions. "
    }

    if (analysis.isPersonalQuery) {
      selectedTools.push("personal-memory")
      reasoning += "Personal memory for user-specific information. "
    }

    if (analysis.isLearningQuery) {
      selectedTools.push("vocabulary")
      reasoning += "Vocabulary system for learning progress. "
    }

    // Default to vocabulary if no specific tools selected
    if (selectedTools.length === 0) {
      selectedTools.push("vocabulary", "web-knowledge")
      reasoning += "Default tools for general inquiry."
    }

    return {
      step: stepNumber,
      process: "Tool Selection",
      reasoning,
      toolsConsidered: availableTools,
      toolSelected: selectedTools[0], // Primary tool
      confidence: 0.85,
      result: selectedTools,
    }
  }

  private async executeWithTools(
    query: string,
    primaryTool: string | null,
    startingStep: number,
  ): Promise<ThinkingStep[]> {
    const steps: ThinkingStep[] = []
    let stepCounter = startingStep

    if (!primaryTool) {
      return [
        {
          step: stepCounter,
          process: "Tool Execution",
          reasoning: "No tools selected, providing general response",
          toolsConsidered: [],
          toolSelected: null,
          confidence: 0.3,
        },
      ]
    }

    switch (primaryTool) {
      case "math-toolkit":
        steps.push(await this.executeMathTool(query, stepCounter++))
        break

      case "vocabulary":
        steps.push(await this.executeVocabularyTool(query, stepCounter++))
        break

      case "web-knowledge":
        steps.push(await this.executeWebKnowledgeTool(query, stepCounter++))
        break

      case "personal-memory":
        steps.push(await this.executePersonalMemoryTool(query, stepCounter++))
        break
    }

    return steps
  }

  private async executeMathTool(query: string, stepNumber: number): Promise<ThinkingStep> {
    try {
      // Extract mathematical expressions
      const mathExpression = this.extractMathExpression(query)

      if (mathExpression) {
        const result = this.mathToolkit.evaluateExpression(mathExpression)

        return {
          step: stepNumber,
          process: "Mathematical Calculation",
          reasoning: `Identified mathematical expression: ${mathExpression}`,
          toolsConsidered: ["expression-evaluator", "basic-arithmetic"],
          toolSelected: "expression-evaluator",
          confidence: 0.95,
          result: result,
        }
      } else {
        // Look for word problems or math concepts
        const numbers = query.match(/\d+/g)
        if (numbers && numbers.length >= 2) {
          const a = Number.parseInt(numbers[0])
          const b = Number.parseInt(numbers[1])

          if (query.includes("add") || query.includes("plus") || query.includes("+")) {
            const result = this.mathToolkit.add(a, b)
            return {
              step: stepNumber,
              process: "Mathematical Calculation",
              reasoning: `Identified addition word problem: ${a} + ${b}`,
              toolsConsidered: ["word-problem-solver"],
              toolSelected: "addition",
              confidence: 0.9,
              result: result,
            }
          }
        }
      }

      return {
        step: stepNumber,
        process: "Mathematical Analysis",
        reasoning: "Could not identify specific mathematical operation",
        toolsConsidered: ["expression-evaluator", "word-problem-solver"],
        toolSelected: null,
        confidence: 0.4,
      }
    } catch (error) {
      return {
        step: stepNumber,
        process: "Mathematical Calculation",
        reasoning: `Math calculation failed: ${error}`,
        toolsConsidered: ["expression-evaluator"],
        toolSelected: "expression-evaluator",
        confidence: 0.2,
      }
    }
  }

  private async executeVocabularyTool(query: string, stepNumber: number): Promise<ThinkingStep> {
    const words = query.toLowerCase().split(/\s+/)
    const unknownWords = []
    const knownWords = []

    // Check each word against vocabulary
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, "")
      if (cleanWord.length > 2) {
        // Skip very short words
        // This is a simplified check - in reality, we'd check against the vocabulary system
        if (this.isCommonWord(cleanWord)) {
          knownWords.push(cleanWord)
        } else {
          unknownWords.push(cleanWord)
        }
      }
    }

    const stats = this.vocabulary.getVocabularyStats()

    return {
      step: stepNumber,
      process: "Vocabulary Analysis",
      reasoning: `Analyzed ${words.length} words. Found ${unknownWords.length} potentially new words.`,
      toolsConsidered: ["vocabulary-checker", "learning-tracker"],
      toolSelected: "vocabulary-checker",
      confidence: 0.8,
      result: {
        totalWords: words.length,
        knownWords: knownWords.length,
        unknownWords: unknownWords.length,
        newWords: unknownWords,
        vocabularyStats: stats,
      },
    }
  }

  private async executeWebKnowledgeTool(query: string, stepNumber: number): Promise<ThinkingStep> {
    try {
      // Extract the main concept to search for
      const searchTerm = this.extractMainConcept(query)
      const knowledge = await this.webKnowledge.searchAndLearn(searchTerm)

      if (knowledge) {
        return {
          step: stepNumber,
          process: "Web Knowledge Search",
          reasoning: `Successfully found information about "${searchTerm}"`,
          toolsConsidered: ["wikipedia-search", "dictionary-lookup"],
          toolSelected: "web-search",
          confidence: 0.9,
          result: knowledge,
        }
      } else {
        return {
          step: stepNumber,
          process: "Web Knowledge Search",
          reasoning: `Could not find reliable information about "${searchTerm}"`,
          toolsConsidered: ["wikipedia-search", "dictionary-lookup"],
          toolSelected: "web-search",
          confidence: 0.3,
        }
      }
    } catch (error) {
      return {
        step: stepNumber,
        process: "Web Knowledge Search",
        reasoning: `Web search failed: ${error}`,
        toolsConsidered: ["web-search"],
        toolSelected: "web-search",
        confidence: 0.2,
      }
    }
  }

  private async executePersonalMemoryTool(query: string, stepNumber: number): Promise<ThinkingStep> {
    const personalInfo = this.searchPersonalMemory(query)

    if (personalInfo.length > 0) {
      return {
        step: stepNumber,
        process: "Personal Memory Recall",
        reasoning: `Found ${personalInfo.length} relevant personal memories`,
        toolsConsidered: ["memory-search"],
        toolSelected: "memory-recall",
        confidence: 0.95,
        result: personalInfo,
      }
    } else {
      return {
        step: stepNumber,
        process: "Personal Memory Recall",
        reasoning: "No relevant personal information found",
        toolsConsidered: ["memory-search"],
        toolSelected: "memory-recall",
        confidence: 0.6,
      }
    }
  }

  private synthesizeAnswer(query: string, steps: ThinkingStep[], stepNumber: number): ThinkingStep {
    let answer = ""
    let confidence = 0.5

    // Combine results from all steps
    const mathResults = steps.filter((s) => s.process.includes("Mathematical"))
    const vocabResults = steps.filter((s) => s.process.includes("Vocabulary"))
    const webResults = steps.filter((s) => s.process.includes("Web Knowledge"))
    const memoryResults = steps.filter((s) => s.process.includes("Personal Memory"))

    if (mathResults.length > 0 && mathResults[0].result) {
      const mathResult = mathResults[0].result
      answer = `The calculation result is: ${mathResult.result}. `
      if (mathResult.steps) {
        answer += `Steps: ${mathResult.steps.join(" → ")}`
      }
      confidence = 0.9
    }

    if (webResults.length > 0 && webResults[0].result) {
      const webResult = webResults[0].result
      answer += `${webResult.definition} `
      if (webResult.examples && webResult.examples.length > 0) {
        answer += `Example: ${webResult.examples[0]}`
      }
      confidence = Math.max(confidence, 0.8)
    }

    if (vocabResults.length > 0 && vocabResults[0].result) {
      const vocabResult = vocabResults[0].result
      if (vocabResult.newWords && vocabResult.newWords.length > 0) {
        answer += `I learned ${vocabResult.newWords.length} new words from your message: ${vocabResult.newWords.join(", ")}. `
      }
      answer += `Your vocabulary level: ${vocabResult.vocabularyStats.currentLevel}`
    }

    if (memoryResults.length > 0 && memoryResults[0].result) {
      const memories = memoryResults[0].result
      answer += `Based on what I remember about you: ${memories.join(", ")}`
      confidence = Math.max(confidence, 0.85)
    }

    if (!answer) {
      answer = "I understand your question, but I need more specific information to provide a detailed answer."
      confidence = 0.4
    }

    return {
      step: stepNumber,
      process: "Answer Synthesis",
      reasoning: "Combining results from all analysis steps",
      toolsConsidered: ["synthesis-engine"],
      toolSelected: "synthesis-engine",
      confidence,
      result: answer.trim(),
    }
  }

  // Helper methods
  private containsMathKeywords(query: string): boolean {
    const mathKeywords = [
      "calculate",
      "add",
      "subtract",
      "multiply",
      "divide",
      "plus",
      "minus",
      "times",
      "equals",
      "+",
      "-",
      "*",
      "/",
      "=",
      "math",
      "equation",
    ]
    return mathKeywords.some((keyword) => query.includes(keyword))
  }

  private containsDefinitionKeywords(query: string): boolean {
    const defKeywords = ["what is", "define", "meaning", "definition", "explain", "describe"]
    return defKeywords.some((keyword) => query.includes(keyword))
  }

  private containsPersonalKeywords(query: string): boolean {
    const personalKeywords = ["my", "i am", "remember", "about me", "personal"]
    return personalKeywords.some((keyword) => query.includes(keyword))
  }

  private containsLearningKeywords(query: string): boolean {
    const learningKeywords = ["learn", "teach", "study", "practice", "vocabulary", "lesson"]
    return learningKeywords.some((keyword) => query.includes(keyword))
  }

  private assessComplexity(query: string): number {
    const words = query.split(/\s+/).length
    const sentences = query.split(/[.!?]+/).length
    const hasNumbers = /\d/.test(query)
    const hasSpecialChars = /[^\w\s]/.test(query)

    let complexity = 1
    if (words > 10) complexity += 1
    if (sentences > 1) complexity += 1
    if (hasNumbers) complexity += 1
    if (hasSpecialChars) complexity += 1

    return Math.min(complexity, 5)
  }

  private extractMathExpression(query: string): string | null {
    // Look for mathematical expressions
    const mathPattern = /[\d+\-*/().\s]+/g
    const matches = query.match(mathPattern)

    if (matches) {
      for (const match of matches) {
        if (/[+\-*/]/.test(match) && /\d/.test(match)) {
          return match.trim()
        }
      }
    }

    return null
  }

  private extractMainConcept(query: string): string {
    // Simple concept extraction - remove common words
    const stopWords = [
      "what",
      "is",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ]
    const words = query.toLowerCase().split(/\s+/)
    const contentWords = words.filter((word) => !stopWords.includes(word) && word.length > 2)

    return contentWords[0] || query.split(" ")[0]
  }

  private isCommonWord(word: string): boolean {
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
    ]
    return commonWords.includes(word.toLowerCase())
  }

  private searchPersonalMemory(query: string): string[] {
    const results = []
    for (const [key, value] of this.personalMemory.entries()) {
      if (query.toLowerCase().includes(key.toLowerCase())) {
        results.push(`${key}: ${value}`)
      }
    }
    return results
  }

  private loadPersonalMemory(): void {
    try {
      const saved = localStorage.getItem("personalMemory")
      if (saved) {
        const data = JSON.parse(saved)
        this.personalMemory = new Map(data)
      }
    } catch (error) {
      console.error("Failed to load personal memory:", error)
    }
  }

  private savePersonalMemory(): void {
    try {
      const data = Array.from(this.personalMemory.entries())
      localStorage.setItem("personalMemory", JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save personal memory:", error)
    }
  }

  // Public methods for managing personal memory
  rememberFact(key: string, value: string): void {
    this.personalMemory.set(key, value)
    this.savePersonalMemory()
  }

  forgetFact(key: string): void {
    this.personalMemory.delete(key)
    this.savePersonalMemory()
  }

  getThinkingStats() {
    const toolUsage = this.thinkingHistory.reduce(
      (acc, result) => {
        result.toolsUsed.forEach((tool) => {
          acc[tool] = (acc[tool] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const avgProcessingTime =
      this.thinkingHistory.reduce((sum, r) => sum + r.processingTime, 0) / this.thinkingHistory.length
    const avgConfidence = this.thinkingHistory.reduce((sum, r) => sum + r.confidence, 0) / this.thinkingHistory.length

    return {
      totalQueries: this.thinkingHistory.length,
      toolUsage,
      averageProcessingTime: Math.round(avgProcessingTime),
      averageConfidence: Math.round(avgConfidence * 100),
      personalMemorySize: this.personalMemory.size,
      recentQueries: this.thinkingHistory.slice(-5).map((r) => r.query),
    }
  }
}
