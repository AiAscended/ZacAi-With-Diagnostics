// lib/modules/mathematics-module.ts
import type { IKnowledgeModule, KnowledgeEntry, QueryResult } from "@/lib/types"
import StorageManager from "@/lib/storage-manager"

export class MathematicsModule implements IKnowledgeModule {
  public name = "Mathematics"
  private knowledge = new Map<string, KnowledgeEntry>()
  private storageManager = new StorageManager()

  async initialize(): Promise<void> {
    const seedData = await this.storageManager.loadJSON("/seed_maths.json")
    const rawLearnedData = this.storageManager.loadData("learnt_mathematics")

    const concepts = seedData?.concepts || []
    if (Array.isArray(concepts)) {
      concepts.forEach((item: any) => {
        this.knowledge.set(item.concept, { ...item, source: "seed" })
      })
    }

    const learnedData = Array.isArray(rawLearnedData) ? rawLearnedData : rawLearnedData?.concepts || []
    if (Array.isArray(learnedData)) {
      learnedData.forEach((item: any) => {
        this.knowledge.set(item.concept, { ...item, source: "learned" })
      })
    }
  }

  getKnowledge(): Map<string, KnowledgeEntry> {
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

  private evaluateExpression(expression: string): number | string {
    try {
      // Basic safety check
      if (/[^0-9+\-*/().\s]/.test(expression)) {
        throw new Error("Invalid characters in expression")
      }
      // eslint-disable-next-line no-eval
      const result = eval(expression)
      return result
    } catch (error) {
      return "Error: Invalid mathematical expression."
    }
  }

  async query(input: string): Promise<QueryResult | null> {
    const reasoning: string[] = []
    reasoning.push(`[Math] Analyzing input: "${input}"`)

    const calculationRegex = /^(calculate|what is|compute)\s+(.*)/i
    const calculationMatch = input.match(calculationRegex)

    if (calculationMatch) {
      const expression = calculationMatch[2].trim()
      reasoning.push(`[Math] Identified calculation task for expression: "${expression}"`)
      const result = this.evaluateExpression(expression)
      reasoning.push(`[Math] Evaluated expression, result: ${result}`)

      if (typeof result === "number") {
        const digitalRoot = this.calculateDigitalRoot(result)
        reasoning.push(`[Math] Calculated digital root (Tesla/Vortex Math): ${digitalRoot}`)
        const answer = `The result of ${expression} is **${result}**. The digital root of this number is **${digitalRoot}**.`
        return { answer, confidence: 0.98, reasoning }
      } else {
        return { answer: result, confidence: 0.9, reasoning }
      }
    }

    const concept = this.knowledge.get(input.toLowerCase())
    if (concept) {
      reasoning.push(`[Math] Found matching concept in knowledge base: "${input}"`)
      return {
        answer: concept.explanation as string,
        confidence: 0.95,
        reasoning,
      }
    }

    reasoning.push("[Math] No specific math task or concept found.")
    return null
  }
}
