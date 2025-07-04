"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HomeIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

import KnowledgeManagementTab from "@/components/knowledge-management-tab"
import MemorySystemTab from "@/components/memory-system-tab"
import PerformanceMonitorTab from "@/components/performance-monitor-tab"
import SystemSettingsTab from "@/components/system-settings-tab"
import { vocabularyModule } from "@/modules/vocabulary"
import { Card, CardContent } from "@/components/ui/card"
import { Book, FileText, Code, Calculator } from "@heroicons/react/24/solid"

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview")
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [factItems, setFactItems] = useState([])
  const [codingItems, setCodingItems] = useState([])
  const [mathItems, setMathItems] = useState([])
  const [vocabData, setVocabData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const vocab = vocabularyModule.getSeedWords()
      setVocabularyItems(Object.values(vocab))

      const facts = [] // TODO: Load facts
      setFactItems(facts)

      const coding = [] // TODO: Load coding
      setCodingItems(coding)

      const math = [] // TODO: Load math
      setMathItems(math)

      const vocabStats = vocabularyModule.getStats()
      setVocabData(vocabStats)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            <HomeIcon className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="m-4 bg-muted">
          <TabsTrigger value="overview" onClick={() => handleSectionChange("overview")}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="knowledge" onClick={() => handleSectionChange("knowledge")}>
            Knowledge Management
          </TabsTrigger>
          <TabsTrigger value="memory" onClick={() => handleSectionChange("memory")}>
            Memory System
          </TabsTrigger>
          <TabsTrigger value="performance" onClick={() => handleSectionChange("performance")}>
            Performance Monitor
          </TabsTrigger>
          <TabsTrigger value="settings" onClick={() => handleSectionChange("settings")}>
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 p-4">
          <TabsContent value="overview" className="outline-none">
            {/* Overview Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">System Overview</h2>
              <p>Monitor and manage the AI system's key components.</p>

              {/* Quick Links Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-gray-800">
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

                <Card className="bg-white dark:bg-gray-800">
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

                <Card className="bg-white dark:bg-gray-800">
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

                <Card className="bg-white dark:bg-gray-800">
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
          </TabsContent>

          <TabsContent value="knowledge" className="outline-none">
            <KnowledgeManagementTab
              vocabularyItems={vocabularyItems}
              factItems={factItems}
              codingItems={codingItems}
              mathItems={mathItems}
              vocabData={vocabData}
              setActiveSection={setActiveSection}
            />
          </TabsContent>

          <TabsContent value="memory" className="outline-none">
            <MemorySystemTab />
          </TabsContent>

          <TabsContent value="performance" className="outline-none">
            <PerformanceMonitorTab />
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <SystemSettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default AdminDashboard
