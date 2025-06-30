// lib/enhanced-math-processor.ts

interface MathPattern {
  pattern: RegExp
  operation: string
  confidence: number
  extract: (match: RegExpMatchArray) => number[]
}

interface MathAnalysis {
  isMatch: boolean
  operation: string
  numbers: number[]
  result: number | string | undefined
  confidence: number
  reasoning: string[]
  vortexData?: any
  teslaData?: any
}

export class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []

  constructor() {
    this.initializeMathPatterns()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
    ]
  }

  public analyzeMathExpression(input: string): MathAnalysis {
    const cleanInput = input.trim().toLowerCase()
    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        try {
          const numbers = pattern.extract(match)
          const result = this.performOperation(pattern.operation, numbers)
          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            reasoning: [`Matched pattern for ${pattern.operation}`],
          }
        } catch (error) {
          return {
            isMatch: false,
            operation: pattern.operation,
            numbers: [],
            result: undefined,
            confidence: 0.3,
            reasoning: [`Error in calculation: ${error}`],
          }
        }
      }
    }
    return {
      isMatch: false,
      operation: "none",
      numbers: [],
      result: undefined,
      confidence: 0.0,
      reasoning: ["No mathematical pattern detected"],
    }
  }

  private performOperation(operation: string, numbers: number[]): number | string {
    switch (operation) {
      case "add":
        return numbers[0] + numbers[1]
      case "subtract":
        return numbers[0] - numbers[1]
      case "multiply":
        return numbers[0] * numbers[1]
      case "divide":
        if (numbers[1] === 0) return "Cannot divide by zero"
        return numbers[0] / numbers[1]
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
