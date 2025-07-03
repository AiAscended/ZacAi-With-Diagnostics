"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { systemManager } from "@/core/system/manager"
import { userMemory } from "@/core/memory/user-memory"
import {
  Brain,
  Database,
  Activity,
  Users,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  MessageSquare,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react"

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<any>(null)
  const [chatLog, setChatLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const stats = systemManager.getSystemStats()
      const log = systemManager.getChatLog()

      setSystemStats(stats)
      setChatLog(log)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
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
    if (confirm("Are you sure you want to clear the chat log?")) {
      systemManager.clearChatLog()
      setChatLog([])
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            ZacAI Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">System monitoring and management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{systemStats?.totalQueries || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((systemStats?.successRate || 0) * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(systemStats?.uptime || 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
          <TabsTrigger value="chat-log">Chat Log</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <Badge variant="secondary">{Math.round(systemStats?.averageResponseTime || 0)}ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Responses</span>
                    <Badge variant="secondary">{systemStats?.successfulResponses || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Responses</span>
                    <Badge variant="destructive">{systemStats?.failedResponses || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Chat Log Entries</span>
                    <Badge variant="secondary">{systemStats?.chatLogEntries || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Memory Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Entries</span>
                    <Badge variant="secondary">{systemStats?.memoryStats?.totalEntries || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Info</span>
                    <Badge variant="secondary">{systemStats?.memoryStats?.personalEntries || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferences</span>
                    <Badge variant="secondary">{systemStats?.memoryStats?.preferenceEntries || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversations</span>
                    <Badge variant="secondary">{systemStats?.memoryStats?.conversationCount || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemStats?.modules &&
              Object.entries(systemStats.modules).map(([name, stats]: [string, any]) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {name === "vocabulary" && <BookOpen className="w-5 h-5" />}
                      {name === "mathematics" && <Calculator className="w-5 h-5" />}
                      {name === "facts" && <Globe className="w-5 h-5" />}
                      {name === "coding" && <Code className="w-5 h-5" />}
                      {name === "philosophy" && <Lightbulb className="w-5 h-5" />}
                      {name === "user-info" && <Users className="w-5 h-5" />}
                      {name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Queries</span>
                        <Badge variant="secondary">{stats.totalQueries || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <Badge variant="secondary">{Math.round((stats.successRate || 0) * 100)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Learnt Entries</span>
                        <Badge variant="secondary">{stats.learntEntries || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response</span>
                        <Badge variant="secondary">{Math.round(stats.averageResponseTime || 0)}ms</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Vocabulary Module Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Vocabulary module statistics and recent lookups</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {systemStats?.modules?.vocabulary?.totalQueries || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Lookups</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((systemStats?.modules?.vocabulary?.successRate || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {systemStats?.modules?.vocabulary?.learntEntries || 0}
                  </p>
                  <p className="text-sm text-gray-600">Words Learned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(systemStats?.modules?.vocabulary?.averageResponseTime || 0)}ms
                  </p>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mathematics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Mathematics Module Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Mathematics module statistics including Tesla math and calculations</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {systemStats?.modules?.mathematics?.totalQueries || 0}
                  </p>
                  <p className="text-sm text-gray-600">Calculations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((systemStats?.modules?.mathematics?.successRate || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {systemStats?.modules?.mathematics?.learntEntries || 0}
                  </p>
                  <p className="text-sm text-gray-600">Patterns Learned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(systemStats?.modules?.mathematics?.averageResponseTime || 0)}ms
                  </p>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat-log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Log ({chatLog.length} entries)
                </div>
                <Button onClick={clearChatLog} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Log
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {chatLog.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{new Date(entry.timestamp).toLocaleString()}</Badge>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{entry.processingTime}ms</Badge>
                          <Badge
                            variant={
                              entry.confidence > 0.7 ? "default" : entry.confidence > 0.4 ? "secondary" : "destructive"
                            }
                          >
                            {Math.round(entry.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Input:</p>
                          <p className="text-sm">{entry.input}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Response:</p>
                          <p className="text-sm">{entry.response.substring(0, 200)}...</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.sources.map((source: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                User Memory System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{systemStats?.memoryStats?.totalEntries || 0}</p>
                    <p className="text-sm text-gray-600">Total Memories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {systemStats?.memoryStats?.personalEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Personal Info</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {systemStats?.memoryStats?.preferenceEntries || 0}
                    </p>
                    <p className="text-sm text-gray-600">Preferences</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {systemStats?.memoryStats?.conversationCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Conversations</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Personal Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{userMemory.getPersonalSummary()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
