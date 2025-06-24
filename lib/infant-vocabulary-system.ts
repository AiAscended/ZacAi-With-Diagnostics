export interface CoreWord {
  word: string
  definition: string
  partOfSpeech: string
  difficulty: number // 1-10
  category: string
  examples: string[]
  phonetics: string
  frequency: number // How common the word is
  learned: boolean
  attempts: number
  correctUses: number
}

export interface VocabularyLevel {
  name: string
  description: string
  wordCount: number
  requiredMastery: number // Percentage needed to advance
}

export class InfantVocabularySystem {
  private coreWords: Map<string, CoreWord> = new Map()
  private currentLevel = 0
  private masteredWords: Set<string> = new Set()
  private learningProgress: Map<string, number> = new Map()

  private readonly vocabularyLevels: VocabularyLevel[] = [
    { name: "Alphabet", description: "Learning letters A-Z", wordCount: 27, requiredMastery: 100 },
    { name: "Basic", description: "Essential survival words", wordCount: 50, requiredMastery: 90 },
    { name: "Elementary", description: "Common daily words", wordCount: 100, requiredMastery: 85 },
    { name: "Intermediate", description: "Expanded vocabulary", wordCount: 200, requiredMastery: 80 },
    { name: "Advanced", description: "Complex concepts", wordCount: 432, requiredMastery: 75 },
    { name: "Expert", description: "Beyond core vocabulary", wordCount: 1000, requiredMastery: 70 },
  ]

  constructor() {
    this.initializeCoreVocabulary()
    this.loadProgress()
  }

  private initializeCoreVocabulary(): void {
    // Alphabet (27 words: A-Z + "alphabet")
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    alphabet.forEach((letter, index) => {
      this.addCoreWord({
        word: letter.toLowerCase(),
        definition: `The letter ${letter}`,
        partOfSpeech: "noun",
        difficulty: 1,
        category: "alphabet",
        examples: [`The letter ${letter} comes ${this.getOrdinal(index + 1)} in the alphabet`],
        phonetics: `/${letter.toLowerCase()}/`,
        frequency: 100,
        learned: false,
        attempts: 0,
        correctUses: 0,
      })
    })

    this.addCoreWord({
      word: "alphabet",
      definition: "The set of letters used in a language",
      partOfSpeech: "noun",
      difficulty: 2,
      category: "alphabet",
      examples: ["The English alphabet has 26 letters"],
      phonetics: "/ˈælfəˌbet/",
      frequency: 50,
      learned: false,
      attempts: 0,
      correctUses: 0,
    })

    // Essential survival words (top 50)
    const essentialWords = [
      { word: "i", definition: "First person singular pronoun", pos: "pronoun", freq: 100 },
      { word: "you", definition: "Second person pronoun", pos: "pronoun", freq: 100 },
      { word: "the", definition: "Definite article", pos: "article", freq: 100 },
      { word: "a", definition: "Indefinite article", pos: "article", freq: 100 },
      { word: "and", definition: "Conjunction connecting words", pos: "conjunction", freq: 100 },
      { word: "is", definition: 'Third person singular of "be"', pos: "verb", freq: 100 },
      { word: "in", definition: "Preposition indicating location", pos: "preposition", freq: 100 },
      { word: "it", definition: "Third person singular pronoun", pos: "pronoun", freq: 100 },
      { word: "to", definition: "Preposition indicating direction", pos: "preposition", freq: 100 },
      { word: "of", definition: "Preposition indicating possession", pos: "preposition", freq: 100 },
      { word: "have", definition: "To possess or own", pos: "verb", freq: 95 },
      { word: "be", definition: "To exist or occur", pos: "verb", freq: 95 },
      { word: "that", definition: "Demonstrative pronoun", pos: "pronoun", freq: 95 },
      { word: "for", definition: "Preposition indicating purpose", pos: "preposition", freq: 95 },
      { word: "not", definition: "Negation word", pos: "adverb", freq: 95 },
      { word: "with", definition: "Preposition indicating accompaniment", pos: "preposition", freq: 90 },
      { word: "he", definition: "Third person masculine pronoun", pos: "pronoun", freq: 90 },
      { word: "as", definition: "Conjunction for comparison", pos: "conjunction", freq: 90 },
      { word: "his", definition: "Possessive pronoun masculine", pos: "pronoun", freq: 90 },
      { word: "on", definition: "Preposition indicating position", pos: "preposition", freq: 90 },
      { word: "do", definition: "Action verb", pos: "verb", freq: 85 },
      { word: "say", definition: "To speak or utter", pos: "verb", freq: 85 },
      { word: "she", definition: "Third person feminine pronoun", pos: "pronoun", freq: 85 },
      { word: "or", definition: "Conjunction indicating choice", pos: "conjunction", freq: 85 },
      { word: "an", definition: "Indefinite article before vowels", pos: "article", freq: 85 },
      { word: "will", definition: "Modal verb for future", pos: "verb", freq: 80 },
      { word: "my", definition: "First person possessive", pos: "pronoun", freq: 80 },
      { word: "one", definition: "Number 1", pos: "number", freq: 80 },
      { word: "all", definition: "Every one of", pos: "determiner", freq: 80 },
      { word: "would", definition: "Modal verb conditional", pos: "verb", freq: 80 },
      { word: "there", definition: "In that place", pos: "adverb", freq: 75 },
      { word: "their", definition: "Possessive pronoun plural", pos: "pronoun", freq: 75 },
      { word: "what", definition: "Interrogative pronoun", pos: "pronoun", freq: 75 },
      { word: "so", definition: "Adverb of degree", pos: "adverb", freq: 75 },
      { word: "up", definition: "Direction toward higher position", pos: "adverb", freq: 75 },
      { word: "out", definition: "Away from inside", pos: "adverb", freq: 70 },
      { word: "if", definition: "Conditional conjunction", pos: "conjunction", freq: 70 },
      { word: "about", definition: "Concerning or regarding", pos: "preposition", freq: 70 },
      { word: "who", definition: "Interrogative pronoun for person", pos: "pronoun", freq: 70 },
      { word: "get", definition: "To obtain or receive", pos: "verb", freq: 70 },
      { word: "which", definition: "Interrogative determiner", pos: "determiner", freq: 65 },
      { word: "go", definition: "To move or travel", pos: "verb", freq: 65 },
      { word: "me", definition: "First person object pronoun", pos: "pronoun", freq: 65 },
      { word: "when", definition: "Interrogative adverb of time", pos: "adverb", freq: 65 },
      { word: "make", definition: "To create or produce", pos: "verb", freq: 65 },
      { word: "can", definition: "Modal verb expressing ability", pos: "verb", freq: 60 },
      { word: "like", definition: "To enjoy or prefer", pos: "verb", freq: 60 },
      { word: "time", definition: "Duration or moment", pos: "noun", freq: 60 },
      { word: "no", definition: "Negative response", pos: "adverb", freq: 60 },
      { word: "just", definition: "Recently or only", pos: "adverb", freq: 60 },
    ]

    essentialWords.forEach((wordData) => {
      this.addCoreWord({
        word: wordData.word,
        definition: wordData.definition,
        partOfSpeech: wordData.pos,
        difficulty: 2,
        category: "essential",
        examples: [this.generateExample(wordData.word)],
        phonetics: this.generatePhonetics(wordData.word),
        frequency: wordData.freq,
        learned: false,
        attempts: 0,
        correctUses: 0,
      })
    })
  }

  private addCoreWord(word: CoreWord): void {
    this.coreWords.set(word.word.toLowerCase(), word)
  }

  private getOrdinal(num: number): string {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"]
    return ordinals[num - 1] || `${num}th`
  }

  private generateExample(word: string): string {
    const examples: Record<string, string> = {
      i: "I am learning new words.",
      you: "You are very smart.",
      the: "The cat is sleeping.",
      a: "A bird is singing.",
      and: "I like cats and dogs.",
      is: "The sky is blue.",
      in: "The book is in the bag.",
      it: "It is a beautiful day.",
      to: "I want to learn.",
      of: "The color of the flower.",
    }

    return examples[word] || `This is an example with the word "${word}".`
  }

  private generatePhonetics(word: string): string {
    const phonetics: Record<string, string> = {
      i: "/aɪ/",
      you: "/juː/",
      the: "/ðə/",
      a: "/ə/",
      and: "/ænd/",
      is: "/ɪz/",
      in: "/ɪn/",
      it: "/ɪt/",
      to: "/tuː/",
      of: "/ʌv/",
    }

    return phonetics[word] || `/${word}/`
  }

  getCurrentLevel(): VocabularyLevel {
    return this.vocabularyLevels[this.currentLevel]
  }

  getWordsForCurrentLevel(): CoreWord[] {
    const currentLevelWords = this.vocabularyLevels[this.currentLevel].wordCount
    return Array.from(this.coreWords.values()).slice(0, currentLevelWords)
  }

  markWordLearned(word: string, correct: boolean): void {
    const coreWord = this.coreWords.get(word.toLowerCase())
    if (coreWord) {
      coreWord.attempts++
      if (correct) {
        coreWord.correctUses++
        if (coreWord.correctUses >= 3 && !coreWord.learned) {
          coreWord.learned = true
          this.masteredWords.add(word.toLowerCase())
        }
      }
      this.updateProgress()
      this.saveProgress()
    }
  }

  private updateProgress(): void {
    const currentLevelWords = this.getWordsForCurrentLevel()
    const masteredInLevel = currentLevelWords.filter((w) => w.learned).length
    const progressPercent = (masteredInLevel / currentLevelWords.length) * 100

    this.learningProgress.set(this.getCurrentLevel().name, progressPercent)

    // Check if ready to advance
    if (
      progressPercent >= this.getCurrentLevel().requiredMastery &&
      this.currentLevel < this.vocabularyLevels.length - 1
    ) {
      this.currentLevel++
    }
  }

  getVocabularyStats() {
    const totalWords = this.coreWords.size
    const masteredWords = this.masteredWords.size
    const currentLevel = this.getCurrentLevel()
    const currentProgress = this.learningProgress.get(currentLevel.name) || 0

    return {
      totalCoreWords: totalWords,
      masteredWords,
      currentLevel: currentLevel.name,
      currentLevelProgress: Math.round(currentProgress),
      vocabularyAge: this.getVocabularyAge(),
      nextMilestone: this.getNextMilestone(),
      recentlyLearned: this.getRecentlyLearnedWords(),
    }
  }

  private getVocabularyAge(): string {
    if (this.currentLevel === 0) return "Infant (Learning Alphabet)"
    if (this.currentLevel === 1) return "Toddler (Basic Words)"
    if (this.currentLevel === 2) return "Child (Elementary)"
    if (this.currentLevel === 3) return "Teen (Intermediate)"
    if (this.currentLevel === 4) return "Adult (Advanced)"
    return "Expert (Beyond Core)"
  }

  private getNextMilestone(): string {
    if (this.currentLevel < this.vocabularyLevels.length - 1) {
      const nextLevel = this.vocabularyLevels[this.currentLevel + 1]
      return `Advance to ${nextLevel.name} level`
    }
    return "All core vocabulary mastered!"
  }

  private getRecentlyLearnedWords(): string[] {
    return Array.from(this.coreWords.values())
      .filter((w) => w.learned)
      .sort((a, b) => b.correctUses - a.correctUses)
      .slice(0, 5)
      .map((w) => w.word)
  }

  private saveProgress(): void {
    try {
      const progressData = {
        currentLevel: this.currentLevel,
        masteredWords: Array.from(this.masteredWords),
        learningProgress: Array.from(this.learningProgress.entries()),
        coreWords: Array.from(this.coreWords.entries()),
      }
      localStorage.setItem("infantVocabularyProgress", JSON.stringify(progressData))
    } catch (error) {
      console.error("Failed to save vocabulary progress:", error)
    }
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem("infantVocabularyProgress")
      if (saved) {
        const data = JSON.parse(saved)
        this.currentLevel = data.currentLevel || 0
        this.masteredWords = new Set(data.masteredWords || [])
        this.learningProgress = new Map(data.learningProgress || [])

        // Update core words with saved progress
        if (data.coreWords) {
          const savedWords = new Map(data.coreWords)
          savedWords.forEach((wordData, key) => {
            if (this.coreWords.has(key)) {
              const existing = this.coreWords.get(key)!
              existing.learned = wordData.learned
              existing.attempts = wordData.attempts
              existing.correctUses = wordData.correctUses
            }
          })
        }
      }
    } catch (error) {
      console.error("Failed to load vocabulary progress:", error)
    }
  }

  resetProgress(): void {
    this.currentLevel = 0
    this.masteredWords.clear()
    this.learningProgress.clear()
    this.coreWords.forEach((word) => {
      word.learned = false
      word.attempts = 0
      word.correctUses = 0
    })
    localStorage.removeItem("infantVocabularyProgress")
  }
}
