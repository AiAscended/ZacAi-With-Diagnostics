// lib/modules/mathematics-module.ts
import type { IKnowledgeModule, MathEntry, MathResult } from "@/lib/types"
import { StorageManager } from "@/lib/storage-manager"

interface SeedMathsFile {
  concepts: MathEntry[]
}

export class MathematicsModule implements IKnowledgeModule {
  public name = "Mathematics"
  private storage = new StorageManager()
  private seedMath: Map<string, MathEntry> = new Map()
  private learnedMath: Map<string, MathEntry> = new Map()

  async initialize(): Promise<void> {
    const seedData = await this.storage.loadSeedData<SeedMathsFile>("seed_maths.json")
    if (seedData && Array.isArray(seedData.concepts)) {
      seedData.concepts.forEach((entry) => {
        this.seedMath.set(entry.concept.toLowerCase(), { ...entry, source: "seed" })
      })
    }

    // Load learned data (robustly)
    const learnedData = this.storage.loadLearnedData<any>("learnt_maths.json")
    if (learnedData) {
      const learnedArray = Array.isArray(learnedData) ? learnedData : Object.values(learnedData)
      learnedArray.forEach((entry: MathEntry) => {
        if (entry && entry.concept) {
          this.learnedMath.set(entry.concept.toLowerCase(), entry)
        }
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
      const sanitized = expression.replace(/[^0-9.+\-*/()\s.e]/gi, "")
      reasoning.push(`Sanitized expression: "${sanitized}"`)

      if (!sanitized) {
        throw new Error("Expression is empty after sanitization.")
      }

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
