export class ZacAI {
  private vocabulary: Map<string, any> = new Map()
  private personalInfo: Map<string, string> = new Map()
  private conversationHistory: any[] = []

  constructor() {
    console.log("🤖 ZacAI initializing...")
  }

  public async initialize(): Promise<void> {
    // Load vocabulary
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          this.vocabulary.set(word.toLowerCase(), entry)
        })
        console.log(`✅ Loaded ${this.vocabulary.size} words`)
      }
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }

    // Load personal info from storage
    try {
      const stored = localStorage.getItem("zac_personal_info")
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          this.personalInfo.set(key, value)
        })
      }
    } catch (error) {
      console.warn("Failed to load personal info:", error)
    }
  }

  public async processMessage(message: string): Promise<{ content: string; confidence: number }> {
    console.log(`🧠 Processing: "${message}"`)

    // Extract and store personal info
    this.extractPersonalInfo(message)

    // Get user's name for personalized responses
    const userName = this.personalInfo.get("name")
    const namePrefix = userName ? `${userName}, ` : ""

    // Math processing
    const mathResult = this.processMath(message)
    if (mathResult) {
      return {
        content: `${namePrefix}🧮 **${mathResult.answer}**\n\n${mathResult.explanation}`,
        confidence: 0.95,
      }
    }

    // Vocabulary lookup
    const vocabResult = this.processVocabulary(message)
    if (vocabResult) {
      return {
        content: `${namePrefix}📖 **${vocabResult.word}**\n\n${vocabResult.definition}`,
        confidence: 0.9,
      }
    }

    // Personal info queries
    if (message.toLowerCase().includes("my name") || message.toLowerCase().includes("remember")) {
      if (userName) {
        return {
          content: `${namePrefix}I remember you! Your name is **${userName}**.`,
          confidence: 0.95,
        }
      } else {
        return {
          content: "I don't know your name yet. What would you like me to call you?",
          confidence: 0.8,
        }
      }
    }

    // Greetings
    if (/^(hi|hello|hey)$/i.test(message.trim())) {
      return {
        content: `${namePrefix}Hello! I can help with math, vocabulary, and I'll remember things about you. What would you like to know?`,
        confidence: 0.9,
      }
    }

    // Default response
    return {
      content: `${namePrefix}I understand. I can help with math calculations, word definitions, and personal information. What would you like to explore?`,
      confidence: 0.6,
    }
  }

  private processMath(message: string): { answer: number; explanation: string } | null {
    // Simple math patterns
    const patterns = [/(\d+)\s*\+\s*(\d+)/, /(\d+)\s*-\s*(\d+)/, /(\d+)\s*[×*]\s*(\d+)/, /(\d+)\s*[÷/]\s*(\d+)/]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        const num1 = Number.parseInt(match[1])
        const num2 = Number.parseInt(match[2])
        let result: number
        let operation: string

        if (message.includes("+")) {
          result = num1 + num2
          operation = `${num1} + ${num2} = ${result}`
        } else if (message.includes("-")) {
          result = num1 - num2
          operation = `${num1} - ${num2} = ${result}`
        } else if (message.includes("×") || message.includes("*")) {
          result = num1 * num2
          operation = `${num1} × ${num2} = ${result}`
        } else if (message.includes("÷") || message.includes("/")) {
          result = num1 / num2
          operation = `${num1} ÷ ${num2} = ${result}`
        } else {
          continue
        }

        return {
          answer: result,
          explanation: operation,
        }
      }
    }

    return null
  }

  private processVocabulary(message: string): { word: string; definition: string } | null {
    const match = message.match(/what\s+(?:is|does|means?)\s+(\w+)/i)
    if (match) {
      const word = match[1].toLowerCase()
      const entry = this.vocabulary.get(word)
      if (entry) {
        return {
          word: word,
          definition: entry.definition || `Definition for ${word}`,
        }
      }
    }
    return null
  }

  private extractPersonalInfo(message: string): void {
    // Extract name
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    if (nameMatch) {
      this.personalInfo.set("name", nameMatch[1])
      this.savePersonalInfo()
      console.log(`📝 Learned name: ${nameMatch[1]}`)
    }

    // Extract other info
    const ageMatch = message.match(/i am (\d+) years old/i)
    if (ageMatch) {
      this.personalInfo.set("age", ageMatch[1])
      this.savePersonalInfo()
    }
  }

  private savePersonalInfo(): void {
    try {
      const data = Object.fromEntries(this.personalInfo)
      localStorage.setItem("zac_personal_info", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save personal info:", error)
    }
  }

  public getStats(): any {
    return {
      vocabularySize: this.vocabulary.size,
      mathFunctions: 4, // +, -, ×, ÷
      memoryEntries: this.personalInfo.size,
      breakdown: {
        seedVocab: this.vocabulary.size,
        learnedVocab: 0,
      },
    }
  }
}
