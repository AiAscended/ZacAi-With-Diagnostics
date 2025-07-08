import type { KnowledgeManager } from "../managers/KnowledgeManager"
import { SystemConfig } from "../system/config"

export interface KnowledgeResult {
  response: string
  confidence: number
  sources: string[]
  type: "definition" | "explanation" | "fact" | "concept"
  relatedTopics?: string[]
}

export interface OnlineLookupResult {
  found: boolean
  data?: any
  source: string
  error?: string
}

export class KnowledgeEngine {
  private knowledgeManager: KnowledgeManager
  private cache: Map<string, any> = new Map()
  private onlineSources: Map<string, string> = new Map()

  constructor(knowledgeManager: KnowledgeManager) {
    console.log("📚 KnowledgeEngine: Initializing...")
    this.knowledgeManager = knowledgeManager
    this.initializeOnlineSources()
  }

  public async initialize(): Promise<void> {
    console.log("📚 KnowledgeEngine: Loading knowledge sources...")
    // Knowledge engine is ready
  }

  private initializeOnlineSources(): void {
    this.onlineSources.set("dictionary", SystemConfig.APIS.DICTIONARY)
    this.onlineSources.set("thesaurus", SystemConfig.APIS.THESAURUS)
    this.onlineSources.set("wikipedia", SystemConfig.APIS.WIKIPEDIA)
  }

  public async processKnowledge(input: string): Promise<KnowledgeResult> {
    console.log(`📚 KnowledgeEngine: Processing knowledge query: "${input}"`)

    try {
      // Determine query type
      const queryType = this.determineQueryType(input)

      // Search local knowledge first
      const localResult = await this.searchLocalKnowledge(input, queryType)

      if (localResult.confidence > 0.7) {
        return localResult
      }

      // If local knowledge is insufficient, try online lookup
      if (SystemConfig.LEARNING_SETTINGS.ONLINE_LEARNING_ENABLED) {
        const onlineResult = await this.searchOnlineKnowledge(input, queryType)

        if (onlineResult.confidence > localResult.confidence) {
          // Learn from online result
          await this.learnFromOnlineResult(input, onlineResult)
          return onlineResult
        }
      }

      return localResult
    } catch (error) {
      console.error("❌ KnowledgeEngine: Error processing knowledge:", error)
      return {
        response: "I encountered an error while searching for that information.",
        confidence: 0.1,
        sources: ["error"],
        type: "fact",
      }
    }
  }

  private determineQueryType(input: string): "definition" | "explanation" | "fact" | "concept" {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("what is") || lowerInput.includes("define")) {
      return "definition"
    }
    if (lowerInput.includes("explain") || lowerInput.includes("how does")) {
      return "explanation"
    }
    if (lowerInput.includes("tell me about") || lowerInput.includes("information about")) {
      return "concept"
    }

    return "fact"
  }

  private async searchLocalKnowledge(input: string, type: string): Promise<KnowledgeResult> {
    // Search in knowledge manager
    const searchResults = this.knowledgeManager.searchKnowledge(input)

    if (searchResults.length > 0) {
      const bestResult = searchResults[0]

      return {
        response: this.formatLocalResult(bestResult, type),
        confidence: bestResult.relevance || 0.6,
        sources: ["local_knowledge"],
        type: type as any,
        relatedTopics: this.findRelatedTopics(input),
      }
    }

    return {
      response: "I don't have information about that in my current knowledge base.",
      confidence: 0.2,
      sources: ["local_knowledge"],
      type: type as any,
    }
  }

  private async searchOnlineKnowledge(input: string, type: string): Promise<KnowledgeResult> {
    try {
      // Extract the main term to search for
      const searchTerm = this.extractSearchTerm(input)

      // Try dictionary lookup first for definitions
      if (type === "definition") {
        const dictResult = await this.lookupDictionary(searchTerm)
        if (dictResult.found) {
          return {
            response: this.formatDictionaryResult(dictResult.data),
            confidence: 0.9,
            sources: ["dictionary_api"],
            type: "definition",
          }
        }
      }

      // Try Wikipedia for general knowledge
      const wikiResult = await this.lookupWikipedia(searchTerm)
      if (wikiResult.found) {
        return {
          response: this.formatWikipediaResult(wikiResult.data, type),
          confidence: 0.8,
          sources: ["wikipedia"],
          type: type as any,
          relatedTopics: this.extractRelatedTopics(wikiResult.data),
        }
      }

      return {
        response: "I couldn't find reliable information about that online.",
        confidence: 0.3,
        sources: ["online_search"],
        type: type as any,
      }
    } catch (error) {
      console.error("❌ KnowledgeEngine: Online search error:", error)
      return {
        response: "I encountered an error while searching online.",
        confidence: 0.1,
        sources: ["online_error"],
        type: type as any,
      }
    }
  }

  private async lookupDictionary(word: string): Promise<OnlineLookupResult> {
    try {
      const response = await fetch(`${this.onlineSources.get("dictionary")}${encodeURIComponent(word)}`)

      if (response.ok) {
        const data = await response.json()
        return {
          found: true,
          data: data[0],
          source: "dictionary",
        }
      }

      return {
        found: false,
        source: "dictionary",
        error: `HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        found: false,
        source: "dictionary",
        error: error.message,
      }
    }
  }

  private async lookupWikipedia(term: string): Promise<OnlineLookupResult> {
    try {
      const response = await fetch(`${this.onlineSources.get("wikipedia")}${encodeURIComponent(term)}`)

      if (response.ok) {
        const data = await response.json()
        return {
          found: true,
          data,
          source: "wikipedia",
        }
      }

      return {
        found: false,
        source: "wikipedia",
        error: `HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        found: false,
        source: "wikipedia",
        error: error.message,
      }
    }
  }

  private extractSearchTerm(input: string): string {
    // Remove common question words and extract the main term
    const cleaned = input
      .toLowerCase()
      .replace(/^(what is|define|explain|tell me about|what does|how does)\s+/i, "")
      .replace(/\?$/, "")
      .trim()

    // Take the first few words as the search term
    return cleaned.split(" ").slice(0, 3).join(" ")
  }

  private formatLocalResult(result: any, type: string): string {
    switch (result.type) {
      case "vocabulary":
        return `${result.data.word}: ${result.data.definition}`
      case "mathematics":
        return `${result.data.concept}: ${result.data.formula || "Mathematical concept"}`
      case "facts":
        return result.data.fact
      default:
        return result.data.toString()
    }
  }

  private formatDictionaryResult(data: any): string {
    const word = data.word
    const meanings = data.meanings || []

    if (meanings.length > 0) {
      const firstMeaning = meanings[0]
      const definition = firstMeaning.definitions[0]?.definition || "No definition available"
      const partOfSpeech = firstMeaning.partOfSpeech || ""

      return `${word} (${partOfSpeech}): ${definition}`
    }

    return `${word}: Definition not available`
  }

  private formatWikipediaResult(data: any, type: string): string {
    const title = data.title || "Unknown"
    const extract = data.extract || "No summary available"

    switch (type) {
      case "definition":
        return `${title}: ${extract.split(".")[0]}.`
      case "explanation":
        return `${title}: ${extract}`
      case "concept":
        return `About ${title}: ${extract}`
      default:
        return extract
    }
  }

  private extractRelatedTopics(data: any): string[] {
    // Extract related topics from Wikipedia data
    const topics: string[] = []

    if (data.links) {
      topics.push(...data.links.slice(0, 5))
    }

    return topics
  }

  private findRelatedTopics(input: string): string[] {
    // Find related topics from local knowledge
    const searchResults = this.knowledgeManager.searchKnowledge(input)
    return searchResults.slice(1, 4).map((result) => result.type)
  }

  private async learnFromOnlineResult(input: string, result: KnowledgeResult): Promise<void> {
    // Store the learned knowledge for future use
    console.log(`📚 KnowledgeEngine: Learning from online result for "${input}"`)
    // This would integrate with the knowledge manager to store new knowledge
  }

  public getStatus(): any {
    return {
      initialized: true,
      cacheSize: this.cache.size,
      onlineSourcesAvailable: this.onlineSources.size,
      onlineLearningEnabled: SystemConfig.LEARNING_SETTINGS.ONLINE_LEARNING_ENABLED,
    }
  }
}
