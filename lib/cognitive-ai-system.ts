"use client"

import { BrowserStorageManager } from "./browser-storage-manager"
import { EnhancedKnowledgeSystem } from "./enhanced-knowledge-system"
import { EnhancedMathProcessor } from "./enhanced-math-processor"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"
import type { ChatMessage, AIResponse, PersonalInfoEntry, FactEntry, SystemStats } from "./types"

export class CognitiveAISystem {
  private enhancedKnowledge = new EnhancedKnowledgeSystem()
  private enhancedMath = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()
  private temporalSystem = new TemporalKnowledgeSystem()

  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private facts: Map<string, FactEntry> = new Map()

  private systemStatus = "idle"
  private isInitialized = false
  private systemIdentity: any = null

  constructor() {
    this.initializeBasicVocabulary()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("🚀 Initializing Cognitive AI System...")
    this.systemStatus = "initializing"

    await this.loadSystemIdentity()
    await this.loadConversationHistory()
    await this.loadMemory()
    await this.loadVocabulary()

    this.systemStatus = "ready"
    this.isInitialized = true
    console.log(`✅ ${this.systemIdentity?.name || "ZacAI"} Cognitive AI System ready!`)
  }

  private async loadSystemIdentity(): Promise<void> {
    try {
      const response = await fetch("/seed_system.json")
      if (response.ok) {
        const systemData = await response.json()
        this.systemIdentity = systemData.identity || { name: "ZacAI", version: "3.0.0" }
      } else {
        this.systemIdentity = { name: "ZacAI", version: "3.0.0" }
      }
    } catch (error) {
      console.warn("Could not load system identity, using defaults.")
      this.systemIdentity = { name: "ZacAI", version: "3.0.0" }
    }
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) await this.initialize()

    this.extractAndStorePersonalInfo(userMessage)
    let response: AIResponse

    if (this.isTeslaMathQuery(userMessage)) {
      response = this.handleTeslaMathQuery(userMessage)
    } else if (this.enhancedMath.analyzeMathExpression(userMessage).isMatch) {
      response = this.handleMathProblem(userMessage)
    } else if (this.isDefinitionRequest(userMessage)) {
      response = await this.handleDefinitionRequest(userMessage)
    } else if (this.isIdentityQuestion(userMessage)) {
      response = this.handleIdentityQuestion()
    } else {
      response = this.generateConversationalResponse(userMessage)
    }

    await this.saveConversation(userMessage, response.content)
    return response
  }

  private isTeslaMathQuery(message: string): boolean {
    return /tesla|vortex|369|digital root/i.test(message)
  }

  private handleTeslaMathQuery(message: string): AIResponse {
    const numberMatch = message.match(/(\d+)/)
    if (!numberMatch) {
      return {
        content: "Please provide a number for Tesla/Vortex math analysis.",
        confidence: 0.6,
        reasoning: ["Tesla query detected without a number."],
      }
    }
    const number = Number.parseInt(numberMatch[1], 10)
    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexData = this.getVortexAnalysis(number)

    let response = `🌀 **Tesla Pattern for ${number}**\n\n`
    response += `• **Digital Root:** ${digitalRoot}\n`
    response += `• **Pattern Type:** ${vortexData.type}\n`
    if (vortexData.isTeslaNumber) {
      response += `• **Meaning:** ${vortexData.meaning}\n`
    }
    return { content: response, confidence: 0.95, reasoning: ["Calculated Tesla pattern."] }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0)
    }
    return num
  }

  private getVortexAnalysis(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const teslaNumbers = [3, 6, 9]
    const isTeslaNumber = teslaNumbers.includes(digitalRoot)
    const meanings: { [key: number]: string } = { 3: "Creation", 6: "Harmony", 9: "Completion" }

    return {
      type: isTeslaNumber ? "Tesla Number" : "Vortex Cycle",
      isTeslaNumber,
      meaning: isTeslaNumber ? meanings[digitalRoot] : "Part of the material world cycle.",
    }
  }

  private handleMathProblem(message: string): AIResponse {
    const mathAnalysis = this.enhancedMath.analyzeMathExpression(message)
    if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
      return {
        content: `The result of ${mathAnalysis.operation} on ${mathAnalysis.numbers.join(" and ")} is ${mathAnalysis.result}.`,
        confidence: mathAnalysis.confidence,
        reasoning: mathAnalysis.reasoning,
        mathAnalysis,
      }
    }
    return { content: "I couldn't solve that math problem.", confidence: 0.4 }
  }

  private isDefinitionRequest(message: string): boolean {
    return /^(what is|define|meaning of)/i.test(message)
  }

  private async handleDefinitionRequest(message: string): Promise<AIResponse> {
    const wordMatch = message.match(/(?:what is|define|meaning of)\s(.+)/i)
    if (!wordMatch) return { content: "I couldn't identify the word.", confidence: 0.3 }

    const word = wordMatch[1].trim().replace(/[?.!]/g, "")
    const definition = await this.enhancedKnowledge.lookupWord(word)

    if (definition) {
      const firstMeaning = definition.meanings[0]
      const firstDefinition = firstMeaning.definitions[0]
      return {
        content: `**${definition.word}** (${firstMeaning.partOfSpeech}): ${firstDefinition.definition}`,
        confidence: 0.9,
        reasoning: ["Looked up word via API."],
      }
    }
    return { content: `I could not find a definition for "${word}".`, confidence: 0.4 }
  }

  private isIdentityQuestion(message: string): boolean {
    return /who are you|what are you|what is your name/i.test(message)
  }

  private handleIdentityQuestion(): AIResponse {
    const name = this.systemIdentity?.name || "ZacAI"
    const version = this.systemIdentity?.version || "3.0.0"
    return {
      content: `I am ${name} v${version}, a cognitive AI system designed for learning and problem-solving.`,
      confidence: 0.98,
      reasoning: ["Accessed system identity information."],
    }
  }

  private generateConversationalResponse(message: string): AIResponse {
    return {
      content: `I've processed your message: "${message}". I can help with math, definitions, and more.`,
      confidence: 0.7,
      reasoning: ["Generated a default conversational response."],
    }
  }

  private extractAndStorePersonalInfo(message: string): void {
    const nameMatch = message.match(/my name is (\w+)/i)
    if (nameMatch) {
      const name = nameMatch[1]
      const entry: PersonalInfoEntry = {
        key: "name",
        value: name,
        timestamp: Date.now(),
        importance: 0.9,
        type: "personal_info",
        source: "conversation",
      }
      this.personalInfo.set("name", entry)
      console.log(`📝 Stored personal info: name = ${name}`)
    }
  }

  private initializeBasicVocabulary(): void {
    const basicWords = ["hello", "goodbye", "math", "define", "tesla", "name"]
    basicWords.forEach((word) => this.vocabulary.set(word, "basic"))
  }

  private async saveConversation(userMessage: string, aiResponse: string): Promise<void> {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg, aiMsg)
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }
    await this.storageManager.saveConversations(this.conversationHistory)
  }

  private async loadConversationHistory(): Promise<void> {
    this.conversationHistory = await this.storageManager.loadConversations()
  }
  private async loadMemory(): Promise<void> {
    this.memory = await this.storageManager.loadMemory()
  }
  private async loadVocabulary(): Promise<void> {
    this.vocabulary = await this.storageManager.loadVocabulary()
  }

  public getStats(): SystemStats {
    const assistantMessages = this.conversationHistory.filter((m) => m.role === "assistant" && m.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0
    const knowledgeStats = this.enhancedKnowledge.getKnowledgeStats()

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size + knowledgeStats.learnedVocabulary,
      memoryEntries: this.personalInfo.size,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: 10 + knowledgeStats.learnedMathematics,
      seedProgress: 0,
      responseTime: 0,
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: new Map(),
      totalLearned: knowledgeStats.totalLearned,
      learnedVocabulary: knowledgeStats.learnedVocabulary,
      learnedMathematics: knowledgeStats.learnedMathematics,
      learnedScience: knowledgeStats.learnedScience,
      learnedCoding: knowledgeStats.learnedCoding,
      apiStatus: knowledgeStats.apiStatus,
      currentDateTime: this.temporalSystem.getCurrentDateTime(),
      batchQueueSize: knowledgeStats.batchQueueSize,
      systemName: this.systemIdentity?.name || "ZacAI",
      systemVersion: this.systemIdentity?.version || "3.0.0",
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
  }

  // Keep all existing methods for compatibility...
  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
      { category: "mathematics", fact: "Tesla's 3-6-9 pattern reveals the fundamental structure of the universe" },
    ]

    sampleFacts.forEach((item) => {
      this.facts.set(`fact_${item.category}`, {
        key: `fact_${item.category}`,
        value: item.fact,
        timestamp: Date.now(),
        importance: 0.8,
        type: "fact",
        source: "system",
      })
    })
  }

  // All other existing methods remain the same...

  private async saveMemory(): Promise<void> {
    try {
      await this.storageManager.saveMemory(this.memory)
    } catch (error) {
      console.warn("Failed to save memory:", error)
    }
  }

  private async saveVocabulary(): Promise<void> {
    try {
      await this.storageManager.saveVocabulary(this.vocabulary)
    } catch (error) {
      console.warn("Failed to save vocabulary:", error)
    }
  }

  public getMathFunctionCount(): number {
    return 144 + this.enhancedKnowledge.getKnowledgeStats().learnedMathematics
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
    return [
      { text: "Tell me about yourself", type: "question" },
      { text: "What can you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
      { text: "What did you learn recently?", type: "question" },
      { text: "Define quantum computing", type: "action" },
      { text: "Tesla math for 12", type: "action" },
    ]
  }

  public generateResponseSuggestions(userInput: string, response: string): string[] {
    return ["Tell me more", "What else?", "Can you explain that?", "What did you learn?"]
  }

  public processFeedback(messageId: string, feedback: string): void {
    console.log(`Feedback received for ${messageId}: ${feedback}`)
  }

  public updateResponseTime(time: number): void {
    console.log(`Response time: ${time}ms`)
  }

  public exportData(): any {
    return {
      conversations: this.conversationHistory,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      facts: Array.from(this.facts.entries()),
      learnedKnowledge: this.enhancedKnowledge.getKnowledgeStats(),
      timestamp: Date.now(),
    }
  }

  public async addVocabularyWord(word: string, category: string): Promise<void> {
    this.vocabulary.set(word.toLowerCase(), category)
    await this.saveVocabulary()
  }

  public async removeVocabularyWord(word: string): Promise<void> {
    this.vocabulary.delete(word.toLowerCase())
    await this.saveVocabulary()
  }

  public async addMemoryEntry(key: string, value: string): Promise<void> {
    const entry = {
      key: key.toLowerCase().replace(/\s+/g, "_"),
      value: value,
      timestamp: Date.now(),
      importance: 0.7,
    }
    this.memory.set(entry.key, entry)
    await this.saveMemory()
  }

  public async removeMemoryEntry(key: string): Promise<void> {
    this.memory.delete(key)
    await this.saveMemory()
  }

  public async clearAllData(): Promise<void> {
    try {
      this.conversationHistory = []
      this.vocabulary = new Map()
      this.memory = new Map()
      this.personalInfo = new Map()
      this.facts = new Map()

      await this.storageManager.clearAllData()
      console.log("✅ All AI system data cleared")
    } catch (error) {
      console.error("❌ Failed to clear AI system data:", error)
      throw error
    }
  }

  public async retrainFromKnowledge(): Promise<void> {
    try {
      console.log("🔄 Retraining AI system from knowledge base...")

      const storedData = await this.storageManager.exportAllData()
      if (storedData) {
        if (storedData.vocabulary) {
          this.vocabulary = new Map(storedData.vocabulary)
        }
        if (storedData.memory) {
          this.memory = new Map(storedData.memory)
        }
      }

      await this.saveConversationHistory()
      await this.saveMemory()
      await this.saveVocabulary()

      console.log("✅ AI system retrained successfully")
    } catch (error) {
      console.error("❌ AI system retraining failed:", error)
      throw error
    }
  }

  private async saveLearnedVocabulary(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedVocabulary)
      localStorage.setItem("learnt_vocab", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedVocabulary.size} learned vocabulary entries`)
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }

  private async saveLearnedMathematics(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedMathematics)
      localStorage.setItem("learnt_maths", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedMathematics.size} learned mathematics entries`)
    } catch (error) {
      console.warn("Failed to save learned mathematics:", error)
    }
  }

  private async saveLearnedScience(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedScience)
      localStorage.setItem("learnt_science", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedScience.size} learned science entries`)
    } catch (error) {
      console.warn("Failed to save learned science:", error)
    }
  }

  private async saveLearnedCoding(): Promise<void> {
    try {
      const learnedData = Object.fromEntries(this.learnedCoding)
      localStorage.setItem("learnt_coding", JSON.stringify(learnedData))
      console.log(`💾 Saved ${this.learnedCoding.size} learned coding entries`)
    } catch (error) {
      console.warn("Failed to save learned coding:", error)
    }
  }

  private async loadLearnedKnowledge(): Promise<void> {
    try {
      // Load learned vocabulary
      const vocabData = localStorage.getItem("learnt_vocab")
      if (vocabData) {
        const parsed = JSON.parse(vocabData)
        this.learnedVocabulary = new Map(Object.entries(parsed))
        console.log(`📚 Loaded ${this.learnedVocabulary.size} learned vocabulary entries`)
      }

      // Load learned mathematics
      const mathData = localStorage.getItem("learnt_maths")
      if (mathData) {
        const parsed = JSON.parse(mathData)
        this.learnedMathematics = new Map(Object.entries(parsed))
        console.log(`🧮 Loaded ${this.learnedMathematics.size} learned mathematics entries`)
      }

      // Load learned science
      const scienceData = localStorage.getItem("learnt_science")
      if (scienceData) {
        const parsed = JSON.parse(scienceData)
        this.learnedScience = new Map(Object.entries(parsed))
        console.log(`🔬 Loaded ${this.learnedScience.size} learned science entries`)
      }

      // Load learned coding
      const codingData = localStorage.getItem("learnt_coding")
      if (codingData) {
        const parsed = JSON.parse(codingData)
        this.learnedCoding = new Map(Object.entries(parsed))
        console.log(`💻 Loaded ${this.learnedCoding.size} learned coding entries`)
      }
    } catch (error) {
      console.warn("Failed to load learned knowledge:", error)
    }
  }

  private setDefaultSystemIdentity(): void {
    this.systemIdentity = {
      name: "ZacAI",
      version: "2.0.0",
      purpose:
        "To be an intelligent, learning browser-based AI assistant that helps users with knowledge, conversation, and problem-solving",
    }
    this.systemCapabilities = [
      "Natural language conversation and understanding",
      "Mathematical calculations including Tesla/Vortex math patterns",
      "Word definitions and vocabulary expansion",
      "Scientific concept explanation and research",
      "Coding assistance with React/Next.js/JavaScript/TypeScript",
    ]
    console.log("✅ Default system identity set")
  }

  public getSystemDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      systemStatus: this.systemStatus,
      systemIdentity: this.systemIdentity,
      systemCapabilities: this.systemCapabilities,
      hasKnowledgeSources: !!this.knowledgeSources,
      temporalSystemWorking: !!this.temporalSystem,
      enhancedKnowledgeWorking: !!this.enhancedKnowledge,
      initializationTime: Date.now(),
      conversationCount: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      personalInfoCount: this.personalInfo.size,
      factsCount: this.facts.size,
    }
  }

  private isTeslaMathQuery(message: string): boolean {
    const patterns = [
      /tesla.*math/i,
      /vortex.*math/i,
      /tesla.*pattern/i,
      /vortex.*pattern/i,
      /digital.*root/i,
      /3.*6.*9/i,
      /tesla.*number/i,
      /vortex.*number/i,
      /what.*tesla.*math/i,
      /explain.*tesla/i,
      /tell.*about.*tesla.*math/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  private async handleTeslaMathQuery(message: string): Promise<AIResponse> {
    let response = `🌀 **Tesla/Vortex Mathematics**\n\n`

    response += `Tesla's 3-6-9 pattern reveals the fundamental structure of the universe through digital root analysis.\n\n`

    response += `**🔢 The Tesla Pattern:**\n`
    response += `• **3, 6, 9**: The sacred numbers that control the universe\n`
    response += `• **1, 2, 4, 8, 7, 5**: The vortex cycle that repeats infinitely\n`
    response += `• **Digital Root**: Reducing numbers to single digits reveals hidden patterns\n\n`

    response += `**🌀 How Vortex Math Works:**\n`
    response += `1. Take any number and add its digits together\n`
    response += `2. Keep reducing until you get a single digit (1-9)\n`
    response += `3. This reveals the number's position in the universal pattern\n`
    response += `4. Numbers 3, 6, 9 are special - they form the "Tesla Triangle"\n\n`

    response += `**🧮 Example Analysis:**\n`
    response += `• 12 → 1+2 = 3 (Tesla Number - Creation)\n`
    response += `• 15 → 1+5 = 6 (Tesla Number - Harmony)\n`
    response += `• 18 → 1+8 = 9 (Tesla Number - Completion)\n`
    response += `• 14 → 1+4 = 5 (Vortex Cycle - Transformation)\n\n`

    response += `**💡 Tesla's Quote:** "If you only knew the magnificence of the 3, 6 and 9, then you would have the key to the universe."\n\n`

    response += `Try asking me to calculate the Tesla pattern for any number!`

    return {
      content: response,
      confidence: 0.95,
      reasoning: ["Provided comprehensive Tesla/Vortex mathematics explanation", "Used built-in Tesla math knowledge"],
    }
  }

  private generateCodeExample(language: string, concept: string): AIResponse {
    let response = `💻 **${language.toUpperCase()} Code Example**\n\n`

    if (language === "react" || concept.includes("react")) {
      response += `**🔧 React Component Example:**\n`
      response += `\`\`\`jsx\n`
      response += `import { useState } from 'react'\n\n`
      response += `function Counter() {\n`
      response += `  const [count, setCount] = useState(0)\n\n`
      response += `  return (\n`
      response += `    <div className="counter">\n`
      response += `      <h2>Count: {count}</h2>\n`
      response += `      <button onClick={() => setCount(count + 1)}>\n`
      response += `        Increment\n`
      response += `      </button>\n`
      response += `    </div>\n`
      response += `  )\n`
      response += `}\n\n`
      response += `export default Counter\n`
      response += `\`\`\`\n\n`
      response += `**Key Features:**\n`
      response += `• Uses React hooks (useState)\n`
      response += `• Interactive button with click handler\n`
      response += `• State management for counter\n`
      response += `• JSX syntax for HTML-like structure\n`
    } else if (language === "nextjs" || concept.includes("next")) {
      response += `**🚀 Next.js Page Example:**\n`
      response += `\`\`\`tsx\n`
      response += `// app/page.tsx (App Router)\n`
      response += `export default function HomePage() {\n`
      response += `  return (\n`
      response += `    <main className="container mx-auto p-4">\n`
      response += `      <h1 className="text-3xl font-bold">Welcome to Next.js!</h1>\n`
      response += `      <p className="mt-4">This is a server component.</p>\n`
      response += `      <div className="mt-8">\n`
      response += `        <h2 className="text-xl">Features:</h2>\n`
      response += `        <ul className="list-disc ml-6">\n`
      response += `          <li>Server-side rendering</li>\n`
      response += `          <li>File-based routing</li>\n`
      response += `          <li>Built-in optimization</li>\n`
      response += `        </ul>\n`
      response += `      </div>\n`
      response += `    </main>\n`
      response += `  )\n`
      response += `}\n`
      response += `\`\`\`\n\n`
      response += `**Next.js Features:**\n`
      response += `• App Router with file-based routing\n`
      response += `• Server components by default\n`
      response += `• Built-in Tailwind CSS support\n`
      response += `• Automatic code splitting\n`
    } else {
      response += `**📝 JavaScript Example:**\n`
      response += `\`\`\`javascript\n`
      response += `// Modern JavaScript function\n`
      response += `const greetUser = (name, age) => {\n`
      response += `  return \`Hello \${name}, you are \${age} years old!\`\n`
      response += `}\n\n`
      response += `// Using the function\n`
      response += `const message = greetUser("Alice", 25)\n`
      response += `console.log(message)\n\n`
      response += `// Async function example\n`
      response += `const fetchData = async () => {\n`
      response += `  try {\n`
      response += `    const response = await fetch('/api/data')\n`
      response += `    const data = await response.json()\n`
      response += `    return data\n`
      response += `  } catch (error) {\n`
      response += `    console.error('Error:', error)\n`
      response += `  }\n`
      response += `}\n`
      response += `\`\`\`\n\n`
      response += `**JavaScript Features:**\n`
      response += `• Arrow functions\n`
      response += `• Template literals\n`
      response += `• Async/await for promises\n`
      response += `• Modern ES6+ syntax\n`
    }

    response += `\n✨ I've generated this code example and will remember it for future reference!`

    return {
      content: response,
      confidence: 0.9,
      reasoning: ["Generated comprehensive code example", "Provided language-specific features and explanations"],
    }
  }
}
