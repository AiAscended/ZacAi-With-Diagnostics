import type { OptimizedLoader } from "./optimized-loader"

export interface QueryResponse {
  response: string
  confidence: number
  sources: string[]
  reasoning: string[]
  timestamp: number
}

class SystemManager {
  private loader?: OptimizedLoader
  private initialized = false

  async initialize(loader: OptimizedLoader): Promise<void> {
    if (this.initialized) return

    console.log("🧠 Initializing System Manager...")

    this.loader = loader

    // Initialize core systems with loaded modules
    const healthMonitor = loader.getModule("healthMonitor")
    const storageManager = loader.getModule("storageManager")
    const cognitiveEngine = loader.getModule("cognitiveEngine")

    if (healthMonitor) {
      console.log("✅ Health Monitor connected")
    }

    if (storageManager) {
      console.log("✅ Storage Manager connected")
    }

    if (cognitiveEngine) {
      console.log("✅ Cognitive Engine connected")
    }

    this.initialized = true
    console.log("🎉 System Manager fully operational")
  }

  async processQuery(input: string): Promise<QueryResponse> {
    if (!this.initialized || !this.loader) {
      throw new Error("System not initialized")
    }

    const startTime = Date.now()

    try {
      // Get cognitive engine
      const cognitiveEngine = this.loader.getModule("cognitiveEngine")

      if (cognitiveEngine && cognitiveEngine.processInput) {
        const result = await cognitiveEngine.processInput(input)
        return {
          ...result,
          timestamp: Date.now(),
        }
      }

      // Fallback processing
      return this.fallbackProcessing(input)
    } catch (error) {
      console.error("Query processing error:", error)
      return {
        response: "I encountered an error processing your request. Please try again.",
        confidence: 0,
        sources: ["error"],
        reasoning: ["Error in query processing"],
        timestamp: Date.now(),
      }
    }
  }

  private fallbackProcessing(input: string): QueryResponse {
    const lowerInput = input.toLowerCase().trim()

    // Handle basic commands
    if (lowerInput === "help") {
      return {
        response:
          "I'm ZacAI v2.0.8 with production-grade architecture. I can help with:\n\n• Mathematics and calculations\n• Vocabulary and definitions\n• General knowledge questions\n• System status and diagnostics\n\nTry asking me to 'define a word', solve '5 + 5', or check 'status'.",
        confidence: 1.0,
        sources: ["system"],
        reasoning: ["Built-in help system"],
        timestamp: Date.now(),
      }
    }

    if (lowerInput === "status") {
      const summary = this.loader!.getLoadingSummary()
      return {
        response: `System Status Report:\n\n• Modules: ${summary.loaded}/${summary.total} loaded\n• Failed: ${summary.failed} modules\n• Bypassed: ${summary.bypassed} modules\n• Average load time: ${Math.round(summary.averageLoadTime)}ms\n• Architecture: Production-grade modular system\n• Status: ${summary.failed === 0 ? "Fully Operational" : "Operational with degraded features"}`,
        confidence: 1.0,
        sources: ["system"],
        reasoning: ["System status query"],
        timestamp: Date.now(),
      }
    }

    // Basic math
    const mathMatch = lowerInput.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/)
    if (mathMatch) {
      const [, a, op, b] = mathMatch
      const numA = Number.parseFloat(a)
      const numB = Number.parseFloat(b)
      let result: number

      switch (op) {
        case "+":
          result = numA + numB
          break
        case "-":
          result = numA - numB
          break
        case "*":
          result = numA * numB
          break
        case "/":
          result = numB !== 0 ? numA / numB : Number.NaN
          break
        default:
          result = Number.NaN
      }

      if (!isNaN(result)) {
        return {
          response: `${numA} ${op} ${numB} = ${result}`,
          confidence: 1.0,
          sources: ["basic-math"],
          reasoning: ["Basic arithmetic calculation"],
          timestamp: Date.now(),
        }
      }
    }

    // Default response
    return {
      response: `I received your message: "${input}"\n\nI'm running in fallback mode as some modules are still loading. My full capabilities will be available once all modules are operational. Try asking for 'help' or 'status' for more information.`,
      confidence: 0.7,
      sources: ["fallback"],
      reasoning: ["Fallback processing - limited functionality"],
      timestamp: Date.now(),
    }
  }

  getSystemStatus() {
    if (!this.loader) return null

    return {
      initialized: this.initialized,
      loadingSummary: this.loader.getLoadingSummary(),
      loadedModules: Array.from(this.loader.getLoadedModules().keys()),
      failedModules: this.loader.getFailedModules().map((m) => m.name),
    }
  }
}

export const systemManager = new SystemManager()
