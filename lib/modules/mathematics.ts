export class MathematicsModule {
  private mathematics: Map<string, any> = new Map()
  public isInitialized = false

  constructor() {
    console.log("🧮 Mathematics Module initialized.")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    await this.loadSeedMath()
    this.isInitialized = true
  }

  private async loadSeedMath(): Promise<void> {
    try {
      const response = await fetch("/seed_maths.json")
      if (!response.ok) throw new Error(`Failed to fetch seed_maths.json: ${response.statusText}`)
      const data = await response.json()
      Object.entries(data).forEach(([concept, entry]: [string, any]) => {
        this.mathematics.set(concept, { concept, data: entry, source: "seed" })
      })
      console.log(`✅ [Math] Loaded ${Object.keys(data).length} seed concepts.`)
    } catch (error) {
      console.warn("[Math] Failed to load seed math:", error)
    }
  }

  public handleCalculation(
    message: string,
    thinkingSteps: string[],
  ): { responseText: string; knowledge: string[]; mathAnalysis: any; confidence: number } {
    thinkingSteps.push("🧮 Entering Math Processor.")
    let responseText = "I couldn't solve that math problem."
    let knowledge: string[] = []
    let mathAnalysis: any = { operation: "Unknown", confidence: 0 }
    let confidence = 0.4

    const teslaMatch = message.match(/(?:tesla|vortex|digital root).+?(\d+)/i)
    if (teslaMatch && teslaMatch[1]) {
      const num = Number.parseInt(teslaMatch[1], 10)
      thinkingSteps.push(`🌀 Matched Tesla/Vortex pattern. Performing digital root analysis for: ${num}`)
      let current = num
      while (current > 9) {
        current = String(current)
          .split("")
          .reduce((s, digit) => s + Number.parseInt(digit, 10), 0)
      }
      responseText = `The digital root (Tesla pattern) for ${num} is ${current}.`
      knowledge = ["Vortex Math", "Digital Root"]
      mathAnalysis = { operation: "Digital Root", input: num, result: current, confidence: 1.0, seedDataUsed: true }
      confidence = 1.0
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    const calcMatch = message.match(/(?:calculate|what is|what's)\s*([0-9\s.+\-*/x×÷^()]+)/i)
    if (calcMatch && calcMatch[1]) {
      const expression = calcMatch[1].trim().replace(/[x×]/g, "*").replace(/÷/g, "/")
      thinkingSteps.push(`🔍 Matched simple calculation pattern. Evaluating expression: "${expression}"`)
      try {
        // Using a safer evaluation method
        const result = Function(`'use strict'; return (${expression})`)()
        responseText = `The result of ${expression} is ${result}.`
        knowledge = ["Simple Calculation"]
        mathAnalysis = { operation: "Evaluation", expression, result, confidence: 1.0, seedDataUsed: false }
        confidence = 1.0
      } catch (e) {
        responseText = `I couldn't evaluate the expression "${expression}". It seems to be invalid.`
        confidence = 0.2
      }
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    return { responseText, knowledge, mathAnalysis, confidence }
  }

  public getMathData(): Map<string, any> {
    return this.mathematics
  }
}
