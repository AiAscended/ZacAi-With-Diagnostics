"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { systemManager } from "@/core/system/manager"
import { vocabularyModule } from "@/modules/vocabulary"
import { mathematicsModule } from "@/modules/mathematics"
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
} from "lucide-react"

interface AdminDashboardProps {
  onToggleChat: () => void
}

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [systemStats, setSystemStats] = useState<any>(null)
  const [chatLog, setChatLog] = useState<any[]>([])
  const [vocabData, setVocabData] = useState<any>(null)
  const [mathData, setMathData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 5000)
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

      // Load vocab data
      try {
        const seedWords = vocabularyModule.getSeedWords()
        const learntWords = vocabularyModule.getLearntWords()
        setVocabData({ seedWords, learntWords })
      } catch (error) {
        console.error("Failed to load vocab data:", error)
      }

      // Load math data
      try {
        const mathStats = mathematicsModule.getStats()
        setMathData(mathStats)
      } catch (error) {
        console.error("Failed to load math data:", error)
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
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
              <p className="text-sm text-gray-600">System Management & Analytics</p>
            </div>
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

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vocab">Vocab</TabsTrigger>
            <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
            <TabsTrigger value="chat-log">Chat Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                          {name === "vocab" && <BookOpen className="w-4 h-4 text-blue-600" />}
                          {name === "mathematics" && <Calculator className="w-4 h-4 text-green-600" />}
                          {name === "facts" && <Globe className="w-4 h-4 text-purple-600" />}
                          {name === "coding" && <Code className="w-4 h-4 text-orange-600" />}
                          {name === "philosophy" && <Lightbulb className="w-4 h-4 text-yellow-600" />}
                          {name === "user-info" && <User className="w-4 h-4 text-pink-600" />}
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
          </TabsContent>

          {/* Vocab Tab */}
          <TabsContent value="vocab" className="space-y-6">
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
                    <p className="text-2xl font-bold text-blue-600">{systemStats?.modules?.vocab?.totalQueries || 0}</p>
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
                    <ScrollArea className="h-64 border rounded-lg p-3">
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
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Learnt Words */}
                  <div>
                    <h3 className="font-semibold mb-3">Recently Learnt Words</h3>
                    <ScrollArea className="h-64 border rounded-lg p-3">
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
          </TabsContent>

          {/* Mathematics Tab */}
          <TabsContent value="mathematics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Mathematics Module
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
                      {systemStats?.modules?.mathematics?.learntEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Patterns Learned</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((systemStats?.modules?.mathematics?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Calculations</h3>
                  <div className="space-y-2">
                    {chatLog
                      .filter((entry) => entry.sources?.includes("mathematics"))
                      .slice(0, 10)
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.input}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                            {entry.processingTime}ms
                          </Badge>
                        </div>
                      ))}
                    {chatLog.filter((entry) => entry.sources?.includes("mathematics")).length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No calculations yet. Try asking me to solve a math problem!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same... */}
          <TabsContent value="facts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Facts Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Facts module coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-orange-600" />
                  Coding Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Coding module coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="philosophy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Philosophy Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Philosophy module coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Log Tab */}
          <TabsContent value="chat-log" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Log ({chatLog.length} entries)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {chatLog.map((entry, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {formatTimestamp(entry.timestamp)}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(entry.confidence * 100)}% confidence
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entry.processingTime}ms
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-blue-600">User:</p>
                            <p className="text-sm">{entry.input}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-600">Assistant:</p>
                            <p className="text-sm">
                              {entry.response.substring(0, 200)}
                              {entry.response.length > 200 ? "..." : ""}
                            </p>
                          </div>
                          {entry.sources && entry.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.sources.map((source, sourceIdx) => (
                                <Badge key={sourceIdx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
