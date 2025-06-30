// lib/modules/vocabulary-module.ts
import type { IKnowledgeModule, VocabularyEntry } from "@/lib/types"
import { StorageManager } from "@/lib/storage-manager"

interface SeedVocabFile {
  words: VocabularyEntry[]
}

export class VocabularyModule implements IKnowledgeModule {
  public name = "Vocabulary"
  private storage = new StorageManager()
  private knowledge: Map<string, VocabularyEntry> = new Map()

  async initialize(): Promise<void> {
    const seedData = await this.storage.loadJSON<SeedVocabFile>("/seed_vocab.json")
    if (seedData && Array.isArray(seedData.words)) {
      seedData.words.forEach((entry) => {
        this.knowledge.set(entry.word.toLowerCase(), { ...entry, source: "seed", timestamp: Date.now() })
      })
    }

    const learnedData = this.storage.loadData<VocabularyEntry[]>("learnt_vocab.json")
    if (Array.isArray(learnedData)) {
      learnedData.forEach((entry) => {
        if (entry && entry.word) {
          this.knowledge.set(entry.word.toLowerCase(), entry)
        }
      })
    }
    console.log(`📚 Vocabulary Module initialized with ${this.knowledge.size} total words.`)
  }

  getKnowledge(): Map<string, VocabularyEntry> {
    return this.knowledge
  }

  async findTerm(term: string): Promise<VocabularyEntry | null> {
    const lowerTerm = term.toLowerCase()
    if (this.knowledge.has(lowerTerm)) {
      return this.knowledge.get(lowerTerm) ?? null
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

      this.knowledge.set(term.toLowerCase(), newEntry)
      const allLearnedWords = Array.from(this.knowledge.values()).filter((v) => v.source === "learned")
      this.storage.saveData("learnt_vocab.json", allLearnedWords)
      console.log(`✅ Learned and saved new word: ${term}`)
      return newEntry
    } catch (error) {
      console.error(`Failed to look up word ${term}:`, error)
      return null
    }
  }
}
