export class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []

  constructor() {
    this.initializeMathPatterns()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      // Basic multiplication patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*times\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*multiplied\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /multiply\s*(\d+(?:\.\d+)?)\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:times|x|×|\*)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "multiply",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Addition patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*plus\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /add\s*(\d+(?:\.\d+)?)\s*(?:and|to)\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Subtraction patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*minus\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /subtract\s*(\d+(?:\.\d+)?)\s*from\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[2]), Number.parseFloat(match[1])], // Note: reversed order
      },

      // Division patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*divided\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /divide\s*(\d+(?:\.\d+)?)\s*by\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Power/Exponent patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "power",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*to\s*the\s*power\s*of\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "power",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Square root patterns
      {
        pattern: /(?:square\s*root\s*of\s*|sqrt\s*$$?\s*)(\d+(?:\.\d+)?)\s*$$?\s*=?\s*$/i,
        operation: "sqrt",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1])],
      },

      // Percentage patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "percentage",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*percent\s*of\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "percentage",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
    ]
  }

  public analyzeMathExpression(input: string): MathAnalysis {
    const cleanInput = input.trim().toLowerCase()
    const reasoning: string[] = []

    reasoning.push(`Analyzing input: "${input}"`)

    // Check each pattern
    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        reasoning.push(`Matched pattern for ${pattern.operation}`)

        try {
          const numbers = pattern.extract(match)
          reasoning.push(`Extracted numbers: ${numbers.join(", ")}`)

          const result = this.performOperation(pattern.operation, numbers)
          reasoning.push(`Calculated result: ${result}`)

          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            reasoning: reasoning,
          }
        } catch (error) {
          reasoning.push(`Error in calculation: ${error}`)
          return {
            isMatch: false,
            operation: pattern.operation,
            numbers: [],
            result: undefined,
            confidence: 0.3,
            reasoning: reasoning,
          }
        }
      }
    }

    // Check if it contains mathematical keywords but no match
    const mathKeywords = ["calculate", "math", "multiply", "times", "plus", "minus", "divide", "add", "subtract"]
    const containsMathKeywords = mathKeywords.some((keyword) => cleanInput.includes(keyword))

    if (containsMathKeywords || /\d/.test(cleanInput)) {
      reasoning.push("Contains mathematical keywords or numbers but no clear pattern match")
      return {
        isMatch: false,
        operation: "unknown",
        numbers: [],
        result: undefined,
        confidence: 0.4,
        reasoning: reasoning,
      }
    }

    reasoning.push("No mathematical content detected")
    return {
      isMatch: false,
      operation: "none",
      numbers: [],
      result: undefined,
      confidence: 0.0,
      reasoning: reasoning,
    }
  }

  private performOperation(operation: string, numbers: number[]): number {
    switch (operation) {
      case "add":
        return numbers[0] + numbers[1]
      case "subtract":
        return numbers[0] - numbers[1]
      case "multiply":
        return numbers[0] * numbers[1]
      case "divide":
        if (numbers[1] === 0) throw new Error("Cannot divide by zero")
        return numbers[0] / numbers[1]
      case "power":
        return Math.pow(numbers[0], numbers[1])
      case "sqrt":
        if (numbers[0] < 0) throw new Error("Cannot take square root of negative number")
        return Math.sqrt(numbers[0])
      case "percentage":
        return (numbers[0] / 100) * numbers[1]
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}

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
  result: number | undefined
  confidence: number
  reasoning: string[]
}
