export class EnhancedAPIManager {
  private apiStatus: Map<string, any> = new Map()
  private rateLimitDelay = 200 // ms between requests
  private baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/"

  constructor() {
    this.initializeAPIStatus()
    console.log("🌐 Enhanced API Manager initialized.")
  }

  private initializeAPIStatus(): void {
    // Dictionary APIs
    this.apiStatus.set("dictionary_primary", {
      url: "https://api.dictionaryapi.dev/api/v2/entries/en/",
      status: "available",
      lastUsed: 0,
      failures: 0,
    })
    this.apiStatus.set("dictionary_fallback1", {
      url: "https://en.wiktionary.org/api/rest_v1/page/definition/",
      status: "available",
      lastUsed: 0,
      failures: 0,
    })

    // Math APIs
    this.apiStatus.set("math_primary", {
      url: "https://api.mathjs.org/v4/",
      status: "available",
      lastUsed: 0,
      failures: 0,
    })

    // Science APIs
    this.apiStatus.set("science_primary", {
      url: "https://en.wikipedia.org/api/rest_v1/page/summary/",
      status: "available",
      lastUsed: 0,
      failures: 0,
    })

    // Coding APIs
    this.apiStatus.set("coding_primary", {
      url: "https://api.github.com/search/repositories",
      status: "available",
      lastUsed: 0,
      failures: 0,
    })
  }

  // Enhanced Dictionary Lookup with Fallbacks
  public async lookupWord(word: string): Promise<any> {
    const apis = [
      {
        name: "Free Dictionary API",
        url: `${this.baseUrl}${word}`,
        parser: this.parseDictionaryAPI.bind(this),
      },
    ]

    for (const api of apis) {
      try {
        await this.rateLimitCheck()

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "ZacAI/2.0.0",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const parsed = api.parser(data, word)

          this.updateAPIStatus(api.name, true)
          console.log(`✅ ${api.name} lookup successful for: ${word}`)
          return parsed
        } else if (response.status === 404) {
          console.log(`[API] No definition found for "${word}".`)
          return null
        }
      } catch (error) {
        console.warn(`${api.name} failed for "${word}":`, error)
        this.updateAPIStatus(api.name, false)
      }
    }

    throw new Error(`All dictionary APIs failed for word: ${word}`)
  }

  // Math Concept Lookup
  public async lookupMathConcept(expression: string): Promise<any> {
    try {
      // For now, return enhanced local processing
      // This can be expanded with actual math APIs later
      return {
        expression,
        method: "enhanced_local_processing",
        source: "ZacAI Math Engine",
        confidence: 0.8,
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error(`Math concept lookup failed: ${error}`)
    }
  }

  // Science Concept Lookup with Wikipedia
  public async lookupScientificConcept(concept: string): Promise<any> {
    try {
      await this.rateLimitCheck()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(concept)}`
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "ZacAI/2.0.0",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()

        const parsed = {
          title: data.title,
          extract: data.extract,
          url: data.content_urls?.desktop?.page || "",
          type: "scientific_concept",
          source: "Wikipedia",
          confidence: 0.85,
          timestamp: Date.now(),
        }

        this.updateAPIStatus("Wikipedia", true)
        console.log(`✅ Wikipedia lookup successful for: ${concept}`)
        return parsed
      }
    } catch (error) {
      console.warn(`Wikipedia lookup failed for "${concept}":`, error)
      this.updateAPIStatus("Wikipedia", false)
    }

    throw new Error(`Science concept lookup failed for: ${concept}`)
  }

  // Coding Concept Lookup
  public async lookupCodingConcept(concept: string, language = "javascript"): Promise<any> {
    try {
      // For now, return structured response based on concept and language
      // This can be expanded with actual coding APIs later
      const codingData = {
        concept: concept,
        language: language,
        description: `Information about ${concept} in ${language}`,
        source: "ZacAI Coding Knowledge",
        url: this.generateDocumentationURL(concept, language),
        confidence: 0.7,
        timestamp: Date.now(),
      }

      console.log(`✅ Coding concept processed: ${concept} (${language})`)
      return codingData
    } catch (error) {
      throw new Error(`Coding concept lookup failed: ${error}`)
    }
  }

  private generateDocumentationURL(concept: string, language: string): string {
    const baseUrls = {
      javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      react: "https://react.dev/reference",
      nextjs: "https://nextjs.org/docs",
      typescript: "https://www.typescriptlang.org/docs",
    }

    return baseUrls[language as keyof typeof baseUrls] || baseUrls.javascript
  }

  private parseDictionaryAPI(data: any, word: string): any {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid dictionary API response")
    }

    const wordData = data[0]

    return {
      word: wordData.word || word,
      phonetics: wordData.phonetics || [],
      meanings: wordData.meanings || [],
      synonyms: [],
      sourceUrl: wordData.sourceUrls?.[0] || "",
      source: "Free Dictionary API",
      confidence: 0.9,
      timestamp: Date.now(),
    }
  }

  private async rateLimitCheck(): Promise<void> {
    const now = Date.now()
    const lastRequest = this.apiStatus.get("last_request") || 0
    const timeSinceLastRequest = now - lastRequest

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.apiStatus.set("last_request", Date.now())
  }

  private updateAPIStatus(apiName: string, success: boolean): void {
    const status = this.apiStatus.get(apiName) || { failures: 0, lastUsed: 0 }

    if (success) {
      status.failures = 0
      status.status = "available"
    } else {
      status.failures += 1
      if (status.failures >= 3) {
        status.status = "temporarily_unavailable"
      }
    }

    status.lastUsed = Date.now()
    this.apiStatus.set(apiName, status)
  }

  public getAPIStatus(): any {
    const totalAPIs = this.apiStatus.size
    const availableAPIs = Array.from(this.apiStatus.values()).filter((api) => api.status === "available").length

    return {
      totalAPIs,
      availableAPIs,
      unavailableAPIs: totalAPIs - availableAPIs,
      lastUpdate: Date.now(),
      details: Object.fromEntries(this.apiStatus),
    }
  }
}
