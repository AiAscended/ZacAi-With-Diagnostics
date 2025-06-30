export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  async makeRequest(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL = 300000, // 5 minutes default
  ): Promise<any> {
    // Use cache if available and not expired
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    // Prevent duplicate requests
    const requestKey = `${url}:${JSON.stringify(options)}`
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    const requestPromise = this.executeRequest(url, options)
    this.requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful results
      if (cacheKey && result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTTL,
        })
      }

      return result
    } catch (error) {
      console.error(`API request failed for ${url}:`, error)
      throw error
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  private async executeRequest(url: string, options: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ZacAI/1.0",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  // Dictionary API integration
  async lookupWord(word: string): Promise<any> {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    return this.makeRequest(url, {}, `dict_${word}`, 86400000) // 24 hour cache
  }

  // Thesaurus API integration
  async getThesaurus(word: string): Promise<any> {
    const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`
    return this.makeRequest(url, {}, `thes_${word}`, 86400000)
  }

  // Phonetics API integration
  async getPhonetics(word: string): Promise<any> {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    const result = await this.makeRequest(url, {}, `phon_${word}`, 86400000)

    if (result && result[0] && result[0].phonetics) {
      return result[0].phonetics
    }
    return null
  }

  // Wikipedia API integration
  async searchWikipedia(query: string, limit = 5): Promise<any> {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    return this.makeRequest(url, {}, `wiki_${query}`, 3600000) // 1 hour cache
  }

  // Math API integration (for complex calculations)
  async evaluateMath(expression: string): Promise<any> {
    try {
      // Use mathjs API for complex expressions
      const url = "https://api.mathjs.org/v4/"
      return this.makeRequest(
        url,
        {
          method: "POST",
          body: JSON.stringify({ expr: expression }),
        },
        `math_${expression}`,
        3600000,
      )
    } catch (error) {
      console.error("Math API error:", error)
      return null
    }
  }

  // News API integration (for facts)
  async getNews(query: string): Promise<any> {
    // Note: This would require an API key in production
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=5`
    return this.makeRequest(url, {}, `news_${query}`, 1800000) // 30 minute cache
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Clean expired cache entries
  cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiManager = new APIManager()

// Clean expired cache every 5 minutes
setInterval(() => {
  apiManager.cleanExpiredCache()
}, 300000)
