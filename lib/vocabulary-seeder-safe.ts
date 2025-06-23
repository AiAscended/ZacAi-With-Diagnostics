interface SeedingProgress {
  current: number
  total: number
  percentage: number
}

export class VocabularySeeder {
  private progress = 0
  private isSeeding = false

  public getProgress(): number {
    return this.progress
  }

  public async seedIncrementally(aiSystem: any, onProgress?: (progress: number) => void): Promise<void> {
    if (this.isSeeding) return

    this.isSeeding = true
    this.progress = 0

    try {
      const vocabularyCategories = this.getVocabularyCategories()
      const totalCategories = vocabularyCategories.length

      for (let i = 0; i < vocabularyCategories.length; i++) {
        const category = vocabularyCategories[i]

        // Add vocabulary in small batches
        await this.addVocabularyBatch(aiSystem, category)

        // Update progress
        this.progress = ((i + 1) / totalCategories) * 100
        onProgress?.(this.progress)

        // Small delay to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Add mathematical functions
      await this.addMathematicalFunctions(aiSystem)
      this.progress = 100
      onProgress?.(this.progress)
    } finally {
      this.isSeeding = false
    }
  }

  private getVocabularyCategories() {
    return [
      {
        name: "Technology",
        words: [
          "computer",
          "software",
          "hardware",
          "internet",
          "website",
          "application",
          "program",
          "code",
          "programming",
          "developer",
          "algorithm",
          "database",
          "server",
          "client",
          "network",
          "protocol",
          "security",
          "encryption",
          "artificial",
          "intelligence",
          "machine",
          "learning",
          "neural",
          "network",
          "data",
          "analytics",
          "cloud",
          "computing",
          "mobile",
          "responsive",
          "framework",
          "library",
          "api",
          "interface",
          "frontend",
          "backend",
          "javascript",
          "python",
          "react",
          "nodejs",
          "typescript",
          "html",
          "css",
        ],
      },
      {
        name: "Mathematics",
        words: [
          "number",
          "calculate",
          "equation",
          "formula",
          "algebra",
          "geometry",
          "trigonometry",
          "calculus",
          "statistics",
          "probability",
          "function",
          "variable",
          "constant",
          "coefficient",
          "exponent",
          "logarithm",
          "derivative",
          "integral",
          "matrix",
          "vector",
          "polynomial",
          "rational",
          "irrational",
          "complex",
          "real",
          "integer",
          "fraction",
          "decimal",
          "percentage",
          "ratio",
          "proportion",
          "average",
          "median",
          "mode",
          "standard",
          "deviation",
          "variance",
          "correlation",
          "regression",
        ],
      },
      {
        name: "Science",
        words: [
          "physics",
          "chemistry",
          "biology",
          "astronomy",
          "geology",
          "ecology",
          "molecule",
          "atom",
          "electron",
          "proton",
          "neutron",
          "element",
          "compound",
          "reaction",
          "catalyst",
          "enzyme",
          "protein",
          "dna",
          "rna",
          "cell",
          "organism",
          "evolution",
          "genetics",
          "chromosome",
          "gene",
          "energy",
          "force",
          "motion",
          "velocity",
          "acceleration",
          "gravity",
          "electromagnetic",
          "radiation",
          "frequency",
          "wavelength",
          "amplitude",
        ],
      },
      {
        name: "Business",
        words: [
          "company",
          "business",
          "organization",
          "management",
          "strategy",
          "marketing",
          "sales",
          "customer",
          "client",
          "service",
          "product",
          "revenue",
          "profit",
          "budget",
          "investment",
          "finance",
          "accounting",
          "economics",
          "market",
          "competition",
          "analysis",
          "research",
          "development",
          "innovation",
          "project",
          "team",
          "leadership",
          "communication",
          "negotiation",
          "contract",
          "agreement",
          "partnership",
        ],
      },
      {
        name: "Communication",
        words: [
          "speak",
          "talk",
          "conversation",
          "discussion",
          "dialogue",
          "debate",
          "argument",
          "opinion",
          "perspective",
          "viewpoint",
          "idea",
          "concept",
          "thought",
          "belief",
          "understanding",
          "knowledge",
          "information",
          "message",
          "communication",
          "language",
          "grammar",
          "vocabulary",
          "pronunciation",
          "accent",
          "fluent",
          "articulate",
          "express",
          "explain",
          "describe",
          "clarify",
          "elaborate",
          "summarize",
        ],
      },
      {
        name: "Emotions",
        words: [
          "happy",
          "sad",
          "angry",
          "excited",
          "nervous",
          "calm",
          "peaceful",
          "anxious",
          "worried",
          "confident",
          "proud",
          "ashamed",
          "guilty",
          "surprised",
          "shocked",
          "amazed",
          "confused",
          "curious",
          "interested",
          "bored",
          "tired",
          "energetic",
          "motivated",
          "inspired",
          "creative",
          "frustrated",
          "disappointed",
          "satisfied",
          "content",
          "grateful",
          "hopeful",
          "optimistic",
          "pessimistic",
          "emotional",
          "feeling",
        ],
      },
    ]
  }

  private async addVocabularyBatch(aiSystem: any, category: any): Promise<void> {
    // Add words in small chunks to avoid blocking
    const chunkSize = 10

    for (let i = 0; i < category.words.length; i += chunkSize) {
      const chunk = category.words.slice(i, i + chunkSize)

      chunk.forEach((word: string) => {
        aiSystem.addVocabularyWord(word, category.name)
      })

      // Small delay between chunks
      if (i % 20 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1))
      }
    }
  }

  private async addMathematicalFunctions(aiSystem: any): Promise<void> {
    const mathFunctions = [
      {
        name: "add",
        description: "Addition operation",
        examples: ["2 + 3", "add 5 and 7"],
        func: (a: number, b: number) => a + b,
      },
      {
        name: "subtract",
        description: "Subtraction operation",
        examples: ["10 - 3", "subtract 4 from 9"],
        func: (a: number, b: number) => a - b,
      },
      {
        name: "multiply",
        description: "Multiplication operation",
        examples: ["4 * 5", "multiply 3 by 6"],
        func: (a: number, b: number) => a * b,
      },
      {
        name: "divide",
        description: "Division operation",
        examples: ["15 / 3", "divide 20 by 4"],
        func: (a: number, b: number) => (b !== 0 ? a / b : "Cannot divide by zero"),
      },
      {
        name: "power",
        description: "Exponentiation",
        examples: ["2^3", "2 to the power of 3"],
        func: (a: number, b: number) => Math.pow(a, b),
      },
      {
        name: "sqrt",
        description: "Square root",
        examples: ["sqrt(16)", "square root of 25"],
        func: (a: number) => Math.sqrt(a),
      },
      {
        name: "sin",
        description: "Sine function",
        examples: ["sin(30)", "sine of 45 degrees"],
        func: (a: number) => Math.sin((a * Math.PI) / 180),
      },
      {
        name: "cos",
        description: "Cosine function",
        examples: ["cos(60)", "cosine of 90 degrees"],
        func: (a: number) => Math.cos((a * Math.PI) / 180),
      },
      {
        name: "tan",
        description: "Tangent function",
        examples: ["tan(45)", "tangent of 30 degrees"],
        func: (a: number) => Math.tan((a * Math.PI) / 180),
      },
      {
        name: "log",
        description: "Natural logarithm",
        examples: ["log(10)", "natural log of e"],
        func: (a: number) => Math.log(a),
      },
      {
        name: "log10",
        description: "Base-10 logarithm",
        examples: ["log10(100)", "log base 10 of 1000"],
        func: (a: number) => Math.log10(a),
      },
      {
        name: "abs",
        description: "Absolute value",
        examples: ["abs(-5)", "absolute value of -10"],
        func: (a: number) => Math.abs(a),
      },
      {
        name: "round",
        description: "Round to nearest integer",
        examples: ["round(3.7)", "round 2.3"],
        func: (a: number) => Math.round(a),
      },
      {
        name: "floor",
        description: "Round down",
        examples: ["floor(4.9)", "floor of 7.1"],
        func: (a: number) => Math.floor(a),
      },
      {
        name: "ceil",
        description: "Round up",
        examples: ["ceil(2.1)", "ceiling of 5.3"],
        func: (a: number) => Math.ceil(a),
      },
      {
        name: "max",
        description: "Maximum value",
        examples: ["max(5, 8)", "maximum of 3 and 7"],
        func: (...args: number[]) => Math.max(...args),
      },
      {
        name: "min",
        description: "Minimum value",
        examples: ["min(5, 8)", "minimum of 3 and 7"],
        func: (...args: number[]) => Math.min(...args),
      },
      {
        name: "random",
        description: "Random number between 0 and 1",
        examples: ["random()", "generate random number"],
        func: () => Math.random(),
      },
    ]

    // Add mathematical functions to AI system
    mathFunctions.forEach((mathFunc) => {
      aiSystem.addMathFunction(mathFunc)
    })
  }
}
