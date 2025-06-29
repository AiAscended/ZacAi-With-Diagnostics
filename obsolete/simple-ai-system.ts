"use client"

export class SimpleAISystem {
  private responses: Map<string, string> = new Map()
  private isInitialized = false

  constructor() {
    console.log("🤖 SimpleAISystem initialized")
    this.setupBasicResponses()
  }

  private setupBasicResponses(): void {
    this.responses.set("hello", "Hello! How can I help you today?")
    this.responses.set("hi", "Hi there! What would you like to know?")
    this.responses.set("how are you", "I'm doing well, thank you for asking!")
    this.responses.set("what is your name", "I'm a simple AI assistant.")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 Initializing Simple AI System...")

    // Simulate initialization delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.isInitialized = true
    console.log("✅ Simple AI System ready")
  }

  public async processMessage(userMessage: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const normalizedMessage = userMessage.toLowerCase().trim()

    // Check for exact matches
    if (this.responses.has(normalizedMessage)) {
      return {
        content: this.responses.get(normalizedMessage),
        confidence: 0.9,
        knowledgeUsed: ["basic_responses"],
        reasoning: ["Matched predefined response"],
      }
    }

    // Basic math
    const mathMatch = userMessage.match(/(\d+)\s*[+\-*/]\s*(\d+)/)
    if (mathMatch) {
      const num1 = Number.parseInt(mathMatch[1])
      const num2 = Number.parseInt(mathMatch[3])
      const operator = mathMatch[2]

      let result: number
      switch (operator) {
        case "+":
          result = num1 + num2
          break
        case "-":
          result = num1 - num2
          break
        case "*":
          result = num1 * num2
          break
        case "/":
          result = num1 / num2
          break
        default:
          result = 0
      }

      return {
        content: `The answer is: ${result}`,
        confidence: 0.95,
        knowledgeUsed: ["basic_math"],
        reasoning: ["Performed basic calculation"],
      }
    }

    // Default response
    return {
      content: "I'm a simple AI. I can do basic math and respond to greetings. What would you like to try?",
      confidence: 0.5,
      knowledgeUsed: ["default_response"],
      reasoning: ["No specific pattern matched"],
    }
  }

  public getStats(): any {
    return {
      vocabularySize: this.responses.size,
      mathFunctions: 4, // +, -, *, /
      memoryEntries: 0,
      totalMessages: 0,
      systemStatus: this.isInitialized ? "ready" : "initializing",
      totalLearned: 0,
    }
  }

  public getConversationHistory(): any[] {
    return []
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemIdentity: {
        name: "SimpleAI",
        version: "1.0.0",
      },
    }
  }

  public exportData(): any {
    return {
      responses: Array.from(this.responses.entries()),
      exportTimestamp: Date.now(),
    }
  }
}
