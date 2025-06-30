import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { CodeSnippet } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

export class CodingModule implements ModuleInterface {
  name = "coding"
  version = "1.0.0"
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
      const codingRequests = this.extractCodingRequests(input)

      if (codingRequests.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const request of codingRequests) {
        const result = await this.processCodingRequest(request)
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
          requestsProcessed: codingRequests.length,
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

  private extractCodingRequests(input: string): string[] {
    const requests: string[] = []

    // Look for function/method requests
    const functionMatch = input.match(
      /(?:write|create|make)\s+(?:a\s+)?(?:function|method)\s+(?:to\s+|that\s+)?(.+?)(?:\.|$)/i,
    )
    if (functionMatch) {
      requests.push(`function: ${functionMatch[1].trim()}`)
    }

    // Look for algorithm requests
    const algorithmMatch = input.match(/(?:algorithm|solution)\s+(?:for\s+|to\s+)?(.+?)(?:\.|$)/i)
    if (algorithmMatch) {
      requests.push(`algorithm: ${algorithmMatch[1].trim()}`)
    }

    // Look for code explanation requests
    const explainMatch = input.match(/(?:explain|what\s+does)\s+(?:this\s+)?(?:code|function|method)(.+?)(?:\.|$)/i)
    if (explainMatch) {
      requests.push(`explain: ${explainMatch[1].trim()}`)
    }

    // Look for debugging requests
    const debugMatch = input.match(/(?:debug|fix|error)\s+(.+?)(?:\.|$)/i)
    if (debugMatch) {
      requests.push(`debug: ${debugMatch[1].trim()}`)
    }

    // Look for specific programming languages
    const languages = ["javascript", "python", "java", "c++", "typescript", "react", "node"]
    for (const lang of languages) {
      if (input.toLowerCase().includes(lang)) {
        requests.push(`language: ${lang}`)
        break
      }
    }

    return requests.length > 0 ? requests : [input]
  }

  private async processCodingRequest(request: string): Promise<any> {
    const [type, content] = request.includes(":") ? request.split(":", 2) : ["general", request]

    switch (type.toLowerCase()) {
      case "function":
        return await this.generateFunction(content.trim())
      case "algorithm":
        return await this.generateAlgorithm(content.trim())
      case "explain":
        return await this.explainCode(content.trim())
      case "debug":
        return await this.debugCode(content.trim())
      case "language":
        return await this.getLanguageInfo(content.trim())
      default:
        return await this.searchCodeSnippets(content.trim())
    }
  }

  private async generateFunction(description: string): Promise<any> {
    // Check learnt data first
    const learntFunction = this.searchLearntCode(description)
    if (learntFunction) {
      return learntFunction
    }

    // Check seed data
    const seedFunction = this.searchSeedCode(description)
    if (seedFunction) {
      return seedFunction
    }

    // Generate basic function template
    return this.generateBasicFunction(description)
  }

  private async generateAlgorithm(description: string): Promise<any> {
    const commonAlgorithms = {
      sort: {
        name: "Bubble Sort",
        language: "javascript",
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        description: "Simple sorting algorithm that repeatedly steps through the list",
        complexity: "O(n²)",
      },
      search: {
        name: "Binary Search",
        language: "javascript",
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`,
        description: "Efficient search algorithm for sorted arrays",
        complexity: "O(log n)",
      },
      fibonacci: {
        name: "Fibonacci Sequence",
        language: "javascript",
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  
  return b;
}`,
        description: "Generate the nth Fibonacci number",
        complexity: "O(n)",
      },
    }

    for (const [key, algorithm] of Object.entries(commonAlgorithms)) {
      if (description.toLowerCase().includes(key)) {
        return {
          type: "algorithm",
          ...algorithm,
          tags: [key, "algorithm", algorithm.language],
        }
      }
    }

    return null
  }

  private async explainCode(code: string): Promise<any> {
    // Simple code explanation based on patterns
    const explanations = []

    if (code.includes("function")) {
      explanations.push("This appears to be a function definition")
    }
    if (code.includes("for") || code.includes("while")) {
      explanations.push("Contains loop structures for iteration")
    }
    if (code.includes("if")) {
      explanations.push("Uses conditional statements for decision making")
    }
    if (code.includes("return")) {
      explanations.push("Returns a value to the caller")
    }

    return {
      type: "explanation",
      code: code.trim(),
      explanations,
      language: this.detectLanguage(code),
    }
  }

  private async debugCode(code: string): Promise<any> {
    const issues = []

    // Common syntax issues
    if (code.includes("=") && !code.includes("==") && !code.includes("===")) {
      issues.push("Consider using == or === for comparison instead of assignment")
    }
    if (code.includes("function") && !code.includes("{")) {
      issues.push("Function definition may be missing opening brace")
    }
    if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
      issues.push("Mismatched braces - check opening and closing braces")
    }

    return {
      type: "debug",
      code: code.trim(),
      issues: issues.length > 0 ? issues : ["No obvious syntax issues detected"],
      suggestions: ["Check variable names for typos", "Verify function parameters", "Test with sample inputs"],
    }
  }

  private async getLanguageInfo(language: string): Promise<any> {
    const languageInfo = {
      javascript: {
        name: "JavaScript",
        type: "Interpreted",
        paradigm: "Multi-paradigm",
        uses: ["Web development", "Server-side", "Mobile apps"],
        features: ["Dynamic typing", "First-class functions", "Prototype-based OOP"],
      },
      python: {
        name: "Python",
        type: "Interpreted",
        paradigm: "Multi-paradigm",
        uses: ["Data science", "Web development", "Automation"],
        features: ["Simple syntax", "Dynamic typing", "Extensive libraries"],
      },
      typescript: {
        name: "TypeScript",
        type: "Compiled to JavaScript",
        paradigm: "Multi-paradigm",
        uses: ["Large-scale JavaScript", "Web development", "Node.js"],
        features: ["Static typing", "Type inference", "Modern ES features"],
      },
    }

    return (
      languageInfo[language.toLowerCase()] || {
        name: language,
        type: "Unknown",
        note: "Language information not available in current database",
      }
    )
  }

  private searchLearntCode(query: string): CodeSnippet | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.title?.toLowerCase().includes(query.toLowerCase())) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedCode(query: string): CodeSnippet | null {
    if (!this.seedData || !this.seedData.snippets) return null

    for (const snippet of this.seedData.snippets) {
      if (
        snippet.title.toLowerCase().includes(query.toLowerCase()) ||
        snippet.description.toLowerCase().includes(query.toLowerCase())
      ) {
        return snippet
      }
    }

    return null
  }

  private async searchCodeSnippets(query: string): Promise<any> {
    // Search both learnt and seed data
    const learntResult = this.searchLearntCode(query)
    if (learntResult) return learntResult

    const seedResult = this.searchSeedCode(query)
    if (seedResult) return seedResult

    return null
  }

  private generateBasicFunction(description: string): any {
    const functionName = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join("")

    return {
      type: "function",
      title: `Generated Function: ${functionName}`,
      language: "javascript",
      code: `function ${functionName}() {
  // TODO: Implement ${description}
  console.log('Function ${functionName} called');
  return null;
}`,
      description: `Auto-generated function template for: ${description}`,
      tags: ["generated", "template", "javascript"],
      difficulty: 1,
    }
  }

  private detectLanguage(code: string): string {
    if (code.includes("def ") || code.includes("import ")) return "python"
    if (code.includes("function ") || code.includes("const ") || code.includes("let ")) return "javascript"
    if (code.includes("public class") || code.includes("System.out")) return "java"
    if (code.includes("#include") || code.includes("std::")) return "cpp"
    if (code.includes("interface ") || code.includes(": string")) return "typescript"
    return "unknown"
  }

  private buildCodingResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]

      if (result.type === "function" || result.type === "algorithm") {
        let response = `**${result.title || result.name}**\n\n`
        if (result.description) {
          response += `${result.description}\n\n`
        }
        response += `\`\`\`${result.language}\n${result.code}\n\`\`\``
        if (result.complexity) {
          response += `\n\n**Time Complexity:** ${result.complexity}`
        }
        return response
      } else if (result.type === "explanation") {
        return `**Code Explanation:**\n\n${result.explanations.join("\n")}\n\n**Language:** ${result.language}`
      } else if (result.type === "debug") {
        return `**Debug Analysis:**\n\n**Issues Found:**\n${result.issues.join("\n")}\n\n**Suggestions:**\n${result.suggestions.join("\n")}`
      } else if (result.name) {
        return `**${result.name}**\n\n**Type:** ${result.type}\n**Uses:** ${result.uses?.join(", ")}\n**Features:** ${result.features?.join(", ")}`
      }
    }

    let response = "Here are the coding results:\n\n"
    results.forEach((result, index) => {
      response += `${index + 1}. **${result.title || result.name}**: ${result.description || "Code snippet"}\n`
    })
    return response
  }

  private calculateCodingConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      if (result.type === "algorithm") {
        totalConfidence += 0.9 // High confidence for known algorithms
      } else if (result.type === "function") {
        totalConfidence += 0.8 // Good confidence for functions
      } else if (result.type === "explanation") {
        totalConfidence += 0.7 // Fair confidence for explanations
      } else {
        totalConfidence += 0.6 // Medium confidence for other results
      }
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        const learntEntry = {
          id: generateId(),
          content: result,
          confidence: 0.8,
          source: "coding-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: true,
          tags: result.tags || ["coding"],
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
