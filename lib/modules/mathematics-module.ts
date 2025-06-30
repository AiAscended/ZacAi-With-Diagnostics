// lib/modules/mathematics-module.ts
import type { IKnowledgeModule, MathEntry } from "@/lib/types"
import { StorageManager } from "@/lib/storage-manager"

interface MathResult {
  answer: string
  confidence: number
  reasoning: string[]
}

export class MathematicsModule implements IKnowledgeModule {
  public name = "Mathematics"
  private storage = new StorageManager()
  private seedMath: Map<string, MathEntry> = new Map()
  private learnedMath: Map<string, MathEntry> = new Map()

  async initialize(): Promise<void> {
    const seedData = await this.storage.loadSeedData<MathEntry[]>("seed_maths.json")
    if (seedData) {
      seedData.forEach((entry) => {
        this.seedMath.set(entry.concept.toLowerCase(), { ...entry, source: "seed" })
      })
    }

    const learnedData = this.storage.loadLearnedData<MathEntry[]>("learnt_maths.json")
    if (learnedData) {
      learnedData.forEach((entry) => {
        this.learnedMath.set(entry.concept.toLowerCase(), entry)
      })
    }
    console.log(
      `🧮 Mathematics Module initialized with ${this.seedMath.size} seed concepts and ${this.learnedMath.size} learned concepts.`,
    )
  }

  getKnowledge(): Map<string, MathEntry> {
    return new Map([...this.seedMath, ...this.learnedMath])
  }

  async findTerm(term: string): Promise<MathEntry | null> {
    const lowerTerm = term.toLowerCase()
    return this.getKnowledge().get(lowerTerm) ?? null
  }

  private getDigitalRoot(n: number): number {
    let root = n
    while (root > 9) {
      root = String(root)
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0)
    }
    return root
  }

  public evaluateExpression(expression: string): MathResult {
    const reasoning: string[] = []
    try {
      // Sanitize expression: allow numbers, operators, parentheses, and spaces
      const sanitized = expression.replace(/[^0-9.+\-*/()\s]/g, "")
      reasoning.push(`Sanitized expression: "${sanitized}"`)

      // A safer alternative to eval() for simple arithmetic
      const result = new Function(`return ${sanitized}`)()
      reasoning.push(`Calculated result: ${result}`)

      const digitalRoot = this.getDigitalRoot(result)
      reasoning.push(`Vortex/Tesla analysis: Digital root is ${digitalRoot}.`)

      return {
        answer: `The result is **${result}**. The digital root (Tesla/Vortex) is **${digitalRoot}**.`,
        confidence: 0.98,
        reasoning,
      }
    } catch (error) {
      reasoning.push(`Error during calculation: ${error instanceof Error ? error.message : "Unknown error"}`)
      return {
        answer: "I'm sorry, I couldn't calculate that. Please use standard mathematical notation.",
        confidence: 0.2,
        reasoning,
      }
    }
  }
}
