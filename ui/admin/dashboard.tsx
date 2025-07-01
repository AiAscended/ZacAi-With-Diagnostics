"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { systemManager } from "@/core/system/manager"
import {
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Database,
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  MessageCircle,
  Settings,
  TrendingUp,
} from "lucide-react"
import { formatRelativeTime } from "@/utils/formatters"

interface AdminDashboardProps {
  onToggleChat: () => void
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  learning: any
  cognitive: any
  uptime: number
  totalQueries: number
  averageResponseTime: number
}

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Loading Admin Dashboard</h2>
            <p className="text-gray-600">Gathering system statistics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">ZacAI Admin Dashboard</h1>
              <p className="text-sm text-gray-300">Enhanced AI System - Management & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExport} className="bg-white/10 border-white/20 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={loadStats} className="bg-white/10 border-white/20 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={onToggleChat} className="bg-white/10 border-white/20 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex-shrink-0 p-6 bg-gray-50">
        <div className="grid grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats?.modules?.vocabulary?.learntEntries || 0}</div>
              <div className="text-sm text-gray-500">Vocabulary</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calculator className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats?.modules?.mathematics?.learntEntries || 0}</div>
              <div className="text-sm text-gray-500">Mathematics</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{stats?.modules?.facts?.learntEntries || 0}</div>
              <div className="text-sm text-gray-500">Facts</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Code className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <div className="text-2xl font-bold">{stats?.modules?.coding?.learntEntries || 0}</div>
              <div className="text-sm text-gray-500">Coding</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{stats?.modules?.philosophy?.learntEntries || 0}</div>
              <div className="text-sm text-gray-500">Philosophy</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{stats?.totalQueries || 0}</div>
              <div className="text-sm text-gray-500">Total Queries</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {stats?.initialized ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uptime</span>
                    <span className="text-sm">{formatRelativeTime(Date.now() - (stats?.uptime || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <span className="text-sm">{Math.round(stats?.averageResponseTime || 0)}ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Entries</span>
                    <span className="font-mono">
                      {Object.values(stats?.modules || {}).reduce(
                        (sum: number, mod: any) => sum + (mod.learntEntries || 0),
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Modules</span>
                    <span className="font-mono">{Object.keys(stats?.modules || {}).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Learning Rate</span>
                    <span className="text-sm">
                      {stats?.learning?.learningRate ? `${stats.learning.learningRate.toFixed(2)}/hr` : "0/hr"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Learning</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {name === "vocabulary" && <BookOpen className="w-5 h-5" />}
                      {name === "mathematics" && <Calculator className="w-5 h-5" />}
                      {name === "facts" && <Globe className="w-5 h-5" />}
                      {name === "coding" && <Code className="w-5 h-5" />}
                      {name === "philosophy" && <Lightbulb className="w-5 h-5" />}
                      {name === "user-info" && <Brain className="w-5 h-5" />}
                      {name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Queries</span>
                      <span className="font-mono">{(moduleStats as any)?.totalQueries || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-mono">{Math.round(((moduleStats as any)?.successRate || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Learnt Entries</span>
                      <span className="font-mono">{(moduleStats as any)?.learntEntries || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Response</span>
                      <span className="font-mono">{Math.round((moduleStats as any)?.averageResponseTime || 0)}ms</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-gray-600">Detailed performance metrics and analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                  <p className="text-gray-600">Advanced system settings and configuration options coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
