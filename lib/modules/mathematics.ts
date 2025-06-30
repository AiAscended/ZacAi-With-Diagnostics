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

    // Tesla/Vortex Math
    const teslaMatch = message.match(/(?:tesla|vortex|digital root).+?(\d+)/)
    if (teslaMatch && teslaMatch[1]) {
      const num = Number.parseInt(teslaMatch[1], 10)
      thinkingSteps.push(`🌀 Matched Tesla/Vortex pattern. Performing digital root analysis for: ${num}`)
      let current = num
      const steps = [num]
      while (current > 9) {
        const sum = String(current)
          .split("")
          .reduce((s, digit) => s + Number.parseInt(digit, 10), 0)
        steps.push(sum)
        current = sum
      }
      responseText = `The digital root (Tesla pattern) for ${num} is ${current}. The sequence is: ${steps.join(" -> ")}.`
      knowledge = ["Vortex Math", "Digital Root"]
      mathAnalysis = { operation: "Digital Root", input: num, result: current, confidence: 1.0, seedDataUsed: true }
      confidence = 1.0
      thinkingSteps.push(`✅ Digital root found: ${current}.`)
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    // Simple calculation
    const calcMatch = message.match(/(?:calculate|what is)\s*([0-9\s.+\-*/x×÷^()]+)/)
    if (calcMatch && calcMatch[1]) {
      let expression = calcMatch[1].trim()
      thinkingSteps.push(`🔍 Matched simple calculation pattern. Evaluating expression: "${expression}"`)
      expression = expression.replace(/[x×]/g, "*").replace(/÷/g, "/")
      try {
        const result = new Function(`return ${expression}`)()
        responseText = `The result of ${expression} is ${result}.`
        knowledge = ["Simple Calculation"]
        mathAnalysis = { operation: "Evaluation", expression, result, confidence: 1.0, seedDataUsed: false }
        confidence = 1.0
        thinkingSteps.push(`✅ Calculation successful. Result: ${result}.`)
      } catch (e) {
        responseText = `I couldn't evaluate the expression "${expression}". It seems to be invalid.`
        thinkingSteps.push(`❌ Calculation failed for expression: "${expression}".`)
        confidence = 0.2
      }
      return { responseText, knowledge, mathAnalysis, confidence }
    }

    thinkingSteps.push("⚠️ No specific math operation matched. Exiting Math Processor.")
    return { responseText, knowledge, mathAnalysis, confidence }
  }

  public getMathData(): Map<string, any> {
    return this.mathematics
  }
}
