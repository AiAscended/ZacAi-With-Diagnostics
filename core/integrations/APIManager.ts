import { SystemConfig } from "../system/config"

export interface APIResponse {
  success: boolean
  data?: any
  error?: string
  source: string
  timestamp: number
}

export class APIManager {
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  constructor() {
    console.log("🌐 APIManager: Initializing...")
  }

  public async initialize(): Promise<void> {
    console.log("✅ APIManager: Initialized successfully")
  }

  public async lookupWord(word: string): Promise<APIResponse> {
    const cacheKey = `word_${word.toLowerCase()}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { success: true, data: cached, source: "cache", timestamp: Date.now() }
    }

    if (!this.checkRateLimit("dictionary")) {
      return { success: false, error: "Rate limit exceeded", source: "dictionary", timestamp: Date.now() }
    }

    try {
      const response = await fetch(`${SystemConfig.APIS.DICTIONARY}${encodeURIComponent(word)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const wordData = {
          word: data[0].word,
          phonetic: data[0].phonetic || "",
          meanings:
            data[0].meanings?.map((meaning: any) => ({
              partOfSpeech: meaning.partOfSpeech,
              definitions:
                meaning.definitions?.slice(0, 3).map((def: any) => ({
                  definition: def.definition,
                  example: def.example || "",
                })) || [],
            })) || [],
        }

        this.setCache(cacheKey, wordData, 24 * 60 * 60 * 1000) // 24 hours
        return { success: true, data: wordData, source: "dictionary", timestamp: Date.now() }
      }

      return { success: false, error: "Word not found", source: "dictionary", timestamp: Date.now() }
    } catch (error) {
      console.error("Dictionary API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "dictionary",
        timestamp: Date.now(),
      }
    }
  }

  public async getSynonyms(word: string): Promise<APIResponse> {
    const cacheKey = `synonyms_${word.toLowerCase()}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { success: true, data: cached, source: "cache", timestamp: Date.now() }
    }

    if (!this.checkRateLimit("thesaurus")) {
      return { success: false, error: "Rate limit exceeded", source: "thesaurus", timestamp: Date.now() }
    }

    try {
      const response = await fetch(`${SystemConfig.APIS.THESAURUS}${encodeURIComponent(word)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const synonyms = data.slice(0, 10).map((item: any) => item.word)

      this.setCache(cacheKey, synonyms, 24 * 60 * 60 * 1000) // 24 hours
      return { success: true, data: synonyms, source: "thesaurus", timestamp: Date.now() }
    } catch (error) {
      console.error("Thesaurus API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "thesaurus",
        timestamp: Date.now(),
      }
    }
  }

  public async getWikipediaSummary(topic: string): Promise<APIResponse> {
    const cacheKey = `wiki_${topic.toLowerCase().replace(/\s+/g, "_")}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { success: true, data: cached, source: "cache", timestamp: Date.now() }
    }

    if (!this.checkRateLimit("wikipedia")) {
      return { success: false, error: "Rate limit exceeded", source: "wikipedia", timestamp: Date.now() }
    }

    try {
      const response = await fetch(`${SystemConfig.APIS.WIKIPEDIA}${encodeURIComponent(topic)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const summary = {
        title: data.title,
        extract: data.extract,
        url: data.content_urls?.desktop?.page || "",
        thumbnail: data.thumbnail?.source || "",
      }

      this.setCache(cacheKey, summary, 7 * 24 * 60 * 60 * 1000) // 7 days
      return { success: true, data: summary, source: "wikipedia", timestamp: Date.now() }
    } catch (error) {
      console.error("Wikipedia API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "wikipedia",
        timestamp: Date.now(),
      }
    }
  }

  public async evaluateMathExpression(expression: string): Promise<APIResponse> {
    const cacheKey = `math_${expression.replace(/\s+/g, "")}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { success: true, data: cached, source: "cache", timestamp: Date.now() }
    }

    if (!this.checkRateLimit("math")) {
      return { success: false, error: "Rate limit exceeded", source: "math", timestamp: Date.now() }
    }

    try {
      const response = await fetch(SystemConfig.APIS.MATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expr: expression }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const result = {
        expression,
        result: data.result,
        error: data.error || null,
      }

      if (!result.error) {
        this.setCache(cacheKey, result, 60 * 60 * 1000) // 1 hour
      }

      return { success: !result.error, data: result, source: "math", timestamp: Date.now() }
    } catch (error) {
      console.error("Math API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "math",
        timestamp: Date.now(),
      }
    }
  }

  private checkRateLimit(service: string): boolean {
    const now = Date.now()
    const limit = this.rateLimits.get(service)

    if (!limit || now > limit.resetTime) {
      // Reset or initialize rate limit
      this.rateLimits.set(service, {
        count: 1,
        resetTime: now + 60000, // 1 minute window
      })
      return true
    }

    if (limit.count >= 10) {
      // 10 requests per minute
      return false
    }

    limit.count++
    return true
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // Clean up old cache entries
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      // Remove oldest 100 entries
      for (let i = 0; i < 100; i++) {
        this.cache.delete(entries[i][0])
      }
    }
  }

  public clearCache(): void {
    this.cache.clear()
    console.log("🗑️ API cache cleared")
  }

  public getStats(): any {
    return {
      cacheSize: this.cache.size,
      rateLimits: Object.fromEntries(this.rateLimits),
      services: Object.keys(SystemConfig.APIS),
    }
  }
}
