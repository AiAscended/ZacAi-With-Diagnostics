// lib/modules/vocabulary-module.ts
import type { IKnowledgeModule, KnowledgeEntry, QueryResult } from "@/lib/types"
import StorageManager from "@/lib/storage-manager"

export class VocabularyModule implements IKnowledgeModule {
  public name = "Vocabulary"
  private knowledge = new Map<string, KnowledgeEntry>()
  private storageManager = new StorageManager()

  async initialize(): Promise<void> {
    const seedData = await this.storageManager.loadJSON("/seed_vocab.json")
    const rawLearnedData = this.storageManager.loadData("learnt_vocabulary")

    // Handle both old object format and new array format
    const words = seedData?.words || []
    if (Array.isArray(words)) {
      words.forEach((item: any) => {
        this.knowledge.set(item.word, { ...item, source: "seed" })
      })
    }

    const learnedData = Array.isArray(rawLearnedData) ? rawLearnedData : rawLearnedData?.words || []
    if (Array.isArray(learnedData)) {
      learnedData.forEach((item: any) => {
        this.knowledge.set(item.word, { ...item, source: "learned" })
      })
    }
  }

  getKnowledge(): Map<string, KnowledgeEntry> {
    return this.knowledge
  }

  private async fetchWordDefinition(word: string): Promise<any | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (!response.ok) return null
      const data = await response.json()
      return data[0] // Return the first result
    } catch (error) {
      console.error("Failed to fetch word definition:", error)
      return null
    }
  }

  private saveLearnedWord(word: string, definitionData: any) {
    const newEntry: KnowledgeEntry = {
      word: word,
      definition: definitionData.meanings[0]?.definitions[0]?.definition || "No definition found.",
      phonetic: definitionData.phonetic || "N/A",
      partOfSpeech: definitionData.meanings[0]?.partOfSpeech || "N/A",
      source: "learned",
      timestamp: Date.now(),
    }
    this.knowledge.set(word, newEntry)

    const currentLearned = Array.from(this.knowledge.values()).filter((v) => v.source === "learned")
    this.storageManager.saveData("learnt_vocabulary", currentLearned)
  }

  async query(input: string): Promise<QueryResult | null> {
    const reasoning: string[] = []
    reasoning.push(`[Vocab] Analyzing input: "${input}"`)

    const defineRegex = /^(define|what is the meaning of)\s+(.*)/i
    const match = input.match(defineRegex)
    const wordToDefine = (match ? match[2] : input)
      .trim()
      .toLowerCase()
      .replace(/[?.!]$/, "")

    reasoning.push(`[Vocab] Identified word to define: "${wordToDefine}"`)

    if (this.knowledge.has(wordToDefine)) {
      const entry = this.knowledge.get(wordToDefine)!
      reasoning.push(`[Vocab] Found "${wordToDefine}" in existing knowledge base (source: ${entry.source}).`)
      return {
        answer: `**${entry.word}** (${entry.partOfSpeech}): ${entry.definition}`,
        confidence: 0.99,
        reasoning,
      }
    }

    reasoning.push(`[Vocab] Word not in local knowledge. Querying online dictionary...`)
    const onlineDefinition = await this.fetchWordDefinition(wordToDefine)

    if (onlineDefinition) {
      reasoning.push(`[Vocab] Successfully fetched definition online. Saving to learned knowledge.`)
      this.saveLearnedWord(wordToDefine, onlineDefinition)
      const newEntry = this.knowledge.get(wordToDefine)!
      return {
        answer: `I've just learned this word!\n\n**${newEntry.word}** (${newEntry.partOfSpeech}): ${newEntry.definition}`,
        confidence: 0.9,
        reasoning,
      }
    }

    reasoning.push(`[Vocab] Could not find a definition locally or online.`)
    return null
  }
}
