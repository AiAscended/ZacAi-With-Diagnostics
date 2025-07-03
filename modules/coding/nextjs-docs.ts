import type { CodingConcept } from "@/types/modules"

export class NextJSDocsAPI {
  private baseUrl = "https://nextjs.org/docs"
  private systemKnowledge: { [key: string]: CodingConcept } = {}

  constructor() {
    this.initializeSystemKnowledge()
  }

  private initializeSystemKnowledge(): void {
    this.systemKnowledge = {
      "app-router": {
        name: "App Router",
        language: "typescript",
        description: "Next.js App Router for file-based routing with app directory",
        syntax: "app/page.tsx, app/layout.tsx, app/loading.tsx",
        examples: [
          {
            title: "Basic Page Component",
            code: `export default function Page() {
  return <div>Hello World</div>
}`,
            explanation: "Simple page component in app directory",
          },
          {
            title: "Layout Component",
            code: `export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
            explanation: "Root layout component that wraps all pages",
          },
        ],
        difficulty: 3,
        category: "routing",
      },
      "server-components": {
        name: "Server Components",
        language: "typescript",
        description: "React Server Components that render on the server",
        syntax: "async function Component() { ... }",
        examples: [
          {
            title: "Server Component with Data Fetching",
            code: `async function ServerComponent() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  
  return <div>{json.title}</div>
}`,
            explanation: "Server component that fetches data at build time",
          },
        ],
        difficulty: 4,
        category: "components",
      },
      "client-components": {
        name: "Client Components",
        language: "typescript",
        description: "React components that run in the browser with 'use client' directive",
        syntax: "'use client'\n\nexport default function Component() { ... }",
        examples: [
          {
            title: "Interactive Client Component",
            code: `'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}`,
            explanation: "Client component with state and interactivity",
          },
        ],
        difficulty: 2,
        category: "components",
      },
      "server-actions": {
        name: "Server Actions",
        language: "typescript",
        description: "Functions that run on the server and can be called from client components",
        syntax: "'use server'\n\nexport async function action() { ... }",
        examples: [
          {
            title: "Form Server Action",
            code: `'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name')
  // Save to database
  return { success: true }
}`,
            explanation: "Server action for handling form submissions",
          },
        ],
        difficulty: 4,
        category: "server",
      },
    }
  }

  async lookupConcept(query: string): Promise<CodingConcept | null> {
    // First check system knowledge
    const systemConcept = this.findSystemConcept(query)
    if (systemConcept) {
      return systemConcept
    }

    // If not found in system knowledge, could extend to fetch from docs
    // For now, return null for concepts not in our knowledge base
    return null
  }

  private findSystemConcept(query: string): CodingConcept | null {
    const lowerQuery = query.toLowerCase()

    // Direct match
    if (this.systemKnowledge[lowerQuery]) {
      return this.systemKnowledge[lowerQuery]
    }

    // Partial match
    for (const [key, concept] of Object.entries(this.systemKnowledge)) {
      if (
        key.includes(lowerQuery) ||
        concept.name.toLowerCase().includes(lowerQuery) ||
        concept.description.toLowerCase().includes(lowerQuery)
      ) {
        return concept
      }
    }

    return null
  }

  getSystemFileAnalysis(filename: string): any {
    const fileAnalysis: { [key: string]: any } = {
      "app/page.tsx": {
        purpose: "Main page component for the root route",
        type: "Page Component",
        framework: "Next.js App Router",
        contains: ["React component", "Default export", "JSX return"],
      },
      "app/layout.tsx": {
        purpose: "Root layout component that wraps all pages",
        type: "Layout Component",
        framework: "Next.js App Router",
        contains: ["HTML structure", "Body wrapper", "Children prop"],
      },
      "components/ui/button.tsx": {
        purpose: "Reusable button component with variants",
        type: "UI Component",
        framework: "shadcn/ui",
        contains: ["Button variants", "Tailwind classes", "forwardRef"],
      },
      "core/system/manager.ts": {
        purpose: "Central system manager for coordinating modules",
        type: "Core System",
        framework: "ZacAI Architecture",
        contains: ["Module initialization", "Request processing", "System stats"],
      },
      "modules/mathematics/index.ts": {
        purpose: "Mathematics module for calculations and Tesla math",
        type: "AI Module",
        framework: "ZacAI Architecture",
        contains: ["Tesla calculations", "Digital roots", "Pattern analysis"],
      },
    }

    return (
      fileAnalysis[filename] || {
        purpose: "Unknown file",
        type: "Unknown",
        framework: "Unknown",
        contains: [],
      }
    )
  }

  getAllSystemConcepts(): CodingConcept[] {
    return Object.values(this.systemKnowledge)
  }
}

export const nextjsDocsAPI = new NextJSDocsAPI()
