export const MODULE_CONFIG = {
  vocabulary: {
    seedFile: "/seed_vocab.json",
    learntFile: "vocabulary",
    apiEndpoints: {
      dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
    },
  },
  mathematics: {
    seedFile: "/seed_maths.json",
    learntFile: "mathematics",
  },
  facts: {
    seedFile: "/seed_knowledge.json",
    learntFile: "facts",
    apiEndpoints: {
      wikipedia: "https://en.wikipedia.org/api/rest_v1/page/summary",
    },
  },
  coding: {
    seedFile: "/seed_coding.json",
    learntFile: "coding",
    apiEndpoints: {
      mdn: "https://developer.mozilla.org/api/v1/search",
    },
  },
  philosophy: {
    seedFile: "/seed_philosophy.json",
    learntFile: "philosophy",
  },
  userInfo: {
    learntFile: "user-profile",
  },
}

export const APP_CONFIG = {
  name: "ZacAI",
  version: "2.0.0",
  description: "Enhanced AI Assistant with Learning Capabilities",
  features: [
    "Mathematical calculations including Tesla/Vortex patterns",
    "Online dictionary lookup with learning",
    "Personal memory and conversation history",
    "Scientific knowledge research",
    "Coding assistance and examples",
    "Philosophical discussions",
  ],
}
