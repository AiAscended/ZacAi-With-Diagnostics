import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { userMemory } from "@/core/memory/user-memory"

interface MathConcept {
  name: string
  description: string
  formula?: string
  examples: Array<{
    problem: string
    solution: string
    explanation: string
  }>
  difficulty: number
  category: string
  timestamp: number
}

export class MathematicsModule implements ModuleInterface {
  name = "mathematics"
  version = "3.0.0"
  initialized = false

  private seedData: any = null
  private learntData: any = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🔢 Initializing Enhanced Mathematics Module...")

    try {
      await storageManager.initialize()
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Enhanced Mathematics Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Mathematics Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      const response = await fetch("/seed_maths.json")
      if (!response.ok) throw new Error("Failed to load seed maths data")
      return await response.json()
    } catch (error) {
      console.warn("Using fallback maths data")
      return this.getFallbackMathsData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("mathematics")
    } catch (error) {
      console.warn("No learnt maths data found, starting fresh")
      return { entries: {} }
    }
  }

  private getFallbackMathsData(): any {
    return {
      metadata: {
        version: "1.0.0",
        totalEntries: 12,
        source: "fallback-maths",
      },
      concepts: {
        basic_arithmetic: {
          name: "Basic Arithmetic",
          description:
            "Fundamental mathematical operations including addition, subtraction, multiplication, and division",
          formula: "a ○ b = c (where ○ is +, -, ×, ÷)",
          examples: [
            {
              problem: "2 + 3",
              solution: "5",
              explanation: "Adding 2 and 3 gives us 5",
            },
            {
              problem: "10 - 4",
              solution: "6",
              explanation: "Subtracting 4 from 10 gives us 6",
            },
            {
              problem: "5 × 3",
              solution: "15",
              explanation: "Multiplying 5 by 3 gives us 15",
            },
            {
              problem: "12 ÷ 4",
              solution: "3",
              explanation: "Dividing 12 by 4 gives us 3",
            },
          ],
          difficulty: 1,
          category: "arithmetic",
        },
        order_of_operations: {
          name: "Order of Operations (PEMDAS/BODMAS)",
          description: "The sequence in which mathematical operations should be performed",
          formula: "Parentheses/Brackets → Exponents/Orders → Multiplication/Division → Addition/Subtraction",
          examples: [
            {
              problem: "2 + 3 × 4",
              solution: "14",
              explanation: "First multiply 3 × 4 = 12, then add 2 + 12 = 14",
            },
            {
              problem: "(2 + 3) × 4",
              solution: "20",
              explanation: "First solve parentheses 2 + 3 = 5, then multiply 5 × 4 = 20",
            },
            {
              problem: "2³ + 4 × 3",
              solution: "20",
              explanation: "First exponent 2³ = 8, then multiply 4 × 3 = 12, finally add 8 + 12 = 20",
            },
          ],
          difficulty: 2,
          category: "arithmetic",
        },
        fractions: {
          name: "Fractions",
          description: "Numbers that represent parts of a whole, expressed as a/b where b ≠ 0",
          formula: "a/b (where a is numerator, b is denominator)",
          examples: [
            {
              problem: "1/2 + 1/4",
              solution: "3/4",
              explanation: "Convert to common denominator: 2/4 + 1/4 = 3/4",
            },
            {
              problem: "2/3 × 3/4",
              solution: "1/2",
              explanation: "Multiply numerators and denominators: (2×3)/(3×4) = 6/12 = 1/2",
            },
          ],
          difficulty: 3,
          category: "arithmetic",
        },
        percentages: {
          name: "Percentages",
          description: "A way of expressing a number as a fraction of 100",
          formula: "percentage = (part/whole) × 100%",
          examples: [
            {
              problem: "What is 25% of 80?",
              solution: "20",
              explanation: "25% = 25/100 = 0.25, so 0.25 × 80 = 20",
            },
            {
              problem: "15 is what percentage of 60?",
              solution: "25%",
              explanation: "(15/60) × 100% = 0.25 × 100% = 25%",
            },
          ],
          difficulty: 3,
          category: "arithmetic",
        },
        algebra_basics: {
          name: "Basic Algebra",
          description: "Using letters and symbols to represent numbers and quantities in formulas and equations",
          formula: "ax + b = c (solve for x)",
          examples: [
            {
              problem: "2x + 5 = 13",
              solution: "x = 4",
              explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
            },
            {
              problem: "3x - 7 = 14",
              solution: "x = 7",
              explanation: "Add 7 to both sides: 3x = 21, then divide by 3: x = 7",
            },
          ],
          difficulty: 4,
          category: "algebra",
        },
        quadratic_equations: {
          name: "Quadratic Equations",
          description: "Polynomial equations of degree 2, typically in the form ax² + bx + c = 0",
          formula: "x = (-b ± √(b² - 4ac)) / 2a",
          examples: [
            {
              problem: "x² - 5x + 6 = 0",
              solution: "x = 2 or x = 3",
              explanation: "Factor: (x-2)(x-3) = 0, so x = 2 or x = 3",
            },
            {
              problem: "x² + 4x + 4 = 0",
              solution: "x = -2",
              explanation: "Perfect square: (x+2)² = 0, so x = -2",
            },
          ],
          difficulty: 5,
          category: "algebra",
        },
        geometry_basics: {
          name: "Basic Geometry",
          description: "Study of shapes, sizes, positions, angles, and dimensions",
          examples: [
            {
              problem: "Area of rectangle with length 8 and width 5",
              solution: "40",
              explanation: "Area = length × width = 8 × 5 = 40 square units",
            },
            {
              problem: "Circumference of circle with radius 3",
              solution: "18.85 (6π)",
              explanation: "Circumference = 2πr = 2 × π × 3 = 6π ≈ 18.85",
            },
          ],
          difficulty: 3,
          category: "geometry",
        },
        trigonometry: {
          name: "Trigonometry",
          description: "Study of triangles and the relationships between their angles and sides",
          formula: "sin²θ + cos²θ = 1",
          examples: [
            {
              problem: "sin(30°)",
              solution: "0.5",
              explanation: "The sine of 30 degrees is 1/2 or 0.5",
            },
            {
              problem: "cos(60°)",
              solution: "0.5",
              explanation: "The cosine of 60 degrees is 1/2 or 0.5",
            },
          ],
          difficulty: 5,
          category: "trigonometry",
        },
        calculus_basics: {
          name: "Basic Calculus",
          description: "Mathematical study of continuous change, including derivatives and integrals",
          formula: "d/dx(x^n) = nx^(n-1)",
          examples: [
            {
              problem: "Derivative of x²",
              solution: "2x",
              explanation: "Using power rule: d/dx(x²) = 2x^(2-1) = 2x",
            },
            {
              problem: "Integral of 2x",
              solution: "x² + C",
              explanation: "∫2x dx = x² + C (where C is the constant of integration)",
            },
          ],
          difficulty: 6,
          category: "calculus",
        },
        statistics: {
          name: "Statistics",
          description: "Collection, analysis, interpretation, and presentation of data",
          examples: [
            {
              problem: "Mean of [2, 4, 6, 8, 10]",
              solution: "6",
              explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6",
            },
            {
              problem: "Median of [1, 3, 5, 7, 9]",
              solution: "5",
              explanation: "The middle value in the ordered set is 5",
            },
          ],
          difficulty: 4,
          category: "statistics",
        },
        probability: {
          name: "Probability",
          description: "The likelihood of an event occurring, expressed as a number between 0 and 1",
          formula: "P(event) = favorable outcomes / total outcomes",
          examples: [
            {
              problem: "Probability of rolling a 6 on a fair die",
              solution: "1/6 ≈ 0.167",
              explanation: "1 favorable outcome out of 6 possible outcomes",
            },
            {
              problem: "Probability of flipping heads on a fair coin",
              solution: "1/2 = 0.5",
              explanation: "1 favorable outcome out of 2 possible outcomes",
            },
          ],
          difficulty: 4,
          category: "probability",
        },
        number_theory: {
          name: "Number Theory",
          description: "Study of integers and their properties, including prime numbers and divisibility",
          examples: [
            {
              problem: "Is 17 a prime number?",
              solution: "Yes",
              explanation: "17 is only divisible by 1 and itself, making it prime",
            },
            {
              problem: "Greatest Common Divisor of 12 and 18",
              solution: "6",
              explanation: "The largest number that divides both 12 and 18 is 6",
            },
          ],
          difficulty: 4,
          category: "number_theory",
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const userName = userMemory.retrieve("name")?.value
      const mathQueries = this.extractMathQueries(input)

      if (mathQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of mathQueries) {
        const result = await this.processMathQuery(query, context)
        if (result) {
          results.push(result)
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildMathResponse(results, userName)
      const confidence = this.calculateConfidence(results)

      await this.learn({ input, results, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: mathQueries.length,
          resultsFound: results.length,
        },
      }
    } catch (error) {
      console.error("Error in Mathematics Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private extractMathQueries(input: string): string[] {
    const queries: string[] = []

    // Look for arithmetic expressions
    const arithmeticMatch = input.match(/[\d+\-*/()=\s]+/g)
    if (arithmeticMatch) {
      arithmeticMatch.forEach((match) => {
        const cleaned = match.trim()
        if (cleaned && /[\d+\-*/()]/.test(cleaned)) {
          queries.push(cleaned)
        }
      })
    }

    // Look for word problems
    const wordProblemPatterns = [/calculate\s+([^.!?]+)/gi, /solve\s+([^.!?]+)/gi, /what\s+is\s+([\d+\-*/().\s]+)/gi]

    wordProblemPatterns.forEach((pattern) => {
      const matches = input.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          queries.push(match.trim())
        })
      }
    })

    return [...new Set(queries)]
  }

  private async processMathQuery(query: string, context?: any): Promise<any> {
    // Try to solve arithmetic expressions
    const arithmeticResult = this.solveArithmetic(query)
    if (arithmeticResult) {
      return {
        query,
        type: "arithmetic",
        result: arithmeticResult,
        confidence: 0.95,
      }
    }

    // Check seed concepts
    const conceptResult = this.searchSeedConcepts(query)
    if (conceptResult) {
      return {
        query,
        type: "concept",
        result: conceptResult,
        confidence: 0.9,
      }
    }

    // Check learnt concepts
    const learntResult = this.searchLearntConcepts(query)
    if (learntResult) {
      return {
        query,
        type: "learnt",
        result: learntResult,
        confidence: 0.85,
      }
    }

    return null
  }

  private solveArithmetic(expression: string): any {
    try {
      // Clean the expression
      const cleaned = expression.replace(/[^0-9+\-*/().\s]/g, "").trim()
      if (!cleaned) return null

      // Basic safety check
      if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) return null

      // Evaluate using order of operations
      const result = this.evaluateExpression(cleaned)
      if (result !== null && !isNaN(result)) {
        return {
          expression: cleaned,
          result: result,
          explanation: this.explainCalculation(cleaned, result),
          steps: this.getCalculationSteps(cleaned),
        }
      }
    } catch (error) {
      console.error("Error solving arithmetic:", error)
    }
    return null
  }

  private evaluateExpression(expr: string): number | null {
    try {
      // Replace common symbols
      const normalized = expr.replace(/×/g, "*").replace(/÷/g, "/")

      // Use Function constructor for safe evaluation (better than eval)
      const result = new Function(`"use strict"; return (${normalized})`)()
      return typeof result === "number" ? result : null
    } catch (error) {
      return null
    }
  }

  private explainCalculation(expression: string, result: number): string {
    if (expression.includes("*") && expression.includes("+")) {
      return `Following order of operations (PEMDAS), multiplication is performed before addition`
    }
    if (expression.includes("(")) {
      return `Parentheses are evaluated first, then other operations follow order of operations`
    }
    return `Basic arithmetic calculation`
  }

  private getCalculationSteps(expression: string): string[] {
    const steps: string[] = []
    steps.push(`Original expression: ${expression}`)

    // Simple step tracking for basic expressions
    if (expression.includes("*") || expression.includes("/")) {
      steps.push("Perform multiplication/division first")
    }
    if (expression.includes("+") || expression.includes("-")) {
      steps.push("Then perform addition/subtraction")
    }

    return steps
  }

  private searchSeedConcepts(query: string): MathConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    const lowerQuery = query.toLowerCase()

    for (const [key, concept] of Object.entries(this.seedData.concepts)) {
      const conceptData = concept as any
      if (
        conceptData.name.toLowerCase().includes(lowerQuery) ||
        conceptData.description.toLowerCase().includes(lowerQuery) ||
        conceptData.category?.toLowerCase().includes(lowerQuery)
      ) {
        return {
          name: conceptData.name,
          description: conceptData.description,
          formula: conceptData.formula,
          examples: conceptData.examples || [],
          difficulty: conceptData.difficulty || 1,
          category: conceptData.category || "general",
          timestamp: Date.now(),
        }
      }
    }

    return null
  }

  private searchLearntConcepts(query: string): MathConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.name) {
        const lowerQuery = query.toLowerCase()
        if (
          entryData.content.name.toLowerCase().includes(lowerQuery) ||
          entryData.content.description?.toLowerCase().includes(lowerQuery)
        ) {
          return entryData.content
        }
      }
    }

    return null
  }

  private buildMathResponse(results: any[], userName?: string): string {
    let response = ""

    if (userName) {
      response += `Hi ${userName}! Here's the mathematical solution:\n\n`
    }

    results.forEach((result, index) => {
      if (index > 0) response += "\n\n"

      if (result.type === "arithmetic") {
        response += `**${result.result.expression} = ${result.result.result}**\n\n`
        response += `**Explanation:** ${result.result.explanation}\n`

        if (result.result.steps && result.result.steps.length > 1) {
          response += `\n**Steps:**\n`
          result.result.steps.forEach((step: string, i: number) => {
            response += `${i + 1}. ${step}\n`
          })
        }
      } else if (result.type === "concept" || result.type === "learnt") {
        const concept = result.result
        response += `**${concept.name}**\n\n`
        response += `${concept.description}\n`

        if (concept.formula) {
          response += `\n**Formula:** ${concept.formula}\n`
        }

        if (concept.examples && concept.examples.length > 0) {
          response += `\n**Examples:**\n`
          concept.examples.slice(0, 2).forEach((example: any, i: number) => {
            response += `${i + 1}. ${example.problem} = ${example.solution}\n`
            response += `   ${example.explanation}\n`
          })
        }

        response += `\n*Difficulty: ${concept.difficulty}/6 | Category: ${concept.category}*`
      }
    })

    return response
  }

  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      totalConfidence += result.confidence
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    this.stats.lastUpdate = Date.now()

    if (data.input && data.results.length > 0) {
      const calculations = data.results.map((r: any) => r.query).join(", ")
      userMemory.store(`math_learned_${Date.now()}`, `Solved: ${calculations}`, "learning", 0.6, data.input)
    }
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }

  getSeedConcepts(): any {
    return this.seedData?.concepts || {}
  }

  getLearntConcepts(): any {
    return this.learntData?.entries || {}
  }
}

export const mathematicsModule = new MathematicsModule()
