"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { systemManager } from "@/core/system/manager"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
import { userMemory } from "@/core/memory/user-memory"
import {
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  User,
  Activity,
  Database,
  MessageSquare,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  Home,
  Cog,
  Menu,
  X,
  FileText,
  Archive,
  BarChart3,
} from "lucide-react"

interface AdminDashboardProps {
  onToggleChat: () => void
}

type AdminPage =
  | "overview"
  | "vocabulary"
  | "maths"
  | "facts"
  | "coding"
  | "philosophy"
  | "user-memory"
  | "chat-log"
  | "settings"

type ModuleSubPage = "overview" | "seed" | "learnt" | "stats" | "settings"

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("overview")
  const [currentSubPage, setCurrentSubPage] = useState<ModuleSubPage>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [chatLog, setChatLog] = useState<any[]>([])
  const [vocabData, setVocabData] = useState<any>(null)
  const [mathData, setMathData] = useState<any>(null)
  const [userMemoryData, setUserMemoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Reset sub-page when main page changes
    setCurrentSubPage("overview")
  }, [currentPage])

  const loadSystemData = async () => {
    try {
      setRefreshing(true)

      const stats = systemManager.getSystemStats()
      const log = systemManager.getChatLog()

      setSystemStats(stats)
      setChatLog(log)

      try {
        await vocabularyModule.initialize()
        const seedWords = vocabularyModule.getSeedWords()
        const learntWords = vocabularyModule.getLearntWords()
        const vocabStats = vocabularyModule.getStats()
        setVocabData({ seedWords, learntWords, stats: vocabStats })
        console.log("Vocab data loaded:", { seedWords, learntWords, vocabStats })
      } catch (error) {
        console.error("Failed to load vocab data:", error)
      }

      try {
        await mathematicsModule.initialize()
        const seedConcepts = mathematicsModule.getSeedConcepts()
        const learntConcepts = mathematicsModule.getLearntConcepts()
        const mathStats = mathematicsModule.getStats()
        setMathData({ seedConcepts, learntConcepts, stats: mathStats })
        console.log("Math data loaded:", { seedConcepts, learntConcepts, mathStats })
      } catch (error) {
        console.error("Failed to load maths data:", error)
      }

      try {
        const memoryStats = userMemory.getStats()
        const personalInfo = userMemory.getPersonalInfo()
        setUserMemoryData({ stats: memoryStats, personalInfo })
        console.log("User memory data loaded:", { memoryStats, personalInfo })
      } catch (error) {
        console.error("Failed to load user memory data:", error)
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to load system data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const exportData = async () => {
    try {
      const data = await systemManager.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
    { id: "maths", label: "Maths", icon: Calculator },
    { id: "facts", label: "Facts", icon: Globe },
    { id: "coding", label: "Coding", icon: Code },
    { id: "philosophy", label: "Philosophy", icon: Lightbulb },
    { id: "user-memory", label: "User Memory", icon: User },
    { id: "chat-log", label: "Chat Log", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Cog },
  ]

  const getModuleQuickLinks = (page: AdminPage) => {
    switch (page) {
      case "vocabulary":
        return [
          {
            id: "overview",
            label: "Overview",
            icon: Home,
            count: systemStats?.modules?.vocabulary?.totalQueries || 0,
            color: "bg-blue-500",
          },
          {
            id: "seed",
            label: "Seed Words",
            icon: Database,
            count: Object.keys(vocabData?.seedWords || {}).length,
            color: "bg-green-500",
          },
          {
            id: "learnt",
            label: "Learnt Words",
            icon: Archive,
            count: Object.keys(vocabData?.learntWords || {}).length,
            color: "bg-purple-500",
          },
          {
            id: "stats",
            label: "Statistics",
            icon: BarChart3,
            count: Math.round((vocabData?.stats?.successRate || 0) * 100),
            color: "bg-orange-500",
          },
        ]
      case "maths":
        return [
          {
            id: "overview",
            label: "Overview",
            icon: Home,
            count: systemStats?.modules?.mathematics?.totalQueries || 0,
            color: "bg-green-500",
          },
          {
            id: "seed",
            label: "Seed Concepts",
            icon: Database,
            count: Object.keys(mathData?.seedConcepts || {}).length,
            color: "bg-blue-500",
          },
          {
            id: "learnt",
            label: "Learnt Concepts",
            icon: Archive,
            count: Object.keys(mathData?.learntConcepts || {}).length,
            color: "bg-purple-500",
          },
          {
            id: "stats",
            label: "Statistics",
            icon: BarChart3,
            count: Math.round((mathData?.stats?.successRate || 0) * 100),
            color: "bg-orange-500",
          },
        ]
      case "user-memory":
        return [
          {
            id: "overview",
            label: "Overview",
            icon: Home,
            count: userMemoryData?.stats?.totalEntries || 0,
            color: "bg-purple-500",
          },
          {
            id: "seed",
            label: "Personal Info",
            icon: User,
            count: userMemoryData?.stats?.byType?.personal || 0,
            color: "bg-blue-500",
          },
          {
            id: "learnt",
            label: "Preferences",
            icon: Archive,
            count: userMemoryData?.stats?.byType?.preference || 0,
            color: "bg-green-500",
          },
          {
            id: "stats",
            label: "Statistics",
            icon: BarChart3,
            count: Math.round((userMemoryData?.stats?.averageConfidence || 0) * 100),
            color: "bg-orange-500",
          },
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Loading Admin Dashboard</h2>
            <p className="text-gray-600">Gathering system statistics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quickLinks = getModuleQuickLinks(currentPage)

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-white border-r border-gray-200 flex-shrink-0`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">ZacAI Admin</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${!sidebarOpen && "px-2"}`}
                  onClick={() => setCurrentPage(item.id as AdminPage)}
                >
                  <Icon className="w-4 h-4" />
                  {sidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {sidebarItems.find((item) => item.id === currentPage)?.label || "Dashboard"}
              </h1>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex-shrink-0">
                {systemStats?.initialized ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={loadSystemData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onToggleChat}>
                <MessageSquare className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Links for Module Pages - Square boxes like version 100 */}
        {quickLinks.length > 0 && (
          <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon
                const isActive = currentSubPage === link.id
                return (
                  <button
                    key={link.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setCurrentSubPage(link.id as ModuleSubPage)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{link.label}</p>
                        <p className={`text-2xl font-bold ${link.color.replace("bg-", "text-")}`}>{link.count}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {currentPage === "overview" && (
            <div className="space-y-6">
              {/* System Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-lg font-bold">{formatUptime(systemStats?.uptime || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Queries</p>
                        <p className="text-lg font-bold">{systemStats?.totalQueries || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-lg font-bold">{Math.round((systemStats?.successRate || 0) * 100)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Avg Response</p>
                        <p className="text-lg font-bold">{Math.round(systemStats?.averageResponseTime || 0)}ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Module Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Module Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemStats?.modules &&
                      Object.entries(systemStats.modules).map(([name, stats]: [string, any]) => (
                        <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {name === "vocabulary" && <BookOpen className="w-4 h-4 text-blue-600" />}
                            {name === "mathematics" && <Calculator className="w-4 h-4 text-green-600" />}
                            <span className="font-medium capitalize">{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{stats?.totalQueries || 0} queries</span>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === "vocabulary" && (
            <div className="space-y-6">
              {currentSubPage === "overview" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Vocabulary Module Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Use the quicklinks above to explore vocabulary data: Seed Words, Learnt Words, and Statistics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "seed" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-600" />
                      Seed Words Database ({Object.keys(vocabData?.seedWords || {}).length} words)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {vocabData?.seedWords &&
                          Object.entries(vocabData.seedWords).map(([word, data]: [string, any]) => (
                            <div key={word} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-blue-600">{word.toUpperCase()}</h4>
                                <Badge variant="outline">{data.partOfSpeech}</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{data.definition}</p>
                              {data.phonetics && (
                                <p className="text-xs text-gray-500">Pronunciation: {data.phonetics}</p>
                              )}
                              {data.frequency && <p className="text-xs text-gray-500">Frequency: {data.frequency}/5</p>}
                              {data.synonyms && data.synonyms.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Synonyms: {data.synonyms.slice(0, 3).join(", ")}
                                </p>
                              )}
                            </div>
                          ))}
                        {(!vocabData?.seedWords || Object.keys(vocabData.seedWords).length === 0) && (
                          <p className="text-gray-500 text-center py-8">
                            No seed words found. Check the vocabulary module initialization.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "learnt" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="w-5 h-5 text-purple-600" />
                      Recently Learnt Words ({Object.keys(vocabData?.learntWords || {}).length} words)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {vocabData?.learntWords &&
                          Object.entries(vocabData.learntWords).map(([id, entry]: [string, any]) => (
                            <div key={id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-green-600">{entry.content?.word?.toUpperCase()}</h4>
                                <Badge variant="outline">{entry.content?.partOfSpeech}</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{entry.content?.definition}</p>
                              <p className="text-xs text-gray-500">Added: {formatTimestamp(entry.timestamp)}</p>
                              <p className="text-xs text-gray-500">Confidence: {Math.round(entry.confidence * 100)}%</p>
                            </div>
                          ))}
                        {(!vocabData?.learntWords || Object.keys(vocabData.learntWords).length === 0) && (
                          <p className="text-gray-500 text-center py-8">
                            No learnt words yet. Try asking me to define a word like "define algorithm"!
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "stats" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                      Vocabulary Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Performance Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Queries:</span>
                            <span className="font-mono">{vocabData?.stats?.totalQueries || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <span className="font-mono">{Math.round((vocabData?.stats?.successRate || 0) * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Response Time:</span>
                            <span className="font-mono">
                              {Math.round(vocabData?.stats?.averageResponseTime || 0)}ms
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Learnt Entries:</span>
                            <span className="font-mono">{vocabData?.stats?.learntEntries || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">Data Sources</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Seed Words:</span>
                            <span className="font-mono">{Object.keys(vocabData?.seedWords || {}).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Online Lookups:</span>
                            <span className="font-mono">{Object.keys(vocabData?.learntWords || {}).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Update:</span>
                            <span className="font-mono text-xs">
                              {vocabData?.stats?.lastUpdate ? formatTimestamp(vocabData.stats.lastUpdate) : "Never"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Similar structure for other pages... */}
          {currentPage === "maths" && (
            <div className="space-y-6">
              {currentSubPage === "overview" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      Maths Module Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Use the quicklinks above to explore maths data: Seed Concepts, Learnt Concepts, and Statistics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "seed" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Seed Concepts Database ({Object.keys(mathData?.seedConcepts || {}).length} concepts)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {mathData?.seedConcepts &&
                          Object.entries(mathData.seedConcepts).map(([key, concept]: [string, any]) => (
                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-green-600">{concept.name}</h4>
                                <Badge variant="outline">Level {concept.difficulty}</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{concept.description}</p>
                              {concept.formula && (
                                <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded mb-2">
                                  {concept.formula}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">Category: {concept.category}</p>
                              {concept.examples && (
                                <p className="text-xs text-gray-500">{concept.examples.length} examples</p>
                              )}
                            </div>
                          ))}
                        {(!mathData?.seedConcepts || Object.keys(mathData.seedConcepts).length === 0) && (
                          <p className="text-gray-500 text-center py-8">
                            No seed concepts found. Check the mathematics module initialization.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "learnt" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="w-5 h-5 text-purple-600" />
                      Recently Learnt Concepts ({Object.keys(mathData?.learntConcepts || {}).length} concepts)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {mathData?.learntConcepts &&
                          Object.entries(mathData.learntConcepts).map(([id, entry]: [string, any]) => (
                            <div key={id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-purple-600">{entry.content?.name}</h4>
                                <Badge variant="outline">Level {entry.content?.difficulty}</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{entry.content?.description}</p>
                              <p className="text-xs text-gray-500">Added: {formatTimestamp(entry.timestamp)}</p>
                              <p className="text-xs text-gray-500">Confidence: {Math.round(entry.confidence * 100)}%</p>
                            </div>
                          ))}
                        {(!mathData?.learntConcepts || Object.keys(mathData.learntConcepts).length === 0) && (
                          <p className="text-gray-500 text-center py-8">
                            No learnt concepts yet. Try asking me to solve a math problem like "2+2*3"!
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentPage === "user-memory" && (
            <div className="space-y-6">
              {currentSubPage === "overview" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      User Memory System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Use the quicklinks above to explore user memory: Personal Info, Preferences, and Statistics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentSubPage === "seed" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Personal Information ({Object.keys(userMemoryData?.personalInfo || {}).length} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userMemoryData?.personalInfo &&
                        Object.entries(userMemoryData.personalInfo).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium capitalize">{key}</span>
                            <span className="text-gray-700">{String(value)}</span>
                          </div>
                        ))}
                      {(!userMemoryData?.personalInfo || Object.keys(userMemoryData.personalInfo).length === 0) && (
                        <p className="text-gray-500 text-center py-8">
                          No personal information stored yet. Try introducing yourself with "Hi, I'm [your name]"!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentPage === "chat-log" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Chat History ({chatLog.length} conversations)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {chatLog.map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{formatTimestamp(entry.timestamp)}</Badge>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{entry.processingTime}ms</Badge>
                              <Badge variant="outline">{Math.round(entry.confidence * 100)}% confidence</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Input:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded">{entry.input}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Response:</p>
                              <p className="text-sm bg-blue-50 p-2 rounded">{entry.response}</p>
                            </div>
                            {entry.sources && entry.sources.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-600">Sources:</p>
                                <div className="flex gap-1">
                                  {entry.sources.map((source: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {chatLog.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No chat history yet. Start a conversation!</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder pages for other sections */}
          {["facts", "coding", "philosophy", "settings"].includes(currentPage) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {sidebarItems.find((item) => item.id === currentPage)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600">This section is under development. Check back soon for more features!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
