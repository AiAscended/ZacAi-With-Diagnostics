// lib/modules/mathematics-module.ts
import type { IKnowledgeModule, MathEntry, MathResponse } from "@/lib/types"
import { StorageManager } from "@/lib/storage-manager"

interface SeedMathsFile {
  concepts: MathEntry[]
}

export class MathematicsModule implements IKnowledgeModule {
  public name = "Mathematics"
  private storage = new StorageManager()
  private knowledge: Map<string, MathEntry> = new Map()

  async initialize(): Promise<void> {
    const seedData = await this.storage.loadJSON<SeedMathsFile>("/seed_maths.json")
    if (seedData && Array.isArray(seedData.concepts)) {
      seedData.concepts.forEach((entry) => {
        this.knowledge.set(entry.concept.toLowerCase(), { ...entry, source: "seed" })
      })
    }

    const learnedData = this.storage.loadData<MathEntry[]>("learnt_maths.json")
    if (Array.isArray(learnedData)) {
      learnedData.forEach((entry) => {
        if (entry && entry.concept) {
          this.knowledge.set(entry.concept.toLowerCase(), entry)
        }
      })
    }
    console.log(`🧮 Mathematics Module initialized with ${this.knowledge.size} total concepts.`)
  }

  getKnowledge(): Map<string, MathEntry> {
    return this.knowledge
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

  public evaluateExpression(expression: string): MathResponse {
    const reasoning: string[] = []
    try {
      const sanitized = expression.replace(/^(calculate|compute|solve|what is|what's)\s*/i, "").replace(/[?]/g, "")
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
