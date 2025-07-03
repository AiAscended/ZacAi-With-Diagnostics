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
  Settings,
  Home,
  FileText,
  Cog,
  Menu,
  X,
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

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("overview")
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
    const interval = setInterval(loadSystemData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      setRefreshing(true)

      // Load system stats
      const stats = systemManager.getSystemStats()
      const log = systemManager.getChatLog()

      setSystemStats(stats)
      setChatLog(log)

      // Load vocabulary data
      try {
        const seedWords = vocabularyModule.getSeedWords()
        const learntWords = vocabularyModule.getLearntWords()
        setVocabData({ seedWords, learntWords })
      } catch (error) {
        console.error("Failed to load vocab data:", error)
      }

      // Load maths data
      try {
        const seedConcepts = mathematicsModule.getSeedConcepts()
        const learntConcepts = mathematicsModule.getLearntConcepts()
        const mathStats = mathematicsModule.getStats()
        setMathData({ seedConcepts, learntConcepts, stats: mathStats })
      } catch (error) {
        console.error("Failed to load maths data:", error)
      }

      // Load user memory data
      try {
        const memoryStats = userMemory.getStats()
        const personalInfo = userMemory.getPersonalInfo()
        setUserMemoryData({ stats: memoryStats, personalInfo })
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

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-white border-r border-gray-200`}>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {sidebarItems.find((item) => item.id === currentPage)?.label || "Dashboard"}
              </h1>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                {systemStats?.initialized ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSystemData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onToggleChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentPage === "overview" && (
            <div className="space-y-6">
              {/* System Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Vocabulary Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {systemStats?.modules?.vocabulary?.totalQueries || 0}
                      </p>
                      <p className="text-sm text-gray-600">Word Lookups</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Object.keys(vocabData?.seedWords || {}).length}
                      </p>
                      <p className="text-sm text-gray-600">Seed Words</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {Object.keys(vocabData?.learntWords || {}).length}
                      </p>
                      <p className="text-sm text-gray-600">Learnt Words</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Seed Words */}
                    <div>
                      <h3 className="font-semibold mb-3">Seed Words</h3>
                      <ScrollArea className="h-96 border rounded-lg p-3">
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
                                {data.frequency && (
                                  <p className="text-xs text-gray-500">Frequency: {data.frequency}/5</p>
                                )}
                                {data.synonyms && data.synonyms.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Synonyms: {data.synonyms.slice(0, 3).join(", ")}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Learnt Words */}
                    <div>
                      <h3 className="font-semibold mb-3">Recently Learnt Words</h3>
                      <ScrollArea className="h-96 border rounded-lg p-3">
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
                                <p className="text-xs text-gray-500">
                                  Confidence: {Math.round(entry.confidence * 100)}%
                                </p>
                              </div>
                            ))}
                          {(!vocabData?.learntWords || Object.keys(vocabData.learntWords).length === 0) && (
                            <p className="text-gray-500 text-center py-8">
                              No learnt words yet. Try asking me to define a word!
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === "maths" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    Maths Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {systemStats?.modules?.mathematics?.totalQueries || 0}
                      </p>
                      <p className="text-sm text-gray-600">Calculations</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Object.keys(mathData?.seedConcepts || {}).length}
                      </p>
                      <p className="text-sm text-gray-600">Seed Concepts</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {Object.keys(mathData?.learntConcepts || {}).length}
                      </p>
                      <p className="text-sm text-gray-600">Learnt Concepts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Seed Concepts */}
                    <div>
                      <h3 className="font-semibold mb-3">Seed Concepts</h3>
                      <ScrollArea className="h-96 border rounded-lg p-3">
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
                                  <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded">
                                    {concept.formula}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Category: {concept.category}</p>
                                {concept.examples && (
                                  <p className="text-xs text-gray-500">{concept.examples.length} examples</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Learnt Concepts */}
                    <div>
                      <h3 className="font-semibold mb-3">Recently Learnt Concepts</h3>
                      <ScrollArea className="h-96 border rounded-lg p-3">
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
                                <p className="text-xs text-gray-500">
                                  Confidence: {Math.round(entry.confidence * 100)}%
                                </p>
                              </div>
                            ))}
                          {(!mathData?.learntConcepts || Object.keys(mathData.learntConcepts).length === 0) && (
                            <p className="text-gray-500 text-center py-8">
                              No learnt concepts yet. Try asking me to solve a math problem!
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === "user-memory" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    User Memory System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{userMemoryData?.stats?.totalEntries || 0}</p>
                      <p className="text-sm text-gray-600">Total Memories</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{userMemoryData?.stats?.byType?.personal || 0}</p>
                      <p className="text-sm text-gray-600">Personal Info</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {userMemoryData?.stats?.byType?.preference || 0}
                      </p>
                      <p className="text-sm text-gray-600">Preferences</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round((userMemoryData?.stats?.averageConfidence || 0) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Confidence</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Personal Information</h3>
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
                          No personal information stored yet. Try introducing yourself!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === "chat-log" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Chat History
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
                  <Settings className="w-5 h-5" />
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
