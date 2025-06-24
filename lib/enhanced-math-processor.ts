export class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []
  private teslaMap: Map<number, any> = new Map()
  private vortexCycle = [1, 2, 4, 8, 7, 5, 1]
  private mirrorTables: Map<number, number[]> = new Map()

  constructor() {
    this.initializeMathPatterns()
    this.initializeTeslaMap()
    this.initializeMirrorTables()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      // Enhanced multiplication patterns with more variations
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
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:times|x|×|\*)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "multiply",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Enhanced addition patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:plus|\+)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "add",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Enhanced subtraction patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:minus|-)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "subtract",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Enhanced division patterns
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern:
          /what\s*(?:is|does)\s*(\d+(?:\.\d+)?)\s*(?:divided\s*by|÷|\/)\s*(\d+(?:\.\d+)?)\s*(?:equal|=)?\s*\??\s*$/i,
        operation: "divide",
        confidence: 0.85,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },

      // Tesla/Vortex math patterns
      {
        pattern: /vortex\s*math\s*(?:for\s*)?(\d+)/i,
        operation: "vortex",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1])],
      },
      {
        pattern: /tesla\s*(?:pattern|map)\s*(?:for\s*)?(\d+)/i,
        operation: "tesla",
        confidence: 0.9,
        extract: (match) => [Number.parseFloat(match[1])],
      },
      {
        pattern: /digital\s*root\s*(?:of\s*)?(\d+)/i,
        operation: "digital_root",
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
    ]
  }

  private initializeTeslaMap(): void {
    // Tesla's 3-6-9 pattern and vortex mathematics
    for (let i = 1; i <= 100; i++) {
      const digitalRoot = this.calculateDigitalRoot(i)
      const doubleDigitalRoot = this.calculateDigitalRoot(i * 2)

      this.teslaMap.set(i, {
        number: i,
        digitalRoot,
        doubleDigitalRoot,
        isVortexNumber: this.vortexCycle.includes(digitalRoot),
        isTeslaNumber: [3, 6, 9].includes(digitalRoot),
        vortexPosition: this.vortexCycle.indexOf(digitalRoot),
        teslaGroup:
          digitalRoot === 3
            ? "creator"
            : digitalRoot === 6
              ? "manifestation"
              : digitalRoot === 9
                ? "completion"
                : "vortex",
      })
    }
  }

  private initializeMirrorTables(): void {
    // Mirror times tables showing digital root patterns
    for (let i = 1; i <= 12; i++) {
      const mirrorRow: number[] = []
      for (let j = 1; j <= 12; j++) {
        const product = i * j
        const digitalRoot = this.calculateDigitalRoot(product)
        mirrorRow.push(digitalRoot)
      }
      this.mirrorTables.set(i, mirrorRow)
    }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
  }

  public analyzeMathExpression(input: string): MathAnalysis {
    const cleanInput = input.trim().toLowerCase()
    const reasoning: string[] = []

    reasoning.push(`🔍 Analyzing input: "${input}"`)

    // Check each pattern
    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        reasoning.push(`✅ Matched pattern for ${pattern.operation}`)

        try {
          const numbers = pattern.extract(match)
          reasoning.push(`📊 Extracted numbers: ${numbers.join(", ")}`)

          const result = this.performOperation(pattern.operation, numbers)
          reasoning.push(`🧮 Calculated result: ${result}`)

          // Add Tesla/Vortex analysis for applicable operations
          if (pattern.operation === "multiply" && numbers.length === 2) {
            const vortexAnalysis = this.analyzeVortexPattern(numbers[0], numbers[1], result as number)
            reasoning.push(`🌀 Vortex analysis: ${vortexAnalysis}`)
          }

          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            reasoning: reasoning,
            vortexData: pattern.operation === "multiply" ? this.getVortexData(result as number) : undefined,
            teslaData: pattern.operation === "tesla" ? this.getTeslaData(numbers[0]) : undefined,
          }
        } catch (error) {
          reasoning.push(`❌ Error in calculation: ${error}`)
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
    const mathKeywords = [
      "calculate",
      "math",
      "multiply",
      "times",
      "plus",
      "minus",
      "divide",
      "add",
      "subtract",
      "vortex",
      "tesla",
    ]
    const containsMathKeywords = mathKeywords.some((keyword) => cleanInput.includes(keyword))

    if (containsMathKeywords || /\d/.test(cleanInput)) {
      reasoning.push("🔍 Contains mathematical keywords or numbers but no clear pattern match")
      return {
        isMatch: false,
        operation: "unknown",
        numbers: [],
        result: undefined,
        confidence: 0.4,
        reasoning: reasoning,
      }
    }

    reasoning.push("❌ No mathematical content detected")
    return {
      isMatch: false,
      operation: "none",
      numbers: [],
      result: undefined,
      confidence: 0.0,
      reasoning: reasoning,
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
        if (numbers[1] === 0) throw new Error("Cannot divide by zero")
        return numbers[0] / numbers[1]
      case "power":
        return Math.pow(numbers[0], numbers[1])
      case "sqrt":
        if (numbers[0] < 0) throw new Error("Cannot take square root of negative number")
        return Math.sqrt(numbers[0])
      case "percentage":
        return (numbers[0] / 100) * numbers[1]
      case "vortex":
        return this.getVortexPattern(numbers[0])
      case "tesla":
        return this.getTeslaPattern(numbers[0])
      case "digital_root":
        return this.calculateDigitalRoot(numbers[0])
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  private analyzeVortexPattern(num1: number, num2: number, result: number): string {
    const root1 = this.calculateDigitalRoot(num1)
    const root2 = this.calculateDigitalRoot(num2)
    const rootResult = this.calculateDigitalRoot(result)

    return `${num1}(${root1}) × ${num2}(${root2}) = ${result}(${rootResult})`
  }

  private getVortexData(number: number): any {
    return (
      this.teslaMap.get(number) || {
        number,
        digitalRoot: this.calculateDigitalRoot(number),
        isVortexNumber: false,
        isTeslaNumber: false,
      }
    )
  }

  private getTeslaData(number: number): any {
    return this.teslaMap.get(number)
  }

  private getVortexPattern(number: number): string {
    const data = this.getVortexData(number)
    return `Number ${number}: Digital Root ${data.digitalRoot}, ${data.isTeslaNumber ? "Tesla Number" : data.isVortexNumber ? "Vortex Number" : "Regular Number"}`
  }

  private getTeslaPattern(number: number): string {
    const data = this.getTeslaData(number)
    return `Tesla Pattern for ${number}: ${data.teslaGroup} (Digital Root: ${data.digitalRoot})`
  }

  public getMirrorTable(number: number): number[] {
    return this.mirrorTables.get(number) || []
  }

  public getFullVortexAnalysis(number: number): any {
    const data = this.getVortexData(number)
    const mirrorRow = this.getMirrorTable(number)

    return {
      ...data,
      mirrorTimesTable: mirrorRow,
      vortexCyclePosition: this.vortexCycle.indexOf(data.digitalRoot),
      explanation: this.explainVortexMath(data),
    }
  }

  private explainVortexMath(data: any): string {
    if (data.isTeslaNumber) {
      return `${data.number} reduces to ${data.digitalRoot}, which is part of Tesla's 3-6-9 pattern representing ${data.teslaGroup}.`
    } else if (data.isVortexNumber) {
      return `${data.number} reduces to ${data.digitalRoot}, which is part of the vortex cycle [1,2,4,8,7,5] at position ${data.vortexPosition}.`
    } else {
      return `${data.number} reduces to ${data.digitalRoot}, which is outside the main vortex patterns.`
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
  result: number | string | undefined
  confidence: number
  reasoning: string[]
  vortexData?: any
  teslaData?: any
}
