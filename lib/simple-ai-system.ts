import axios from "axios"
import fs from "fs/promises"
import path from "path"

interface WordDefinition {
  definition: string
  partOfSpeech: string
}

interface VocabularyEntry {
  definition: string
  partOfSpeech: string
  learnedAt: number
  frequency: number
  context: string
}

interface LearntVocabulary {
  words: { [word: string]: VocabularyEntry }
}

interface LearntData {
  vocabulary: LearntVocabulary
}

class SimpleAISystem {
  private learntDataDir = path.join(process.cwd(), ".learnt_data")
  private vocabulary: { [word: string]: WordDefinition } = {}

  constructor() {
    this.initialize().catch(console.error)
  }

  private async initialize() {
    await this.ensureLearntDataDirExists()
    await this.loadInitialVocabulary()
  }

  private async ensureLearntDataDirExists() {
    try {
      await fs.mkdir(this.learntDataDir, { recursive: true })
    } catch (error) {
      console.error("Error creating .learnt_data directory:", error)
    }
  }

  private async loadInitialVocabulary() {
    try {
      const filePath = path.join(this.learntDataDir, "vocabulary.json")
      await fs.access(filePath) // Check if the file exists
      const data = await fs.readFile(filePath, "utf8")
      const parsedData = JSON.parse(data) as LearntVocabulary
      this.vocabulary = parsedData.words || {}
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File doesn't exist, which is fine for the first run
        console.log("Vocabulary file not found, starting with an empty vocabulary.")
        this.vocabulary = {}
      } else {
        console.error("Error loading vocabulary:", error)
        this.vocabulary = {} // Ensure vocabulary is empty in case of an error
      }
    }
  }

  private async lookupWordDefinition(word: string): Promise<WordDefinition | null> {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      const data = response.data[0]
      if (data && data.meanings && data.meanings.length > 0) {
        const meaning = data.meanings[0]
        const definition = meaning.definitions[0].definition
        const partOfSpeech = meaning.partOfSpeech
        return { definition, partOfSpeech }
      }
      return null
    } catch (error) {
      console.error(`Error looking up definition for ${word}:`, error)
      return null
    }
  }

  private extractImportantWords(text: string): string[] {
    // Basic implementation: split by spaces and remove punctuation
    return text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2) // Filter out short words
  }

  private hasWord(word: string): boolean {
    return !!this.vocabulary[word.toLowerCase()]
  }

  public async processInput(userInput: string): Promise<string> {
    // Learn from the interaction
    const response = await this.generateResponse(userInput)
    await this.learnFromInteraction(userInput, response)
    return response
  }

  private async generateResponse(userInput: string): Promise<string> {
    // Basic implementation: echo the user input
    return `You said: ${userInput}`
  }

  private loadLearntData(dataType: string): any {
    try {
      const filePath = path.join(this.learntDataDir, `${dataType}.json`)
      if (!fs.existsSync(filePath)) {
        return {} // Return an empty object if the file doesn't exist
      }
      const data = fs.readFileSync(filePath, "utf8")
      return JSON.parse(data)
    } catch (error) {
      console.error(`Error loading ${dataType} data:`, error)
      return {} // Return an empty object in case of an error
    }
  }

  private saveLearntData(dataType: string, data: any): void {
    try {
      const filePath = path.join(this.learntDataDir, `${dataType}.json`)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`Error saving ${dataType} data:`, error)
    }
  }

  // In the learnFromInteraction method, ensure vocabulary is saved correctly
  private async learnFromInteraction(userInput: string, response: string) {
    try {
      // Extract and learn new vocabulary
      const words = this.extractImportantWords(userInput + " " + response)
      for (const word of words) {
        if (!this.hasWord(word)) {
          const definition = await this.lookupWordDefinition(word)
          if (definition) {
            // Save to learnt vocabulary
            const learntVocab = this.loadLearntData("vocabulary")
            learntVocab.words = learntVocab.words || {}
            learntVocab.words[word.toLowerCase()] = {
              definition,
              partOfSpeech: definition.partOfSpeech || "unknown",
              learnedAt: Date.now(),
              frequency: 1,
              context: userInput.substring(0, 100),
            }
            this.saveLearntData("vocabulary", learntVocab)
          }
        }
      }
    } catch (error) {
      console.error("Error learning from interaction:", error)
    }
  }
}

export default SimpleAISystem
