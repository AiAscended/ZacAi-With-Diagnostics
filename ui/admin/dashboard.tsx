"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { systemManager } from "@/core/system/manager"
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
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      setRefreshing(true)
      const stats = systemManager.getSystemStats()
      const log = systemManager.getChatLog()

      setSystemStats(stats)
      setChatLog(log)
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.vocabulary?.totalQueries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Word Lookups</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {systemStats?.modules?.vocabulary?.learntEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Words Learned</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((systemStats?.modules?.vocabulary?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Word Lookups</h3>
                  <div className="space-y-2">
                    {chatLog
                      .filter((entry) => entry.sources?.includes("vocabulary"))
                      .slice(0, 5)
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.input}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            {Math.round(entry.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
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
                      .slice(0, 5)
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {systemStats?.modules?.facts?.totalQueries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Fact Lookups</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.facts?.learntEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Facts Cached</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((systemStats?.modules?.facts?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Fact Queries</h3>
                  <div className="space-y-2">
                    {chatLog
                      .filter((entry) => entry.sources?.includes("facts"))
                      .slice(0, 5)
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.input}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            Wikipedia
                          </Badge>
                        </div>
                      ))}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {systemStats?.modules?.coding?.totalQueries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Code Queries</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.coding?.learntEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Examples Learned</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((systemStats?.modules?.coding?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Help Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Coding Questions</h3>
                  <div className="space-y-2">
                    {chatLog
                      .filter((entry) => entry.sources?.includes("coding"))
                      .slice(0, 5)
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.input}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                            Next.js
                          </Badge>
                        </div>
                      ))}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {systemStats?.modules?.philosophy?.totalQueries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Philosophy Queries</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.modules?.philosophy?.learntEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Concepts Learned</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((systemStats?.modules?.philosophy?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Reasoning Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Philosophy Discussions</h3>
                  <div className="space-y-2">
                    {chatLog
                      .filter((entry) => entry.sources?.includes("philosophy"))
                      .slice(0, 5)
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.input}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                            Reasoning
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
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
