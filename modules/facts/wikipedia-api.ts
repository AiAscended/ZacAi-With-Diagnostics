import { apiManager } from "@/core/api/manager"
import type { FactEntry } from "@/types/modules"

export class WikipediaAPI {
  private baseUrl = "https://en.wikipedia.org/api/rest_v1/page/summary"
  private searchUrl = "https://en.wikipedia.org/w/api.php"

  async lookupTopic(topic: string): Promise<FactEntry | null> {
    try {
      const cacheKey = `wiki_${topic.toLowerCase().replace(/\s+/g, "_")}`

      // First try direct page lookup
      const directUrl = `${this.baseUrl}/${encodeURIComponent(topic)}`

      try {
        const response = await apiManager.makeRequest(directUrl, {}, cacheKey, 86400000) // 24 hour cache

        if (response && response.extract) {
          return this.formatWikipediaResponse(topic, response)
        }
      } catch (error) {
        console.log(`Direct lookup failed for "${topic}", trying search...`)
      }

      // If direct lookup fails, try search
      const searchResult = await this.searchTopic(topic)
      if (searchResult) {
        return await this.lookupTopic(searchResult)
      }

      return null
    } catch (error) {
      console.error(`Wikipedia lookup failed for "${topic}":`, error)
      return null
    }
  }

  private async searchTopic(query: string): Promise<string | null> {
    try {
      const searchParams = new URLSearchParams({
        action: "query",
        format: "json",
        list: "search",
        srsearch: query,
        srlimit: "1",
        origin: "*",
      })

      const searchUrl = `${this.searchUrl}?${searchParams}`
      const cacheKey = `wiki_search_${query.toLowerCase().replace(/\s+/g, "_")}`

      const response = await apiManager.makeRequest(searchUrl, {}, cacheKey, 3600000) // 1 hour cache

      if (response?.query?.search?.[0]?.title) {
        return response.query.search[0].title
      }

      return null
    } catch (error) {
      console.error(`Wikipedia search failed for "${query}":`, error)
      return null
    }
  }

  private formatWikipediaResponse(topic: string, response: any): FactEntry {
    return {
      topic: topic,
      content: response.extract || response.description || "No description available",
      source: "wikipedia",
      category: this.categorizeContent(response.extract || ""),
      verified: true,
      lastUpdated: Date.now(),
      relatedTopics: this.extractRelatedTopics(response.extract || ""),
    }
  }

  private categorizeContent(content: string): string {
    const lowerContent = content.toLowerCase()

    if (
      lowerContent.includes("science") ||
      lowerContent.includes("scientific") ||
      lowerContent.includes("research") ||
      lowerContent.includes("study")
    ) {
      return "science"
    }

    if (
      lowerContent.includes("history") ||
      lowerContent.includes("historical") ||
      lowerContent.includes("ancient") ||
      lowerContent.includes("century")
    ) {
      return "history"
    }

    if (
      lowerContent.includes("technology") ||
      lowerContent.includes("computer") ||
      lowerContent.includes("digital") ||
      lowerContent.includes("software")
    ) {
      return "technology"
    }

    if (
      lowerContent.includes("nature") ||
      lowerContent.includes("animal") ||
      lowerContent.includes("plant") ||
      lowerContent.includes("species")
    ) {
      return "nature"
    }

    if (
      lowerContent.includes("space") ||
      lowerContent.includes("planet") ||
      lowerContent.includes("star") ||
      lowerContent.includes("galaxy")
    ) {
      return "astronomy"
    }

    if (
      lowerContent.includes("mathematics") ||
      lowerContent.includes("equation") ||
      lowerContent.includes("formula") ||
      lowerContent.includes("theorem")
    ) {
      return "mathematics"
    }

    return "general"
  }

  private extractRelatedTopics(content: string): string[] {
    const topics: string[] = []

    // Extract capitalized words that might be related topics
    const capitalizedWords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []

    // Filter out common words and take first 5
    const filteredTopics = capitalizedWords.filter((word) => !this.isCommonWord(word)).slice(0, 5)

    topics.push(...filteredTopics)

    return [...new Set(topics)] // Remove duplicates
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      "The",
      "This",
      "That",
      "These",
      "Those",
      "A",
      "An",
      "And",
      "Or",
      "But",
      "In",
      "On",
      "At",
      "To",
      "For",
      "Of",
      "With",
      "By",
      "From",
      "About",
      "Into",
      "Through",
      "During",
      "Before",
      "After",
      "Above",
      "Below",
      "Up",
      "Down",
      "Out",
      "Off",
      "Over",
      "Under",
      "Again",
      "Further",
      "Then",
      "Once",
      "Here",
      "There",
      "When",
      "Where",
      "Why",
      "How",
      "All",
      "Any",
      "Both",
      "Each",
      "Few",
      "More",
      "Most",
      "Other",
      "Some",
      "Such",
      "No",
      "Nor",
      "Not",
      "Only",
      "Own",
      "Same",
      "So",
      "Than",
      "Too",
      "Very",
      "Can",
      "Will",
      "Just",
      "Should",
      "Now",
    ]

    return commonWords.includes(word)
  }

  async getRandomFact(): Promise<FactEntry | null> {
    try {
      const randomUrl = "https://en.wikipedia.org/api/rest_v1/page/random/summary"
      const response = await apiManager.makeRequest(randomUrl, {}, undefined, 0) // No cache for random

      if (response && response.extract) {
        return this.formatWikipediaResponse(response.title, response)
      }

      return null
    } catch (error) {
      console.error("Failed to get random Wikipedia fact:", error)
      return null
    }
  }
}

export const wikipediaAPI = new WikipediaAPI()
