// lib/modules/vocabulary-module.ts
import type { IKnowledgeModule, VocabularyEntry } from "@/lib/types"
import { StorageManager } from "@/lib/storage-manager"

interface SeedVocabFile {
  words: VocabularyEntry[]
}

export class VocabularyModule implements IKnowledgeModule {
  public name = "Vocabulary"
  private storage = new StorageManager()
  private seedVocabulary: Map<string, VocabularyEntry> = new Map()
  private learnedVocabulary: Map<string, VocabularyEntry> = new Map()

  async initialize(): Promise<void> {
    // Load seed data
    const seedData = await this.storage.loadSeedData<SeedVocabFile>("seed_vocab.json")
    if (seedData && Array.isArray(seedData.words)) {
      seedData.words.forEach((entry) => {
        this.seedVocabulary.set(entry.word.toLowerCase(), { ...entry, source: "seed", timestamp: Date.now() })
      })
    }

    // Load learned data (robustly)
    const learnedData = this.storage.loadLearnedData<any>("learnt_vocab.json")
    if (learnedData) {
      const learnedArray = Array.isArray(learnedData) ? learnedData : Object.values(learnedData)
      learnedArray.forEach((entry: VocabularyEntry) => {
        if (entry && entry.word) {
          this.learnedVocabulary.set(entry.word.toLowerCase(), entry)
        }
      })
    }
    console.log(
      `📚 Vocabulary Module initialized with ${this.seedVocabulary.size} seed words and ${this.learnedVocabulary.size} learned words.`,
    )
  }

  getKnowledge(): Map<string, VocabularyEntry> {
    return new Map([...this.seedVocabulary, ...this.learnedVocabulary])
  }

  async findTerm(term: string): Promise<VocabularyEntry | null> {
    const lowerTerm = term.toLowerCase()
    if (this.learnedVocabulary.has(lowerTerm)) {
      return this.learnedVocabulary.get(lowerTerm) ?? null
    }
    if (this.seedVocabulary.has(lowerTerm)) {
      return this.seedVocabulary.get(lowerTerm) ?? null
    }
    return this.lookupAndLearn(term)
  }

  private async lookupAndLearn(term: string): Promise<VocabularyEntry | null> {
    console.log(`🌐 Looking up new word: ${term}`)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`)
      if (!response.ok) return null

      const data = await response.json()
      const entry = data[0]
      if (!entry) return null

      const newEntry: VocabularyEntry = {
        word: entry.word,
        definition: entry.meanings[0]?.definitions[0]?.definition || "No definition found.",
        part_of_speech: entry.meanings[0]?.partOfSpeech || "N/A",
        examples: entry.meanings[0]?.definitions[0]?.example ? [entry.meanings[0]?.definitions[0]?.example] : [],
        phonetic: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text,
        synonyms: entry.meanings[0]?.synonyms || [],
        antonyms: entry.meanings[0]?.antonyms || [],
        source: "learned",
        timestamp: Date.now(),
      }

      this.learnedVocabulary.set(term.toLowerCase(), newEntry)
      // Save the entire map of learned words correctly
      this.storage.saveLearnedData("learnt_vocab.json", Object.fromEntries(this.learnedVocabulary))
      console.log(`✅ Learned and saved new word: ${term}`)
      return newEntry
    } catch (error) {
      console.error(`Failed to look up word ${term}:`, error)
      return null
    }
  }
}
