export interface NextJSConcept {
  name: string
  category: string
  description: string
  syntax?: string
  examples: Array<{
    title: string
    code: string
    explanation: string
  }>
  relatedConcepts: string[]
  officialDocs?: string
  difficulty: number
}

export class NextJSDocsClient {
  private static readonly NEXTJS_DOCS_BASE = "https://nextjs.org/docs"
  private static readonly CACHE_DURATION = 3600000 // 1 hour

  // Built-in Next.js knowledge base
  private static readonly NEXTJS_KNOWLEDGE = {
    "app-router": {
      name: "App Router",
      category: "routing",
      description: "Next.js 13+ file-system based router built on React Server Components",
      syntax: "app/page.tsx, app/layout.tsx, app/loading.tsx, app/error.tsx",
      examples: [
        {
          title: "Basic Page Component",
          code: `// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js App Router</h1>
      <p>This is a server component by default</p>
    </div>
  )
}`,
          explanation: "Basic page component in the app directory - renders on server by default",
        },
        {
          title: "Dynamic Route",
          code: `// app/blog/[slug]/page.tsx
interface PageProps {
  params: { slug: string }
}

export default function BlogPost({ params }: PageProps) {
  return (
    <div>
      <h1>Blog Post: {params.slug}</h1>
    </div>
  )
}`,
          explanation: "Dynamic route using square brackets for URL parameters",
        },
      ],
      relatedConcepts: ["server-components", "layouts", "loading-ui"],
      officialDocs: "https://nextjs.org/docs/app",
      difficulty: 3,
    },
    "server-components": {
      name: "Server Components",
      category: "components",
      description: "React components that render on the server, reducing client-side JavaScript",
      syntax: "Default in app directory - no 'use client' directive needed",
      examples: [
        {
          title: "Server Component with Data Fetching",
          code: `// app/posts/page.tsx
async function PostsPage() {
  // This runs on the server
  const response = await fetch('https://api.example.com/posts', {
    cache: 'force-cache' // Next.js caching
  })
  const posts = await response.json()
  
  return (
    <div>
      <h1>Latest Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}

export default PostsPage`,
          explanation: "Server component that fetches data directly - no useEffect needed",
        },
      ],
      relatedConcepts: ["client-components", "data-fetching", "caching"],
      officialDocs: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
      difficulty: 4,
    },
    "client-components": {
      name: "Client Components",
      category: "components",
      description: "React components that render on the client, enabling interactivity",
      syntax: "'use client' directive at the top of the file",
      examples: [
        {
          title: "Interactive Counter Component",
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
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  )
}`,
          explanation: "Client component with state and event handlers - requires 'use client'",
        },
      ],
      relatedConcepts: ["server-components", "hooks", "interactivity"],
      officialDocs: "https://nextjs.org/docs/app/building-your-application/rendering/client-components",
      difficulty: 3,
    },
    layouts: {
      name: "Layouts",
      category: "routing",
      description: "Shared UI components that wrap pages and maintain state across navigation",
      syntax: "layout.tsx files in app directory",
      examples: [
        {
          title: "Root Layout",
          code: `// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'My Next.js App',
  description: 'Built with App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>My App Navigation</nav>
        </header>
        <main>{children}</main>
        <footer>© 2024 My App</footer>
      </body>
    </html>
  )
}`,
          explanation: "Root layout wraps all pages and defines HTML structure",
        },
      ],
      relatedConcepts: ["app-router", "metadata", "nested-layouts"],
      officialDocs: "https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts",
      difficulty: 2,
    },
  }

  /**
   * Look up Next.js concept from built-in knowledge base
   */
  static async lookupNextJSConcept(concept: string): Promise<NextJSConcept | null> {
    const normalizedConcept = concept.toLowerCase().replace(/\s+/g, "-")

    if (this.NEXTJS_KNOWLEDGE[normalizedConcept]) {
      return this.NEXTJS_KNOWLEDGE[normalizedConcept]
    }

    // Try partial matches
    for (const [key, value] of Object.entries(this.NEXTJS_KNOWLEDGE)) {
      if (key.includes(normalizedConcept) || normalizedConcept.includes(key)) {
        return value
      }
    }

    return null
  }

  /**
   * Get system file knowledge - what each file in our system does
   */
  static getSystemFileKnowledge(filePath: string): any {
    const systemFiles = {
      "app/layout.tsx": {
        purpose: "Root layout component that wraps all pages",
        contains: "HTML structure, global navigation, metadata",
        type: "Server Component",
        importance: "Critical - defines app structure",
      },
      "app/page.tsx": {
        purpose: "Home page component",
        contains: "Main landing page content and navigation",
        type: "Server Component",
        importance: "High - main entry point",
      },
      "components/ui/*": {
        purpose: "Reusable UI components from shadcn/ui",
        contains: "Button, Card, Input, Dialog, and other UI primitives",
        type: "Mixed - some client, some server compatible",
        importance: "High - core UI building blocks",
      },
      "modules/*/index.ts": {
        purpose: "AI module implementations (vocabulary, math, coding, etc.)",
        contains: "Module logic, processing, learning capabilities",
        type: "Server-side TypeScript classes",
        importance: "Critical - core AI functionality",
      },
      "core/system/manager.ts": {
        purpose: "Central system manager coordinating all modules",
        contains: "Module initialization, request routing, response synthesis",
        type: "Server-side TypeScript class",
        importance: "Critical - system orchestration",
      },
      "types/global.ts": {
        purpose: "TypeScript type definitions for the entire system",
        contains: "Interfaces for modules, responses, system state",
        type: "TypeScript definitions",
        importance: "High - type safety and documentation",
      },
    }

    return systemFiles[filePath] || null
  }

  /**
   * Get Next.js best practices for specific scenarios
   */
  static getBestPractices(scenario: string): string[] {
    const practices = {
      "data-fetching": [
        "Use Server Components for data fetching when possible",
        "Implement proper error boundaries",
        "Use Next.js caching strategies (force-cache, no-store, revalidate)",
        "Handle loading states with loading.tsx files",
        "Use TypeScript for API response types",
      ],
      performance: [
        "Minimize client-side JavaScript with Server Components",
        "Use Next.js Image component for optimized images",
        "Implement proper code splitting",
        "Use dynamic imports for heavy components",
        "Optimize fonts with next/font",
      ],
      routing: [
        "Use file-system based routing in app directory",
        "Implement proper error.tsx and not-found.tsx pages",
        "Use route groups for organization without affecting URL structure",
        "Implement proper metadata for SEO",
        "Use parallel routes for complex layouts",
      ],
      "state-management": [
        "Use Server Components to reduce client-side state",
        "Implement proper client/server component boundaries",
        "Use React Context sparingly and only for client components",
        "Consider server actions for form handling",
        "Use URL state for shareable application state",
      ],
    }

    return practices[scenario] || []
  }

  /**
   * Analyze code and provide Next.js specific suggestions
   */
  static analyzeCode(code: string): any {
    const analysis = {
      issues: [],
      suggestions: [],
      componentType: "unknown",
      nextjsFeatures: [],
    }

    // Detect component type
    if (code.includes("'use client'")) {
      analysis.componentType = "client"
    } else if (code.includes("async function") || code.includes("await fetch")) {
      analysis.componentType = "server"
    }

    // Check for common issues
    if (code.includes("useEffect") && !code.includes("'use client'")) {
      analysis.issues.push("useEffect requires 'use client' directive")
    }

    if (code.includes("useState") && !code.includes("'use client'")) {
      analysis.issues.push("useState requires 'use client' directive")
    }

    if (code.includes("fetch") && code.includes("useEffect")) {
      analysis.suggestions.push("Consider using Server Component for data fetching instead of useEffect")
    }

    // Detect Next.js features
    if (code.includes("next/image")) {
      analysis.nextjsFeatures.push("Next.js Image optimization")
    }

    if (code.includes("next/link")) {
      analysis.nextjsFeatures.push("Next.js client-side navigation")
    }

    if (code.includes("metadata")) {
      analysis.nextjsFeatures.push("Next.js metadata API")
    }

    return analysis
  }

  /**
   * Get debugging help for common Next.js issues
   */
  static getDebuggingHelp(error: string): any {
    const debuggingGuide = {
      hydration: {
        description: "Hydration errors occur when server and client render differently",
        solutions: [
          "Ensure server and client render the same content",
          "Use useEffect for client-only code",
          "Check for browser-only APIs in server components",
          "Use suppressHydrationWarning sparingly for unavoidable differences",
        ],
        prevention: [
          "Avoid using Date.now() or Math.random() in render",
          "Use proper client/server component boundaries",
          "Test with JavaScript disabled to verify server rendering",
        ],
      },
      "use client": {
        description: "Issues with client component directive",
        solutions: [
          "Add 'use client' at the top of files using browser APIs",
          "Move interactive logic to client components",
          "Keep data fetching in server components when possible",
        ],
        prevention: [
          "Understand the client/server component boundary",
          "Use server components by default",
          "Only use client components when necessary",
        ],
      },
      routing: {
        description: "App Router navigation and routing issues",
        solutions: [
          "Check file naming conventions (page.tsx, layout.tsx)",
          "Verify folder structure in app directory",
          "Use proper dynamic route syntax [param]",
          "Implement error.tsx for error handling",
        ],
        prevention: ["Follow Next.js file conventions", "Test routes thoroughly", "Implement proper error boundaries"],
      },
    }

    const errorKey = Object.keys(debuggingGuide).find((key) => error.toLowerCase().includes(key))

    return errorKey ? debuggingGuide[errorKey] : null
  }

  /**
   * Get migration guide from Pages Router to App Router
   */
  static getMigrationGuide(): any {
    return {
      overview: "Migrating from Pages Router to App Router",
      steps: [
        {
          step: 1,
          title: "Create app directory",
          description: "Create app/ directory alongside pages/",
          code: "mkdir app",
        },
        {
          step: 2,
          title: "Move pages to app directory",
          description: "Convert pages to page.tsx files in app directory",
          before: "pages/index.tsx",
          after: "app/page.tsx",
        },
        {
          step: 3,
          title: "Update layouts",
          description: "Convert _app.tsx to layout.tsx",
          before: "pages/_app.tsx",
          after: "app/layout.tsx",
        },
        {
          step: 4,
          title: "Handle data fetching",
          description: "Replace getServerSideProps with Server Components",
          migration: "Use async Server Components instead of getServerSideProps",
        },
      ],
      considerations: [
        "Server Components are the default in App Router",
        "Client Components require 'use client' directive",
        "Data fetching happens directly in Server Components",
        "Layouts are nested and persistent",
      ],
    }
  }
}
