import type { SystemConfig } from "@/types/global"

export const APP_CONFIG: SystemConfig = {
  version: "2.0.0",
  environment: process.env.NODE_ENV as "development" | "production" | "test",
  features: {
    vocabulary: true,
    mathematics: true,
    coding: true,
    facts: true,
    philosophy: true,
    userInfo: true,
    web3: false, // Future implementation
  },
  apis: {
    dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
    wikipedia: "https://en.wikipedia.org/api/rest_v1",
    wolfram: process.env.WOLFRAM_API_URL || "",
    github: "https://api.github.com",
  },
}

export const MODULE_CONFIG = {
  vocabulary: {
    seedFile: "/seed/vocabulary.json",
    learntFile: "/learnt/vocabulary.json",
    apiEndpoints: {
      dictionary: APP_CONFIG.apis.dictionary,
      thesaurus: "https://api.datamuse.com/words",
    },
    cacheSize: 1000,
    confidenceThreshold: 0.7,
  },
  mathematics: {
    seedFile: "/seed/mathematics.json",
    learntFile: "/learnt/mathematics.json",
    apiEndpoints: {
      wolfram: APP_CONFIG.apis.wolfram,
      calculator: "https://api.mathjs.org/v4",
    },
    cacheSize: 500,
    confidenceThreshold: 0.8,
  },
  coding: {
    seedFile: "/seed/coding.json",
    learntFile: "/learnt/coding.json",
    apiEndpoints: {
      github: APP_CONFIG.apis.github,
      stackoverflow: "https://api.stackexchange.com/2.3",
    },
    cacheSize: 800,
    confidenceThreshold: 0.75,
  },
  facts: {
    seedFile: "/seed/facts.json",
    learntFile: "/learnt/facts.json",
    apiEndpoints: {
      wikipedia: APP_CONFIG.apis.wikipedia,
      news: "https://newsapi.org/v2",
    },
    cacheSize: 1200,
    confidenceThreshold: 0.6,
  },
  philosophy: {
    seedFile: "/seed/philosophy.json",
    learntFile: "/learnt/philosophy.json",
    apiEndpoints: {
      stanford: "https://plato.stanford.edu/api",
    },
    cacheSize: 300,
    confidenceThreshold: 0.65,
  },
}
