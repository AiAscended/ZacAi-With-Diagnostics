import type { IKnowledgeModule, VocabularyWord } from "../types"
import { StorageManager } from "../storage-manager"

interface SeedVocabFile {
  words: VocabularyWord[]
}

export class VocabularyModule implements IKnowledgeModule {
  public name = "Vocabulary"
  private knowledge: Map<string, VocabularyWord & { source: string }> = new Map()
  private storage = new StorageManager()
  private dictionaryApiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/"

  async initialize(): Promise<void> {
    console.log("Initializing Vocabulary Module...")
    // Load seed data
    const seedData = await this.storage.loadSeedData<SeedVocabFile>("seed_vocab.json")
    if (seedData && seedData.words) {
      seedData.words.forEach((word) => {
        this.knowledge.set(word.word.toLowerCase(), { ...word, source: "seed" })
      })
    }

    // Load learned data
    const learnedData = this.storage.loadLearnedData<VocabularyWord[]>("learnt_vocab.json")
    if (learnedData) {
      learnedData.forEach((word) => {
        this.knowledge.set(word.word.toLowerCase(), { ...word, source: "learned" })
      })
    }
    console.log(`Vocabulary Module initialized with ${this.knowledge.size} terms.`)
  }

  getKnowledge(): Map<string, any> {
    return this.knowledge
  }

  public async findTerm(term: string): Promise<(VocabularyWord & { source: string }) | null> {
    const lowerTerm = term.toLowerCase()
    if (this.knowledge.has(lowerTerm)) {
      console.log(`Found "${term}" in local knowledge base.`)
      return this.knowledge.get(lowerTerm) || null
    }

    console.log(`"${term}" not in local knowledge, querying online dictionary...`)
    return await this.lookupAndLearn(term)
  }

  private async lookupAndLearn(term: string): Promise<(VocabularyWord & { source: string }) | null> {
    try {
      const response = await fetch(`${this.dictionaryApiUrl}${term}`)
      if (!response.ok) {
        console.error(`Dictionary API returned status: ${response.status}`)
        return null
      }
      const data = await response.json()

      if (data.title === "No Definitions Found") {
        console.log(`No definition found for "${term}" via API.`)
        return null
      }

      // Find the first valid definition
      const entry = data[0]
      const meaning = entry.meanings[0]
      const definition = meaning.definitions[0]

      const newWord: VocabularyWord = {
        word: entry.word,
        part_of_speech: meaning.partOfSpeech,
        definition: definition.definition,
        example: definition.example || "No example available.",
      }

      console.log(`Successfully looked up "${term}". Learning and saving.`)
      this.knowledge.set(newWord.word.toLowerCase(), { ...newWord, source: "learned-api" })

      // Save to learned data
      const allLearnedWords = Array.from(this.knowledge.values())
        .filter((v) => v.source.startsWith("learned"))
        .map(({ source, ...rest }) => rest) // strip source before saving

      this.storage.saveLearnedData("learnt_vocab.json", allLearnedWords)

      return this.knowledge.get(newWord.word.toLowerCase()) || null
    } catch (error) {
      console.error(`Error during dictionary lookup for "${term}":`, error)
      return null
    }
  }
}
