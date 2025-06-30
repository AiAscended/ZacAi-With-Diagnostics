import type { IKnowledgeModule, MathConcept, MathEvaluationResult } from "../types"
import { StorageManager } from "../storage-manager"

interface SeedMathsFile {
  concepts: MathConcept[]
}

export class MathematicsModule implements IKnowledgeModule {
  public name = "Mathematics"
  private knowledge: Map<string, MathConcept> = new Map()
  private storage = new StorageManager()

  async initialize(): Promise<void> {
    console.log("Initializing Mathematics Module...")
    const seedData = await this.storage.loadSeedData<SeedMathsFile>("seed_maths.json")
    if (seedData && seedData.concepts) {
      seedData.concepts.forEach((concept) => {
        this.knowledge.set(concept.name.toLowerCase(), concept)
      })
    }
    console.log(`Mathematics Module initialized with ${this.knowledge.size} concepts.`)
  }

  getKnowledge(): Map<string, any> {
    return this.knowledge
  }

  private calculateDigitalRoot(n: number): number {
    let sum = n
    while (sum > 9) {
      sum = String(sum)
        .split("")
        .reduce((acc, digit) => acc + Number.parseInt(digit, 10), 0)
    }
    return sum
  }

  public evaluateExpression(expression: string): MathEvaluationResult {
    const reasoning: string[] = [`Evaluating expression: "${expression}"`]
    try {
      // Sanitize expression: allow numbers, basic operators, parentheses, and spaces.
      const sanitizedExpression = expression.replace(/[^0-9.+\-*/()\s]/g, "")
      if (sanitizedExpression !== expression) {
        reasoning.push("Sanitized expression for safety.")
      }

      // Use Function constructor for safe evaluation in this sandboxed environment.
      // In a real-world app, a proper math parser (like math.js) is safer.
      const result = new Function(`return ${sanitizedExpression}`)()

      if (typeof result !== "number") {
        throw new Error("Evaluation did not result in a number.")
      }

      reasoning.push(`Standard calculation result: ${result}`)
      const digitalRoot = this.calculateDigitalRoot(result)
      reasoning.push(`Vortex math analysis (digital root): ${digitalRoot}`)

      return {
        answer: `The result is **${result}**. The digital root (Vortex) is **${digitalRoot}**.`,
        confidence: 0.98,
        reasoning,
      }
    } catch (error) {
      reasoning.push(`Error during evaluation: ${error instanceof Error ? error.message : "Unknown error"}`)
      return {
        answer: "I couldn't solve that mathematical expression. Please check the format.",
        confidence: 0.2,
        reasoning,
      }
    }
  }
}
