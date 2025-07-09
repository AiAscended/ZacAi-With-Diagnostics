import { LanguageEngine } from "../engine/LanguageEngine"
import { MathEngine } from "../engine/MathEngine"
import { KnowledgeEngine } from "../engine/KnowledgeEngine"
import { MemoryEngine } from "../engine/MemoryEngine"
import { ThinkingEngine } from "../engine/ThinkingEngine"
import { DiagnosticEngine } from "../engine/DiagnosticEngine"
import { KnowledgeManager } from "../manager/KnowledgeManager"
import { VocabularyLoader } from "../../lib/vocabulary-loader"
import { AdvancedTokenizer } from "../../lib/advanced-tokenizer"

export class SystemManager {
  public isInitialized = false

  private languageEngine: LanguageEngine
  private mathEngine: MathEngine
  private knowledgeEngine: KnowledgeEngine
  private memoryEngine: MemoryEngine
  private thinkingEngine: ThinkingEngine
  private diagnosticEngine: DiagnosticEngine
  private knowledgeManager: KnowledgeManager
  private vocabularyLoader: VocabularyLoader
  private tokenizer: AdvancedTokenizer

  constructor() {
    this.languageEngine = new LanguageEngine()
    this.mathEngine = new MathEngine()
    this.knowledgeEngine = new KnowledgeEngine()
    this.memoryEngine = new MemoryEngine()
    this.thinkingEngine = new ThinkingEngine()
    this.diagnosticEngine = new DiagnosticEngine()
    this.knowledgeManager = new KnowledgeManager()
  }

  public async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing ZacAI System Manager...")

      // Initialize vocabulary loader first
      this.vocabularyLoader = new VocabularyLoader()
      await this.vocabularyLoader.loadVocabulary()

      // Initialize tokenizer with vocabulary loader
      this.tokenizer = new AdvancedTokenizer(this.vocabularyLoader)
      await this.tokenizer.initialize()

      // Initialize all engines
      await this.languageEngine.initialize()
      await this.mathEngine.initialize()
      await this.knowledgeEngine.initialize()
      await this.memoryEngine.initialize()
      await this.thinkingEngine.initialize()
      await this.diagnosticEngine.initialize()

      // Initialize managers
      await this.knowledgeManager.initialize()

      this.isInitialized = true
      console.log("✅ ZacAI System Manager initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize SystemManager:", error)
      throw error
    }
  }

  public getLanguageEngine(): LanguageEngine {
    return this.languageEngine
  }

  public getMathEngine(): MathEngine {
    return this.mathEngine
  }

  public getKnowledgeEngine(): KnowledgeEngine {
    return this.knowledgeEngine
  }

  public getMemoryEngine(): MemoryEngine {
    return this.memoryEngine
  }

  public getThinkingEngine(): ThinkingEngine {
    return this.thinkingEngine
  }

  public getDiagnosticEngine(): DiagnosticEngine {
    return this.diagnosticEngine
  }

  public getKnowledgeManager(): KnowledgeManager {
    return this.knowledgeManager
  }

  public getVocabularyLoader(): VocabularyLoader {
    return this.vocabularyLoader
  }

  public getTokenizer(): AdvancedTokenizer {
    return this.tokenizer
  }
}
