"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ThinkingProcessProps {
  content: string
  timestamp?: string
}

export function ThinkingProcess({ content, timestamp }: ThinkingProcessProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 h-auto"
          >
            <Brain className="h-4 w-4" />
            <span>View Thinking Process</span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {timestamp && <span className="text-xs opacity-60">({timestamp})</span>}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="mt-2 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Thinking Process</h4>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-transparent border-none p-0 font-sans">
                  {content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
