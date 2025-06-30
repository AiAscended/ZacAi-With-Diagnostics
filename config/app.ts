import type { SystemConfig } from "@/types/global"

export const SYSTEM_CONFIG: SystemConfig = {
  version: "2.0.0",
  environment: "development",
  features: {
    vocabulary: true,
    mathematics: true,
    coding: true,
    facts: true,
    philosophy: true,
    userInfo: true,
    web3: false,
  },
  apis: {
    dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
    wikipedia: "https://en.wikipedia.org/api/rest_v1/page/summary",
    wolfram: "https://api.wolframalpha.com/v2/query",
    github: "https://api.github.com",
  },
}

export const MODULE_CONFIG = {
  vocabulary: {
    seedFile: "/seed/vocabulary.json",
    learntFile: "/learnt/vocabulary.json",
    apiEndpoints: {
      dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
      thesaurus: "https://api.datamuse.com/words",
      phonetics: "https://api.dictionaryapi.dev/api/v2/entries/en",
    },
    cacheTimeout: 86400000, // 24 hours
  },
  mathematics: {
    seedFile: "/seed/mathematics.json",
    learntFile: "/learnt/mathematics.json",
    apiEndpoints: {
      wolfram: "https://api.wolframalpha.com/v2/query",
      mathjs: "https://api.mathjs.org/v4",
    },
    cacheTimeout: 3600000, // 1 hour
  },
  facts: {
    seedFile: "/seed/facts.json",
    learntFile: "/learnt/facts.json",
    apiEndpoints: {
      wikipedia: "https://en.wikipedia.org/api/rest_v1/page/summary",
      news: "https://newsapi.org/v2/everything",
    },
    cacheTimeout: 3600000, // 1 hour
  },
  coding: {
    seedFile: "/seed/coding.json",
    learntFile: "/learnt/coding.json",
    apiEndpoints: {
      github: "https://api.github.com",
      stackoverflow: "https://api.stackexchange.com/2.3",
    },
    cacheTimeout: 7200000, // 2 hours
  },
  philosophy: {
    seedFile: "/seed/philosophy.json",
    learntFile: "/learnt/philosophy.json",
    apiEndpoints: {},
    cacheTimeout: 86400000, // 24 hours
  },
  userInfo: {
    seedFile: "/seed/user-info.json",
    learntFile: "/learnt/user-profile.json",
    apiEndpoints: {},
    cacheTimeout: 0, // No cache for user data
  },
}

export const UI_CONFIG = {
  theme: {
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#74b9ff",
    success: "#00b894",
    warning: "#fdcb6e",
    error: "#e17055",
  },
  animations: {
    duration: 300,
    easing: "ease-in-out",
  },
  chat: {
    maxMessages: 100,
    contextWindow: 10,
    typingSpeed: 50,
  },
  admin: {
    refreshInterval: 5000,
    dataPageSize: 20,
  },
}

export const PERFORMANCE_CONFIG = {
  caching: {
    enabled: true,
    maxSize: 1000,
    ttl: 300000, // 5 minutes default
  },
  rateLimit: {
    enabled: true,
    maxRequests: 60,
    windowMs: 60000, // 1 minute
  },
  timeout: {
    api: 10000, // 10 seconds
    module: 5000, // 5 seconds
  },
}
