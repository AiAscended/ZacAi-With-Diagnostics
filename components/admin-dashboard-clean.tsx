"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Download,
  RefreshCw,
  Database,
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  TrendingUp,
  Home,
  Cog,
  User,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { userMemory } from "@/core/memory/user-memory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import KnowledgeManagementTab from "@/components/knowledge-management-tab"
import MemorySystemTab from "@/components/memory-system-tab"
import PerformanceMonitorTab from "@/components/performance-monitor-tab"
import SystemSettingsTab from "@/components/system-settings-tab"
import { vocabularyModule } from "@/modules/vocabulary"

interface AdminDashboardProps {
  onToggleChat: () => void
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  uptime: number
  totalQueries: number
  averageResponseTime: number
  successRate: number
  chatLogEntries: number
  memoryStats: any
}

export default function AdminDashboardClean({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [chatLog, setChatLog] = useState<any[]>([])
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [factItems, setFactItems] = useState([])
  const [codingItems, setCodingItems] = useState([])
  const [mathItems, setMathItems] = useState([])
  const [vocabData, setVocabData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    loadStats()
    loadChatLog()
    loadData()
    const interval = setInterval(() => {
      loadStats()
      if (activeTab === "chat-log") {
        loadChatLog()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  const loadStats = async () => {
    try {
      const systemStats = systemManager.getSystemStats()
      setStats(systemStats)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load stats:", error)
      setIsLoading(false)
    }
  }

  const loadChatLog = () => {
    try {
      const log = systemManager.getChatLog()
      setChatLog(log)
    } catch (error) {
      console.error("Failed to load chat log:", error)
    }
  }

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

  const handleExport = async () => {
    try {
      const exportData = await systemManager.exportData()
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleClearChatLog = () => {
    if (confirm("Are you sure you want to clear the chat log? This cannot be undone.")) {
      systemManager.clearChatLog()
      setChatLog([])
    }
  }

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear user memory? This cannot be undone.")) {
      userMemory.clear()
      loadStats()
    }
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "knowledge", label: "Knowledge Management", icon: Database },
    { id: "memory", label: "Memory System", icon: User },
    { id: "performance", label: "Performance Monitor", icon: TrendingUp },
    { id: "settings", label: "System Settings", icon: Cog },
  ]

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Loading ZacAI Dashboard</h2>
            <p className="text-gray-600">Initializing system analytics...</p>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Clean Sidebar */}
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">ZacAI</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-600">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start text-gray-700 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-600">Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => router.push("/")} className="text-gray-700 hover:bg-gray-100">
                      <HomeIcon className="w-4 h-4 mr-3" />
                      Back to Chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleExport} className="text-gray-700 hover:bg-gray-100">
                      <Download className="w-4 h-4 mr-3" />
                      Export Data
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={loadStats} className="text-gray-700 hover:bg-gray-100">
                      <RefreshCw className="w-4 h-4 mr-3" />
                      Refresh
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge
                variant="outline"
                className={`${stats?.initialized ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                {stats?.initialized ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {stats?.totalQueries || 0} queries
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {Math.round(stats?.averageResponseTime || 0)}ms avg
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Uptime: {formatUptime(stats?.uptime || 0)}
              </Badge>
            </div>
          </header>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="m-4 bg-muted">
              <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="knowledge" onClick={() => setActiveTab("knowledge")}>
                Knowledge Management
              </TabsTrigger>
              <TabsTrigger value="memory" onClick={() => setActiveTab("memory")}>
                Memory System
              </TabsTrigger>
              <TabsTrigger value="performance" onClick={() => setActiveTab("performance")}>
                Performance Monitor
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>
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
                          <BookOpen className="h-8 w-8 text-blue-600" />
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
                          <Globe className="h-8 w-8 text-green-600" />
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
                  setActiveSection={setActiveTab}
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
