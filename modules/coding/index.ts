import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { NextJSDocsClient } from "./nextjs-docs"

export class CodingModule implements ModuleInterface {
  name = "coding"
  version = "2.0.0"
  initialized = false

  private seedData: any = null
  private learntData: any = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Coding Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.coding.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.coding.learntFile)

      this.initialized = true
      console.log("Coding Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Coding Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const codingQueries = this.extractCodingQueries(input)

      if (codingQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of codingQueries) {
        const result = await this.processCodingQuery(query)
        if (result) {
          results.push(result)
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildCodingResponse(results)
      const confidence = this.calculateCodingConfidence(results)

      await this.learn({
        input,
        results,
        context,
        timestamp: Date.now(),
      })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: codingQueries.length,
          resultsFound: results.length,
        },
      }
    } catch (error) {
      console.error("Error in Coding Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private extractCodingQueries(input: string): string[] {
    const queries: string[] = []

    // Next.js specific queries
    if (input.match(/next\.?js|app router|server component|client component/i)) {
      queries.push("nextjs")
    }

    // React queries
    if (input.match(/react|jsx|tsx|component|hook/i)) {
      queries.push("react")
    }

    // System file queries
    if (input.match(/layout\.tsx|page\.tsx|components\/ui/i)) {
      queries.push("system_files")
    }

    // General coding queries
    if (input.match(/how to|code|function|debug|error/i)) {
      queries.push("general_coding")
    }

    return queries
  }

  private async processCodingQuery(query: string): Promise<any> {
    switch (query) {
      case "nextjs":
        return await this.processNextJSQuery()
      case "react":
        return await this.processReactQuery()
      case "system_files":
        return await this.processSystemFilesQuery()
      case "general_coding":
        return await this.processGeneralCodingQuery()
      default:
        return null
    }
  }

  private async processNextJSQuery(): Promise<any> {
    const nextjsKnowledge = await NextJSDocsClient.lookupNextJSConcept("app router")

    return {
      type: "nextjs_knowledge",
      data: nextjsKnowledge,
      source: "nextjs_docs",
    }
  }

  private async processReactQuery(): Promise<any> {
    return {
      type: "react_knowledge",
      data: {
        description: "React library for building user interfaces",
        concepts: ["Components", "Props", "State", "Hooks", "JSX"],
        hooks: ["useState", "useEffect", "useContext", "useReducer"],
      },
      source: "react_docs",
    }
  }

  private async processSystemFilesQuery(): Promise<any> {
    const systemKnowledge = {
      "app/layout.tsx": NextJSDocsClient.getSystemFileKnowledge("app/layout.tsx"),
      "app/page.tsx": NextJSDocsClient.getSystemFileKnowledge("app/page.tsx"),
      "components/ui/*": NextJSDocsClient.getSystemFileKnowledge("components/ui/*"),
      "modules/*/index.ts": NextJSDocsClient.getSystemFileKnowledge("modules/*/index.ts"),
    }

    return {
      type: "system_knowledge",
      data: systemKnowledge,
      source: "system_analysis",
    }
  }

  private async processGeneralCodingQuery(): Promise<any> {
    return {
      type: "general_coding",
      data: {
        bestPractices: [
          "Use TypeScript for type safety",
          "Follow component composition patterns",
          "Implement proper error boundaries",
          "Use proper naming conventions",
        ],
        debugging: ["Check console for errors", "Use React DevTools", "Verify prop types and data flow"],
      },
      source: "coding_best_practices",
    }
  }

  private buildCodingResponse(results: any[]): string {
    let response = "## Coding Knowledge\n\n"

    for (const result of results) {
      if (result.type === "nextjs_knowledge") {
        response += `**Next.js App Router:**\n${result.data.description}\n\n`
        response += `**Features:** ${result.data.features.join(", ")}\n\n`
      } else if (result.type === "system_knowledge") {
        response += `**System Files:**\n`
        for (const [file, info] of Object.entries(result.data)) {
          if (info) {
            response += `- **${file}:** ${(info as any).purpose}\n`
          }
        }
        response += "\n"
      } else if (result.type === "general_coding") {
        response += `**Best Practices:**\n`
        result.data.bestPractices.forEach((practice: string) => {
          response += `- ${practice}\n`
        })
        response += "\n"
      }
    }

    return response
  }

  private calculateCodingConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      if (result.type === "nextjs_knowledge") {
        totalConfidence += 0.9
      } else if (result.type === "system_knowledge") {
        totalConfidence += 0.95
      } else {
        totalConfidence += 0.7
      }
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        const learntEntry = {
          id: generateId(),
          content: {
            query: result.type,
            data: result.data,
            source: result.source,
          },
          confidence: 0.8,
          source: "coding-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: true,
          tags: [result.type, "coding"],
          relationships: [],
        }

        await storageManager.addLearntEntry(MODULE_CONFIG.coding.learntFile, learntEntry)
        this.stats.learntEntries++
      }
    }

    this.stats.lastUpdate = Date.now()
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }
}

export const codingModule = new CodingModule()
