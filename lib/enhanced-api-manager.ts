export class EnhancedAPIManager {
  private apiSources: Map<string, any> = new Map()
  private rateLimits: Map<string, number> = new Map()
  private lastCalled: Map<string, number> = new Map()

  constructor() {
    this.initializeAPISources()
    this.initializeRateLimits()
  }

  private initializeAPISources(): void {
    // Dictionary APIs
    this.apiSources.set("dictionary", {
      primary: {
        url: "https://api.dictionaryapi.dev/api/v2/entries/en/",
        timeout: 5000,
        rateLimit: 100, // ms between calls
      },
      fallback1: {
        url: "https://en.wiktionary.org/api/rest_v1/page/definition/",
        timeout: 5000,
        rateLimit: 200,
      },
    })

    // Math APIs
    this.apiSources.set("math", {
      primary: {
        url: "https://api.mathjs.org/v4/",
        timeout: 5000,
        rateLimit: 100,
      },
      fallback1: {
        url: "https://newton.now.sh/api/v2/",
        timeout: 5000,
        rateLimit: 200,
      },
    })

    // Science APIs
    this.apiSources.set("science", {
      primary: {
        url: "https://en.wikipedia.org/api/rest_v1/page/summary/",
        timeout: 5000,
        rateLimit: 100,
      },
      fallback1: {
        url: "https://api.nasa.gov/planetary/apod",
        timeout: 5000,
        rateLimit: 1000,
      },
    })

    // Coding APIs
    this.apiSources.set("coding", {
      primary: {
        url: "https://api.github.com/search/repositories",
        timeout: 5000,
        rateLimit: 200,
      },
      fallback1: {
        url: "https://api.stackexchange.com/2.3/search",
        timeout: 5000,
        rateLimit: 300,
      },
    })
  }

  private initializeRateLimits(): void {
    this.rateLimits.set("dictionary", 100)
    this.rateLimits.set("math", 100)
    this.rateLimits.set("science", 100)
    this.rateLimits.set("coding", 200)
  }

  private async enforceRateLimit(category: string): Promise<void> {
    const limit = this.rateLimits.get(category) || 100
    const lastCall = this.lastCalled.get(category) || 0
    const timeSinceLastCall = Date.now() - lastCall

    if (timeSinceLastCall < limit) {
      const waitTime = limit - timeSinceLastCall
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastCalled.set(category, Date.now())
  }

  public async callAPIWithFallback(category: string, query: string, customProcessor?: Function): Promise<any> {
    const sources = this.apiSources.get(category)
    if (!sources) {
      throw new Error(`No API sources configured for category: ${category}`)
    }

    const apiKeys = Object.keys(sources)

    for (const key of apiKeys) {
      try {
        await this.enforceRateLimit(category)

        const apiConfig = sources[key]
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

        console.log(`🔍 Trying ${category} API: ${key}`)

        const response = await fetch(`${apiConfig.url}${encodeURIComponent(query)}`, {
          signal: controller.signal,
          headers: {
            "User-Agent": "ZacAI/2.0 Educational Assistant",
            Accept: "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${category} API ${key} succeeded`)

          // Apply custom processor if provided
          return customProcessor ? customProcessor(data, key) : data
        } else {
          console.warn(`⚠️ ${category} API ${key} returned ${response.status}`)
        }
      } catch (error) {
        console.warn(`❌ ${category} API ${key} failed:`, error)
        // Continue to next API
      }
    }

    throw new Error(`All ${category} APIs failed`)
  }

  public async lookupWord(word: string): Promise<any> {
    return this.callAPIWithFallback("dictionary", word, (data, source) => {
      if (source === "primary") {
        // Free Dictionary API format
        const wordData = data[0]
        return {
          word: wordData.word,
          phonetics: wordData.phonetics || [],
          meanings: wordData.meanings || [],
          sourceUrl: wordData.sourceUrls?.[0] || "",
          source: "Free Dictionary API",
          learned: true,
          timestamp: Date.now(),
        }
      } else if (source === "fallback1") {
        // Wiktionary API format
        return {
          word: word,
          meanings: data.definitions || [],
          source: "Wiktionary API",
          learned: true,
          timestamp: Date.now(),
        }
      }
      return data
    })
  }

  public async lookupScientificConcept(concept: string): Promise<any> {
    return this.callAPIWithFallback("science", concept, (data, source) => {
      if (source === "primary") {
        // Wikipedia API format
        return {
          title: data.title,
          extract: data.extract,
          url: data.content_urls?.desktop?.page || "",
          type: "scientific_concept",
          source: "Wikipedia API",
          learned: true,
          timestamp: Date.now(),
        }
      } else if (source === "fallback1") {
        // NASA API format
        return {
          title: data.title || concept,
          extract: data.explanation || "NASA data available",
          url: data.url || "",
          type: "scientific_concept",
          source: "NASA API",
          learned: true,
          timestamp: Date.now(),
        }
      }
      return data
    })
  }

  public async lookupMathConcept(expression: string): Promise<any> {
    return this.callAPIWithFallback("math", expression, (data, source) => {
      if (source === "primary") {
        // MathJS API format
        return {
          expression,
          result: data.result || data,
          method: "mathjs_api",
          source: "MathJS API",
          learned: true,
          timestamp: Date.now(),
        }
      } else if (source === "fallback1") {
        // Newton API format
        return {
          expression,
          result: data.result || data,
          method: "newton_api",
          source: "Newton API",
          learned: true,
          timestamp: Date.now(),
        }
      }
      return data
    })
  }

  public async lookupCodingConcept(concept: string, language = "javascript"): Promise<any> {
    const query = `${concept} ${language}`
    return this.callAPIWithFallback("coding", query, (data, source) => {
      if (source === "primary") {
        // GitHub API format
        const repo = data.items?.[0]
        return {
          concept,
          language,
          description: repo?.description || "GitHub repository found",
          url: repo?.html_url || "",
          source: "GitHub API",
          learned: true,
          timestamp: Date.now(),
        }
      } else if (source === "fallback1") {
        // Stack Overflow API format
        const question = data.items?.[0]
        return {
          concept,
          language,
          description: question?.title || "Stack Overflow discussion found",
          url: question?.link || "",
          source: "Stack Overflow API",
          learned: true,
          timestamp: Date.now(),
        }
      }
      return data
    })
  }

  public getAPIStatus(): any {
    return {
      availableCategories: Array.from(this.apiSources.keys()),
      rateLimits: Object.fromEntries(this.rateLimits),
      lastCalled: Object.fromEntries(this.lastCalled),
      totalAPIs: Array.from(this.apiSources.values()).reduce(
        (total, sources) => total + Object.keys(sources).length,
        0,
      ),
    }
  }
}
