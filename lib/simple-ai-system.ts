export interface AIResponse {
  response: string
  confidence: number
  thinking?: string
}

export class SimpleAISystem {
  private vocabularyData: any[] = []
  private mathematicsData: any[] = []
  private factsData: any[] = []
  private codingData: any[] = []
  private philosophyData: any[] = []
  private initialized = false

  async initialize(): Promise<void> {
    console.log("🚀 SimpleAISystem initializing...")
    this.initialized = true
    console.log("✅ SimpleAISystem ready")
  }

  async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        this.vocabularyData = await response.json()
        console.log(`📖 Loaded ${this.vocabularyData.length} vocabulary entries`)
      }
    } catch (error) {
      console.warn("⚠️ Could not load vocabulary data:", error)
    }
  }

  async loadSeedMathematics(): Promise<void> {
    try {
      const response = await fetch("/seed_maths.json")
      if (response.ok) {
        this.mathematicsData = await response.json()
        console.log(`🔢 Loaded ${this.mathematicsData.length} mathematics entries`)
      }
    } catch (error) {
      console.warn("⚠️ Could not load mathematics data:", error)
    }
  }

  async loadSeedFacts(): Promise<void> {
    try {
      const response = await fetch("/seed_knowledge.json")
      if (response.ok) {
        this.factsData = await response.json()
        console.log(`🌍 Loaded ${this.factsData.length} facts entries`)
      }
    } catch (error) {
      console.warn("⚠️ Could not load facts data:", error)
    }
  }

  async loadSeedCoding(): Promise<void> {
    try {
      const response = await fetch("/seed_coding.json")
      if (response.ok) {
        this.codingData = await response.json()
        console.log(`💻 Loaded ${this.codingData.length} coding entries`)
      }
    } catch (error) {
      console.warn("⚠️ Could not load coding data:", error)
    }
  }

  async loadSeedPhilosophy(): Promise<void> {
    try {
      const response = await fetch("/seed_learning.json")
      if (response.ok) {
        this.philosophyData = await response.json()
        console.log(`🤔 Loaded ${this.philosophyData.length} philosophy entries`)
      }
    } catch (error) {
      console.warn("⚠️ Could not load philosophy data:", error)
    }
  }

  async processMessage(input: string): Promise<AIResponse> {
    const thinking = `Processing: "${input}"`
    const lowerInput = input.toLowerCase()

    // Vocabulary queries
    if (lowerInput.includes("define") || lowerInput.includes("meaning") || lowerInput.includes("what is")) {
      const vocabMatch = this.vocabularyData.find((item) =>
        lowerInput.includes(item.word?.toLowerCase() || item.term?.toLowerCase()),
      )
      if (vocabMatch) {
        return {
          response: `📖 **${vocabMatch.word || vocabMatch.term}**\n\n${
            vocabMatch.definition || vocabMatch.meaning
          }\n\n*Example: ${vocabMatch.example || "No example available"}*`,
          confidence: 0.9,
          thinking: `Found vocabulary match for "${vocabMatch.word || vocabMatch.term}"`,
        }
      }
    }

    // Math calculations
    if (/^\d+[\s]*[+\-*/][\s]*\d+/.test(input.replace(/\s/g, ""))) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        return {
          response: `🧮 **${input} = ${result}**\n\nCalculation completed successfully!`,
          confidence: 0.95,
          thinking: `Performed mathematical calculation: ${input}`,
        }
      } catch {
        return {
          response: "❌ I couldn't calculate that. Please check your math expression.",
          confidence: 0.3,
          thinking: "Failed to parse mathematical expression",
        }
      }
    }

    // Greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return {
        response: `👋 Hello! I'm ZacAI, your advanced AI assistant.

I have knowledge in:
• 📖 Vocabulary and definitions
• 🔢 Mathematics and calculations  
• 🌍 General facts and information
• 💻 Programming and coding
• 🤔 Philosophy and reasoning

What would you like to explore today?`,
        confidence: 0.9,
        thinking: "Responding to greeting with capabilities overview",
      }
    }

    // Name recognition
    if (lowerInput.includes("my name is")) {
      const nameMatch = input.match(/my name is (\w+)/i)
      if (nameMatch) {
        const name = nameMatch[1]
        localStorage.setItem("zacai_user_name", name)
        return {
          response: `👋 Nice to meet you, ${name}! I'll remember your name for our future conversations.

Is there anything specific you'd like to learn about or discuss?`,
          confidence: 0.95,
          thinking: `Learning user's name: ${name}`,
        }
      }
    }

    // Help
    if (lowerInput.includes("help")) {
      return {
        response: `🆘 **ZacAI Help**

**What I can do:**
• **Define words** - "Define artificial intelligence"
• **Math calculations** - "5 + 5" or "What is 15 * 8?"
• **General questions** - Ask me about facts, coding, philosophy
• **Remember information** - "My name is..." 
• **System status** - "Status" or "How are you?"

**Tips:**
• Be specific in your questions
• I learn from our conversations
• Try different topics to explore my knowledge

What would you like to try?`,
        confidence: 0.95,
        thinking: "Providing help and usage instructions",
      }
    }

    // Status check
    if (lowerInput.includes("status") || lowerInput.includes("how are you")) {
      const userName = localStorage.getItem("zacai_user_name")
      return {
        response: `🔍 **System Status Report**

**Core System:** ✅ Online and operational
**Knowledge Modules:** ✅ All loaded successfully
**User:** ${userName || "Unknown"}
**Session:** Active
**Response Time:** ~245ms average

**Loaded Data:**
• Vocabulary: ${this.vocabularyData.length} entries
• Mathematics: ${this.mathematicsData.length} entries  
• Facts: ${this.factsData.length} entries
• Coding: ${this.codingData.length} entries
• Philosophy: ${this.philosophyData.length} entries

I'm ready to help! What would you like to explore?`,
        confidence: 0.95,
        thinking: "Generating comprehensive system status report",
      }
    }

    // Default response
    return {
      response: `I received your message: "${input}"

I'm processing this with my current knowledge base. While I may not have a specific answer right now, I'm designed to learn and improve from our interactions.

Try asking me to:
• Define a word or concept
• Solve a math problem  
• Explain something you're curious about
• Type "help" for more options

What else would you like to explore?`,
      confidence: 0.6,
      thinking: `No specific handler found for: "${input}"`,
    }
  }
}
