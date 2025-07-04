"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Book, FileText, Code, Calculator } from "lucide-react"

interface VocabularyData {
  metadata: {
    totalEntries: number
  }
}

interface KnowledgeManagementTabProps {
  vocabularyItems: any[]
  factItems: any[]
  codingItems: any[]
  mathItems: any[]
  vocabData: VocabularyData | null
  setActiveSection: (section: string) => void
}

const KnowledgeManagementTab: React.FC<KnowledgeManagementTabProps> = ({
  vocabularyItems,
  factItems,
  codingItems,
  mathItems,
  vocabData,
  setActiveSection,
}) => {
  return (
    <div>
      {/* Replace the current quicklinks section with overview-style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          onClick={() => setActiveSection("vocabulary")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {vocabData?.metadata?.totalEntries || vocabularyItems.length}
                </div>
                <div className="text-sm text-muted-foreground">Vocabulary Words</div>
              </div>
              <Book className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          onClick={() => setActiveSection("facts")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{factItems.length}</div>
                <div className="text-sm text-muted-foreground">Facts & Knowledge</div>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          onClick={() => setActiveSection("coding")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{codingItems.length}</div>
                <div className="text-sm text-muted-foreground">Coding Knowledge</div>
              </div>
              <Code className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          onClick={() => setActiveSection("mathematics")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{mathItems.length}</div>
                <div className="text-sm text-muted-foreground">Math Concepts</div>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default KnowledgeManagementTab
