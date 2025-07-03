import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { CodingConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"

export class CodingModule implements ModuleInterface {
  name = "coding"
  version = "2.0.0"
  initialized = false

  private seedData: any = null
  private learntData: any = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  // Next.js and React knowledge base
  private nextjsKnowledge = {
    "app-router": {
      description: "Next.js 13+ routing system using app directory",
      files: {
        "app/page.tsx": "Home page component",
        "app/layout.tsx": "Root layout component",
        "app/loading.tsx": "Loading UI component",
        "app/error.tsx": "Error UI component",
        "app/not-found.tsx": "404 page component",
      },
      routing: {
        "dynamic-routes": "app/blog/[slug]/page.tsx",
        "nested-routes": "app/dashboard/settings/page.tsx",
        "route-groups": "app/(auth)/login/page.tsx",
      },
    },
    "server-components": {
      description: "Components that render on the server by default",
      benefits: ["Better performance", "Smaller bundle size", "Direct database access", "Better SEO"],
      restrictions: ["No useState", "No useEffect", "No browser APIs", "No event handlers"],
    },
    "client-components": {
      description: "Components that render on the client, marked with 'use client'",
      usage: "Add 'use client' directive at top of file",
      when_to_use: ["Interactive elements", "State management", "Browser APIs", "Event handlers"],
    },
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Coding Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.coding.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.coding.learntFile)

      this.initialized = true
      console.log("Coding Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Coding Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const codingQueries = this.extractCodingQueries(input)

      if (codingQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const concepts: CodingConcept[] = []

      for (const query of codingQueries) {
        const concept = await this.getCodingConcept(query)
        if (concept) {
          concepts.push(concept)
        }
      }

      if (concepts.length === 0) {
        // Try online lookup for Next.js documentation
        const onlineConcept = await this.lookupOnlineDocumentation(input)
        if (onlineConcept) {
          concepts.push(onlineConcept)
        }
      }

      if (concepts.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildCodingResponse(concepts)
      const confidence = this.calculateCodingConfidence(concepts)

      await this.learn({
        input,
        concepts,
        context,
        timestamp: Date.now(),
      })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: codingQueries.length,
          conceptsFound: concepts.length,
        },
      }
    } catch (error) {
      console.error("Error in Coding Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private extractCodingQueries(input: string): string[] {
    const queries: string[] = []

    // Programming language mentions
    const languages = ["javascript", "typescript", "python", "java", "react", "nextjs", "next.js", "html", "css"]
    for (const lang of languages) {
      if (input.toLowerCase().includes(lang)) {
        queries.push(lang)
      }
    }

    // Coding concepts
    const concepts = ["function", "component", "hook", "state", "props", "api", "route", "middleware"]
    for (const concept of concepts) {
      if (input.toLowerCase().includes(concept)) {
        queries.push(concept)
      }
    }

    // Next.js specific patterns
    const nextjsPatterns = [
      "app router",
      "server component",
      "client component",
      "use client",
      "page.tsx",
      "layout.tsx",
    ]
    for (const pattern of nextjsPatterns) {
      if (input.toLowerCase().includes(pattern)) {
        queries.push(pattern)
      }
    }

    // File system queries
    const fileMatch = input.match(/(\w+\.(tsx?|jsx?|css|json))/gi)
    if (fileMatch) {
      queries.push(...fileMatch)
    }

    return [...new Set(queries)]
  }

  private async getCodingConcept(query: string): Promise<CodingConcept | null> {
    // Check Next.js knowledge base first
    const nextjsConcept = this.searchNextjsKnowledge(query)
    if (nextjsConcept) {
      return nextjsConcept
    }

    // Check learnt data
    const learntConcept = this.searchLearntData(query)
    if (learntConcept) {
      return learntConcept
    }

    // Check seed data
    const seedConcept = this.searchSeedData(query)
    if (seedConcept) {
      return seedConcept
    }

    return null
  }

  private searchNextjsKnowledge(query: string): CodingConcept | null {
    const lowerQuery = query.toLowerCase()

    // Check for Next.js specific concepts
    if (lowerQuery.includes("app router") || lowerQuery.includes("app directory")) {
      return {
        name: "App Router",
        language: "nextjs",
        description: this.nextjsKnowledge["app-router"].description,
        syntax: "app/page.tsx, app/layout.tsx, app/loading.tsx",
        examples: [
          {
            title: "Basic Page Structure",
            code: `// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js App Router</h1>
    </div>
  )
}`,
            explanation: "Basic page component in the app directory",
          },
        ],
        difficulty: 3,
        category: "nextjs-routing",
      }
    }

    if (lowerQuery.includes("server component")) {
      return {
        name: "Server Components",
        language: "nextjs",
        description: this.nextjsKnowledge["server-components"].description,
        syntax: "Default in app directory - no 'use client' directive",
        examples: [
          {
            title: "Server Component with Data Fetching",
            code: `// app/posts/page.tsx
async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts')
  const data = await posts.json()
  
  return (
    <div>
      {data.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}

export default PostsPage`,
            explanation: "Server component that fetches data directly",
          },
        ],
        difficulty: 4,
        category: "nextjs-components",
      }
    }

    if (lowerQuery.includes("client component") || lowerQuery.includes("use client")) {
      return {
        name: "Client Components",
        language: "nextjs",
        description: this.nextjsKnowledge["client-components"].description,
        syntax: "'use client' at the top of the file",
        examples: [
          {
            title: "Interactive Client Component",
            code: `'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}`,
            explanation: "Client component with state and interactivity",
          },
        ],
        difficulty: 3,
        category: "nextjs-components",
      }
    }

    return null
  }

  private async lookupOnlineDocumentation(query: string): Promise<CodingConcept | null> {
    // Simulate online documentation lookup
    // In a real implementation, this would fetch from Next.js docs, MDN, etc.

    if (query.toLowerCase().includes("nextjs") || query.toLowerCase().includes("next.js")) {
      return {
        name: "Next.js Framework",
        language: "javascript",
        description:
          "A React framework for building full-stack web applications with server-side rendering and static site generation",
        syntax: "npx create-next-app@latest my-app",
        examples: [
          {
            title: "Getting Started",
            code: `// pages/index.js or app/page.tsx
export default function Home() {
  return (
    <div>
      <h1>Hello Next.js!</h1>
    </div>
  )
}`,
            explanation: "Basic Next.js page component",
          },
        ],
        difficulty: 3,
        category: "framework",
      }
    }

    return null
  }

  private searchLearntData(query: string): CodingConcept | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.name === query) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(query: string): CodingConcept | null {
    if (!this.seedData || !this.seedData.concepts) return null

    const conceptData = this.seedData.concepts[query.toLowerCase()]
    if (conceptData) {
      return {
        name: query,
        language: conceptData.language || "general",
        description: conceptData.description,
        syntax: conceptData.syntax || "",
        examples: conceptData.examples || [],
        difficulty: conceptData.difficulty || 1,
        category: conceptData.category || "general",
      }
    }

    return null
  }

  private buildCodingResponse(concepts: CodingConcept[]): string {
    if (concepts.length === 1) {
      const concept = concepts[0]
      let response = `**${concept.name}** (${concept.language})\n\n${concept.description}`

      if (concept.syntax) {
        response += `\n\n**Syntax:**\n\`\`\`${concept.language}\n${concept.syntax}\n\`\`\``
      }

      if (concept.examples && concept.examples.length > 0) {
        const example = concept.examples[0]
        response += `\n\n**Example:**\n\`\`\`${concept.language}\n${example.code}\n\`\`\``
        response += `\n\n${example.explanation}`
      }

      return response
    } else {
      let response = "Here are the coding concepts:\n\n"
      concepts.forEach((concept, index) => {
        response += `**${index + 1}. ${concept.name}** (${concept.language})\n${concept.description}\n\n`
      })
      return response
    }
  }

  private calculateCodingConfidence(concepts: CodingConcept[]): number {
    if (concepts.length === 0) return 0

    let totalConfidence = 0
    for (const concept of concepts) {
      if (concept.examples && concept.examples.length > 0) totalConfidence += 0.9
      else totalConfidence += 0.6
    }

    return Math.min(1, totalConfidence / concepts.length)
  }

  async learn(data: any): Promise<void> {
    this.stats.lastUpdate = Date.now()
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }
}

export const codingModule = new CodingModule()
