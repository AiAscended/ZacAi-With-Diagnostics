export const APP_CONFIG = {
  name: "ZacAI Enhanced System",
  version: "2.0.0",
  description: "Advanced AI Assistant with Modular Knowledge System",
  author: "ZacAI Development Team",

  // System Configuration
  system: {
    maxContextLength: 50,
    maxMessageAge: 24 * 60 * 60 * 1000, // 24 hours
    maxMessages: 100,
    processingTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Module Configuration
  modules: {
    vocabulary: {
      enabled: true,
      priority: 1,
      maxEntries: 10000,
      confidenceThreshold: 0.7,
      learningRate: 0.1,
    },
    mathematics: {
      enabled: true,
      priority: 2,
      maxCalculations: 1000,
      precision: 6,
      supportedOperations: ["+", "-", "*", "/", "^", "sqrt", "log"],
      teslaVortexEnabled: true,
      sacredGeometryEnabled: true,
    },
    facts: {
      enabled: true,
      priority: 3,
      maxFacts: 5000,
      verificationRequired: true,
      sourceTracking: true,
      wikipediaIntegration: true,
    },
    coding: {
      enabled: true,
      priority: 4,
      supportedLanguages: [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "csharp",
        "go",
        "rust",
        "php",
        "ruby",
        "swift",
        "kotlin",
      ],
      maxCodeLength: 10000,
      syntaxHighlighting: true,
    },
    philosophy: {
      enabled: true,
      priority: 5,
      maxConcepts: 2000,
      schoolsOfThought: [
        "ancient",
        "medieval",
        "modern",
        "contemporary",
        "eastern",
        "western",
        "analytic",
        "continental",
      ],
      ethicsEnabled: true,
    },
    userInfo: {
      enabled: true,
      priority: 6,
      personalDataEncryption: true,
      dataRetention: 365, // days
      privacyMode: true,
    },
  },

  // Learning Configuration
  learning: {
    enabled: true,
    adaptiveLearning: true,
    spacedRepetition: true,
    forgettingCurve: true,
    personalizedPaths: true,
    performanceTracking: true,

    algorithms: {
      reinforcementLearning: true,
      neuralNetworks: false, // Browser-based limitations
      bayesianInference: true,
      geneticAlgorithms: false,
    },

    metrics: {
      accuracy: true,
      speed: true,
      retention: true,
      engagement: true,
      improvement: true,
    },
  },

  // Reasoning Configuration
  reasoning: {
    enabled: true,
    maxSteps: 10,
    confidenceThreshold: 0.5,

    strategies: {
      deductive: true,
      inductive: true,
      abductive: true,
      analogical: true,
      causal: true,
      temporal: true,
    },

    fallbackStrategies: ["semantic_search", "pattern_matching", "statistical_inference", "rule_based"],
  },

  // Storage Configuration
  storage: {
    type: "localStorage", // Browser-based storage
    encryption: false, // Would require additional setup
    compression: true,
    backup: true,

    limits: {
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxEntries: 100000,
    },

    cleanup: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  },

  // API Configuration
  api: {
    enabled: true,
    timeout: 10000, // 10 seconds
    retries: 3,

    endpoints: {
      dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
      wikipedia: "https://en.wikipedia.org/api/rest_v1/page/summary",
      wolfram: null, // Would require API key
      openai: null, // Would require API key
    },

    rateLimit: {
      enabled: true,
      requestsPerMinute: 60,
      burstLimit: 10,
    },
  },

  // UI Configuration
  ui: {
    theme: "auto", // 'light', 'dark', 'auto'
    animations: true,
    soundEffects: false,

    chat: {
      maxMessages: 100,
      messageTimeout: 30000,
      typingIndicator: true,
      readReceipts: false,

      features: {
        markdown: true,
        codeHighlighting: true,
        mathRendering: true,
        imageSupport: false, // Browser limitations
        fileUpload: false,
      },
    },

    admin: {
      enabled: true,
      realTimeUpdates: true,
      exportFormats: ["json", "csv"],

      charts: {
        enabled: true,
        library: "recharts",
        animations: true,
      },
    },
  },

  // Performance Configuration
  performance: {
    monitoring: true,
    profiling: false, // Development only

    optimization: {
      lazyLoading: true,
      caching: true,
      compression: true,
      minification: true,
    },

    limits: {
      maxConcurrentOperations: 5,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxProcessingTime: 30000, // 30 seconds
    },
  },

  // Security Configuration
  security: {
    inputSanitization: true,
    outputEscaping: true,
    csrfProtection: false, // Not applicable for client-side

    validation: {
      strictMode: true,
      maxInputLength: 10000,
      allowedCharacters: /^[\w\s\-.,!?()[\]{}:;"'@#$%^&*+=<>/\\|`~]*$/,
    },
  },

  // Development Configuration
  development: {
    debug: process.env.NODE_ENV === "development",
    verbose: false,
    testing: false,

    features: {
      hotReload: true,
      sourceMap: true,
      errorBoundary: true,
      performanceProfiler: false,
    },
  },
}

export const MODULE_CONFIG = {
  vocabulary: {
    seedFile: "/seed/vocabulary.json",
    learntFile: "/learnt/vocabulary.json",
    apiEndpoint: APP_CONFIG.api.endpoints.dictionary,
  },
  mathematics: {
    seedFile: "/seed/mathematics.json",
    learntFile: "/learnt/mathematics.json",
    apiEndpoint: APP_CONFIG.api.endpoints.wolfram,
  },
  facts: {
    seedFile: "/seed/facts.json",
    learntFile: "/learnt/facts.json",
    apiEndpoint: APP_CONFIG.api.endpoints.wikipedia,
  },
  coding: {
    seedFile: "/seed/coding.json",
    learntFile: "/learnt/coding.json",
    apiEndpoint: null,
  },
  philosophy: {
    seedFile: "/seed/philosophy.json",
    learntFile: "/learnt/philosophy.json",
    apiEndpoint: null,
  },
  userInfo: {
    seedFile: null,
    learntFile: "/learnt/user-profile.json",
    apiEndpoint: null,
  },
}

export const REASONING_CONFIG = {
  maxChainLength: 10,
  confidenceThreshold: 0.5,
  timeoutMs: 30000,

  strategies: {
    deductive: { weight: 1.0, enabled: true },
    inductive: { weight: 0.8, enabled: true },
    abductive: { weight: 0.6, enabled: true },
    analogical: { weight: 0.7, enabled: true },
  },
}

export const LEARNING_CONFIG = {
  queueSize: 100,
  processingInterval: 5000,
  batchSize: 5,
  retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days

  patterns: {
    maxPatterns: 1000,
    similarityThreshold: 0.7,
    frequencyThreshold: 2,
  },
}

export default APP_CONFIG
