"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Settings,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<any>(null)
  const [chatLog, setChatLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      if (!systemManager.isInitialized()) {
        await systemManager.initialize()
      }

      const stats = systemManager.getSystemStats()
      const log = systemManager.getChatLog()

      setSystemStats(stats)
      setChatLog(log)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load system data:", error)
      setLoading(false)
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
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const clearChatLog = () => {
    systemManager.clearChatLog()
    setChatLog([])
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <p className="text-lg font-medium">Loading ZacAI Admin Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Enhanced AI System v2.0 - Management Interface</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              System Online
            </Badge>
            <Button onClick={loadSystemData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
          <TabsTrigger value="facts">Facts</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
          <TabsTrigger value="chat-log">Chat Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalQueries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Success Rate: {Math.round((systemStats?.successRate || 0) * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(systemStats?.averageResponseTime || 0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {Math.round((systemStats?.uptime || 0) / 1000 / 60)} min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Entries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.chatLogEntries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Memory Items: {systemStats?.memoryStats?.totalItems || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats?.modules ? Object.keys(systemStats.modules).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle>Module Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemStats?.modules &&
                  Object.entries(systemStats.modules).map(([name, stats]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {name === "vocabulary" && <BookOpen className="w-5 h-5 text-blue-600" />}
                        {name === "mathematics" && <Calculator className="w-5 h-5 text-green-600" />}
                        {name === "facts" && <Globe className="w-5 h-5 text-purple-600" />}
                        {name === "coding" && <Code className="w-5 h-5 text-orange-600" />}
                        {name === "philosophy" && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                        {name === "user-info" && <User className="w-5 h-5 text-pink-600" />}
                        <div>
                          <p className="font-medium capitalize">{name}</p>
                          <p className="text-sm text-gray-500">{stats.totalEntries || 0} entries</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Vocabulary Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.vocabulary?.totalEntries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Words</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.modules?.vocabulary?.apiCalls || 0}
                    </div>
                    <p className="text-sm text-gray-600">API Lookups</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemStats?.modules?.vocabulary?.cacheHits || 0}
                    </div>
                    <p className="text-sm text-gray-600">Cache Hits</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((systemStats?.modules?.vocabulary?.averageConfidence || 0) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Vocabulary Lookups</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    {systemStats?.modules?.vocabulary?.recentLookups?.map((lookup: any, idx: number) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{lookup.word}</p>
                            <p className="text-sm text-gray-600">{lookup.definition}</p>
                          </div>
                          <Badge variant="outline">{Math.round(lookup.confidence * 100)}%</Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent lookups</p>}
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.modules?.mathematics?.totalCalculations || 0}
                    </div>
                    <p className="text-sm text-gray-600">Calculations</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.mathematics?.teslaCalculations || 0}
                    </div>
                    <p className="text-sm text-gray-600">Tesla Math</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemStats?.modules?.mathematics?.vortexPatterns || 0}
                    </div>
                    <p className="text-sm text-gray-600">Vortex Patterns</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((systemStats?.modules?.mathematics?.accuracy || 0) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Accuracy</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Calculations</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    {systemStats?.modules?.mathematics?.recentCalculations?.map((calc: any, idx: number) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{calc.expression}</p>
                            <p className="text-sm text-gray-600">Result: {calc.result}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              calc.type === "tesla"
                                ? "bg-blue-50 text-blue-700"
                                : calc.type === "vortex"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-green-50 text-green-700"
                            }
                          >
                            {calc.type}
                          </Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent calculations</p>}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Facts Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemStats?.modules?.facts?.totalFacts || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Facts</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.facts?.wikipediaLookups || 0}
                    </div>
                    <p className="text-sm text-gray-600">Wikipedia Lookups</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.modules?.facts?.verifiedFacts || 0}
                    </div>
                    <p className="text-sm text-gray-600">Verified Facts</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((systemStats?.modules?.facts?.reliability || 0) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Reliability</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Fact Lookups</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    {systemStats?.modules?.facts?.recentLookups?.map((fact: any, idx: number) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{fact.topic}</p>
                            <p className="text-sm text-gray-600">{fact.summary}</p>
                            <p className="text-xs text-gray-500 mt-1">Source: {fact.source}</p>
                          </div>
                          <Badge variant="outline">{Math.round(fact.confidence * 100)}%</Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent lookups</p>}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coding Tab */}
        <TabsContent value="coding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-orange-600" />
                Coding Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemStats?.modules?.coding?.totalQueries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Code Queries</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.coding?.nextjsQueries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Next.js Queries</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.modules?.coding?.examplesProvided || 0}
                    </div>
                    <p className="text-sm text-gray-600">Examples Given</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((systemStats?.modules?.coding?.helpfulness || 0) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Helpfulness</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Coding Queries</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    {systemStats?.modules?.coding?.recentQueries?.map((query: any, idx: number) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{query.topic}</p>
                            <p className="text-sm text-gray-600">{query.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Language: {query.language}</p>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {query.type}
                          </Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent queries</p>}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Philosophy Tab */}
        <TabsContent value="philosophy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Philosophy Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {systemStats?.modules?.philosophy?.totalConcepts || 0}
                    </div>
                    <p className="text-sm text-gray-600">Concepts</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemStats?.modules?.philosophy?.discussions || 0}
                    </div>
                    <p className="text-sm text-gray-600">Discussions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.philosophy?.arguments || 0}
                    </div>
                    <p className="text-sm text-gray-600">Arguments</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((systemStats?.modules?.philosophy?.depth || 0) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Depth Score</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Philosophy Discussions</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    {systemStats?.modules?.philosophy?.recentDiscussions?.map((discussion: any, idx: number) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{discussion.topic}</p>
                            <p className="text-sm text-gray-600">{discussion.summary}</p>
                            <p className="text-xs text-gray-500 mt-1">School: {discussion.school}</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {discussion.complexity}
                          </Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent discussions</p>}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Log Tab */}
        <TabsContent value="chat-log" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  Chat Log ({chatLog.length} entries)
                </div>
                <Button onClick={clearChatLog} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Log
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {chatLog.map((entry, idx) => (
                    <div key={entry.id || idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{new Date(entry.timestamp).toLocaleTimeString()}</Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {Math.round(entry.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {entry.processingTime}ms
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">User:</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{entry.input}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Assistant:</p>
                          <p className="text-sm bg-blue-50 p-2 rounded">{entry.response}</p>
                        </div>

                        {entry.sources && entry.sources.length > 0 && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Sources:</p>
                            {entry.sources.map((source: string, sourceIdx: number) => (
                              <Badge key={sourceIdx} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLog.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No chat log entries yet</p>
                      <p className="text-sm">Start a conversation to see entries here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
